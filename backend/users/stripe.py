import json
import logging
from datetime import datetime
from typing import Any, Iterable, Optional

import stripe
from django.http import HttpResponse, JsonResponse
from django.utils import timezone
from django.views.decorators.csrf import csrf_exempt
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated

from stockzAI import settings
from stockzAI.common.response import api_json_response
from .models import Product, Purchase, Subscription, User

STRIPE_API_KEY = settings.STRIPE_API_KEY or ""
STRIPE_ENDPOINT_SECRET = settings.STRIPE_ENDPOINT_SECRET or ""

stripe.api_key = STRIPE_API_KEY
stripe.api_version = "2025-10-29.clover"

logger = logging.getLogger(__name__)

if not STRIPE_API_KEY:
    logger.warning("STRIPE_API_KEY is not configured. Stripe operations will not execute.")


OBJECT_DEMO_CUSTOMER_CREATED = {
    "id": "cus_123456789",
    "object": "customer",
    "email": "customer@example.com",
    "name": "Example Customer",
    "metadata": {"permissions": '["company_search:all"]'},
}

OBJECT_DEMO_CHECKOUT_SESSION_COMPLETED = {
    "id": "cs_test_a1B2c3d4",
    "object": "checkout.session",
    "mode": "subscription",
    "customer": "cus_123456789",
    "subscription": "sub_123456789",
    "payment_intent": None,
    "status": "complete",
    "metadata": {},
    "amount_total": 2000,
    "currency": "usd",
}

OBJECT_DEMO_CUSTOMER_SUBSCRIPTION_UPDATED = {
    "id": "sub_123456789",
    "object": "subscription",
    "customer": "cus_123456789",
    "status": "active",
    "cancel_at_period_end": False,
    "current_period_end": 1893456000,
    "items": {
        "object": "list",
        "data": [
            {
                "id": "si_123456789",
                "price": {
                    "id": "price_123456789",
                    "object": "price",
                    "product": "prod_123456789",
                    "currency": "usd",
                    "recurring": {"interval": "month"},
                    "nickname": "Starter Plan Monthly",
                    "metadata": {},
                },
            }
        ],
    },
}

OBJECT_DEMO_PRODUCT_CREATED = {
    "id": "prod_123456789",
    "object": "product",
    "name": "Starter Plan",
    "description": "Monthly access to StockzAI Premium",
    "active": True,
    "metadata": {"name": "premium_plan", "permissions": '["company_search:all"]'},
}

OBJECT_DEMO_PRICE_CREATED = {
    "id": "price_123456789",
    "object": "price",
    "product": "prod_123456789",
    "nickname": "Starter Plan Monthly",
    "unit_amount": 2000,
    "currency": "usd",
    "active": True,
    "recurring": {"interval": "month"},
    "metadata": {"name": "premium_plan"},
}


def _timestamp_to_datetime(value: Optional[int]) -> Optional[datetime]:
    if not value:
        return None
    try:
        return datetime.fromtimestamp(int(value), tz=timezone.utc)
    except (TypeError, ValueError):
        logger.warning("Unable to convert timestamp '%s' to datetime", value)
        return None


def _parse_permissions(metadata: dict[str, Any]) -> list[str]:
    raw_permissions = metadata.get("permissions")
    if not raw_permissions:
        return []
    if isinstance(raw_permissions, list):
        return [str(item) for item in raw_permissions if item]
    if isinstance(raw_permissions, str):
        try:
            parsed = json.loads(raw_permissions)
            if isinstance(parsed, list):
                return [str(item) for item in parsed if item]
        except json.JSONDecodeError:
            return [part.strip() for part in raw_permissions.split(",") if part.strip()]
    return []


def util_verify_signature(request) -> Optional[dict[str, Any]]:
    payload = request.body

    try:
        if STRIPE_ENDPOINT_SECRET:
            sig_header = request.META['HTTP_STRIPE_SIGNATURE']
            event = stripe.Webhook.construct_event(payload, sig_header, STRIPE_ENDPOINT_SECRET)
        else:
            return None
    except ValueError:
        logger.exception("Invalid payload for Stripe webhook.")
        return None
    except stripe.error.SignatureVerificationError as exc:
        logger.warning("Stripe webhook signature verification failed: %s", exc)
        return None

    return event


def util_get_user(stripe_customer_id: str) -> Optional[User]:
    if not stripe_customer_id:
        return None

    user = User.objects.filter(stripe_customer_id=stripe_customer_id).first()
    if user:
        return user

    try:
        customer = stripe.Customer.retrieve(stripe_customer_id) if STRIPE_API_KEY else None
    except stripe.error.StripeError as exc:
        logger.warning("Failed to fetch Stripe customer %s: %s", stripe_customer_id, exc)
        return None

    email = (customer or {}).get("email") if customer else None
    if not email:
        logger.warning("Stripe customer %s has no email field", stripe_customer_id)
        return None

    user = User.objects.filter(email=email).first()
    if not user:
        logger.warning("Local user with email %s not found for Stripe ID %s", email, stripe_customer_id)
        return None

    user.stripe_customer_id = stripe_customer_id
    user.save(update_fields=["stripe_customer_id"])
    logger.info("Linked Stripe customer %s to user %s", stripe_customer_id, user.id)
    return user


def webhook_customer_created(customer: dict[str, Any]) -> bool:
    email = customer.get("email")
    stripe_id = customer.get("id")

    if not email or not stripe_id:
        logger.warning("Stripe customer.created missing email or id.")
        return False

    try:
        user = User.objects.get(email=email)
    except User.DoesNotExist:
        logger.error("Stripe user with email %s and ID %s does not exist locally.", email, stripe_id)
        return False

    user.stripe_customer_id = stripe_id
    user.save(update_fields=["stripe_customer_id"])
    return True


def _resolve_product_by_price(price: dict[str, Any]) -> Optional[Product]:
    price_id = price.get("id")
    product_id = price.get("product")
    nickname = price.get("nickname")
    metadata = price.get("metadata") or {}
    custom_name = metadata.get("name") or nickname

    lookup_order = [
        {"stripe_price_id": price_id} if price_id else None,
        {"stripe_product_id": product_id} if product_id else None,
        {"name": custom_name} if custom_name else None,
    ]

    for criteria in lookup_order:
        if not criteria:
            continue
        product = Product.objects.filter(**criteria).first()
        if product:
            return product
    return None


def _ensure_product_from_price(price: dict[str, Any]) -> Product:
    product = _resolve_product_by_price(price)
    if product:
        return product

    metadata = price.get("metadata") or {}
    product_id = price.get("product") or ""
    name = metadata.get("name") or price.get("nickname") or product_id or "Stripe product"

    product = Product.objects.create(
        name=name,
        stripe_product_id=product_id or "",
        stripe_price_id=price.get("id") or "",
        verbose_name=price.get("nickname") or name,
        description="",
        is_active=bool(price.get("active", True)),
    )
    permissions = _parse_permissions(metadata)
    if permissions:
        product.permissions = permissions
        product.save(update_fields=["permissions"])
    return product


def webhook_checkout_session_completed(session: dict[str, Any]) -> bool:
    customer_id = session.get("customer")
    session_id = session.get("id")
    if not customer_id:
        logger.warning("Stripe checkout.session.completed missing customer for session %s", session_id)
        return False

    user = util_get_user(customer_id)
    if not user:
        logger.warning("User %s not resolved for checkout session %s", customer_id, session_id)
        return False

    handled_item = False
    line_items: Iterable[dict[str, Any]] = []

    try:
        response = stripe.checkout.Session.list_line_items(session_id, limit=100)
        if hasattr(response, "data"):
            line_items = response.data  # type: ignore[attr-defined]
        elif isinstance(response, dict):
            line_items = response.get("data", []) or []
    except stripe.error.StripeError as exc:
        logger.exception("Failed to list Stripe Checkout line items for %s: %s", session_id, exc)
        return False

    for item in line_items:
        price = item.get("price") or {}
        if not price:
            logger.warning("Stripe line item missing price object: %s", item)
            continue

        product = _ensure_product_from_price(price)

        recurring = price.get("recurring")
        if recurring:
            subscription_id = session.get("subscription")
            subscription_obj = None
            if subscription_id:
                try:
                    subscription_obj = stripe.Subscription.retrieve(subscription_id)
                except stripe.error.StripeError as exc:
                    logger.exception("Failed to retrieve Stripe subscription %s: %s", subscription_id, exc)

            subscription, _created = Subscription.objects.get_or_create(
                user=user,
                defaults={
                    "product": product,
                    "provider": "stripe",
                    "provider_subscription_id": subscription_id or "",
                },
            )
            subscription.product = product
            subscription.provider = "stripe"
            if subscription_id:
                subscription.provider_subscription_id = subscription_id

            if subscription_obj:
                status = subscription_obj.get("status")
                subscription.is_active = status in {"trialing", "active", "past_due"}
                subscription.cancel_at_period_end = bool(subscription_obj.get("cancel_at_period_end"))
                expires_at = _timestamp_to_datetime(subscription_obj.get("current_period_end"))
                if expires_at:
                    subscription.expires_at = expires_at
            else:
                subscription.is_active = True
                subscription.cancel_at_period_end = False
            subscription.save()
        else:
            payment_reference = session.get("payment_intent") or session_id
            Purchase.objects.update_or_create(
                user=user,
                product=product,
                defaults={
                    "provider": "stripe",
                    "provider_transaction_id": payment_reference or "",
                },
            )
        handled_item = True

    return handled_item


def webhook_subscription_updated(subscription_obj: dict[str, Any]) -> bool:
    subscription_id = subscription_obj.get("id")
    customer_id = subscription_obj.get("customer")
    if not subscription_id or not customer_id:
        logger.warning("Stripe subscription event missing id or customer.")
        return False

    user = util_get_user(customer_id)
    if not user:
        logger.warning("User %s not resolved for subscription %s", customer_id, subscription_id)
        return False

    items = subscription_obj.get("items", {}).get("data", [])
    if not items:
        logger.warning("Stripe subscription %s has no items.", subscription_id)
        return False

    handled = False
    for item in items:
        price = item.get("price") or {}
        if not price:
            continue

        product = _ensure_product_from_price(price)
        subscription, _ = Subscription.objects.get_or_create(
            user=user,
            defaults={
                "product": product,
                "provider": "stripe",
                "provider_subscription_id": subscription_id,
            },
        )
        subscription.product = product
        subscription.provider = "stripe"
        subscription.provider_subscription_id = subscription_id

        status = subscription_obj.get("status")
        subscription.is_active = status in {"trialing", "active", "past_due"}
        subscription.cancel_at_period_end = bool(subscription_obj.get("cancel_at_period_end"))

        expires_at = _timestamp_to_datetime(subscription_obj.get("current_period_end"))
        if expires_at:
            subscription.expires_at = expires_at

        if status in {"canceled", "unpaid", "incomplete_expired"}:
            ended_at = _timestamp_to_datetime(subscription_obj.get("ended_at"))
            subscription.is_active = False
            subscription.expires_at = ended_at or expires_at or timezone.now()

        subscription.save()
        handled = True

    return handled


def webhook_product_created_or_updated(product_obj: dict[str, Any]) -> bool:
    stripe_product_id = product_obj.get("id")
    metadata = product_obj.get("metadata") or {}
    name = metadata.get("name") or product_obj.get("name")
    if not name:
        logger.warning("Stripe product event missing name metadata.")
        return False

    product = None
    if stripe_product_id:
        product = Product.objects.filter(stripe_product_id=stripe_product_id).first()
    if not product:
        product = Product.objects.filter(name=name).first()

    if not product:
        product = Product(name=name)

    product.stripe_product_id = stripe_product_id or product.stripe_product_id
    product.verbose_name = product_obj.get("name") or product.verbose_name
    product.description = product_obj.get("description") or product.description
    product.is_active = bool(product_obj.get("active", True))

    permissions = _parse_permissions(metadata)
    if permissions:
        product.permissions = permissions

    product.save()
    return True


def webhook_price_created_or_updated(price_obj: dict[str, Any]) -> bool:
    price_id = price_obj.get("id")
    product_id = price_obj.get("product")
    if not price_id:
        logger.warning("Stripe price event missing id.")
        return False

    product = None
    if product_id:
        product = Product.objects.filter(stripe_product_id=product_id).first()
    if not product:
        metadata = price_obj.get("metadata") or {}
        name = metadata.get("name") or price_obj.get("nickname")
        if name:
            product = Product.objects.filter(name=name).first()
        if not product:
            product = Product(name=name or price_id)

    product.stripe_product_id = product_id or product.stripe_product_id
    product.stripe_price_id = price_id
    nickname = price_obj.get("nickname")
    if nickname and not product.verbose_name:
        product.verbose_name = nickname
    product.is_active = bool(price_obj.get("active", True))

    permissions = _parse_permissions(price_obj.get("metadata") or {})
    if permissions:
        product.permissions = permissions

    product.save()
    return True


@csrf_exempt
def stripe_webhook(request):
    """
    Handle Stripe webhook events with signature verification.
    """
    try:
        event = util_verify_signature(request)
        if not event:
            return JsonResponse({"error": "Invalid signature"}, status=403)

        event_type = event.get("type")
        data = (event.get("data") or {}).get("object", {})

        logger.info("Stripe event: %s", event_type)

        out = False
        if event_type == "customer.created":
            out = webhook_customer_created(data)
        elif event_type == "checkout.session.completed":
            out = webhook_checkout_session_completed(data)
        elif event_type in {"customer.subscription.created", "customer.subscription.updated", "customer.subscription.deleted"}:
            out = webhook_subscription_updated(data)
        elif event_type in {"product.created", "product.updated"}:
            out = webhook_product_created_or_updated(data)
        elif event_type in {"price.created", "price.updated"}:
            out = webhook_price_created_or_updated(data)

        return HttpResponse("OK" if out else "Ignored", status=200)

    except Exception as exc:
        logger.exception("Stripe webhook failed")
        return JsonResponse({"error": str(exc)}, status=500)


def _parse_plan_name(payload: dict[str, Any]) -> Optional[str]:
    if not isinstance(payload, dict):
        return None
    plan_name = payload.get("plan_name") or payload.get("plan")
    if isinstance(plan_name, str):
        return plan_name.strip()
    return None


def _find_user_subscription(user: User, plan_name: Optional[str]) -> Optional[Subscription]:
    queryset = Subscription.objects.filter(user=user)
    if plan_name:
        queryset = queryset.filter(product__name=plan_name)
    subscription = queryset.filter(is_active=True).first()
    if subscription:
        return subscription
    return queryset.first()


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def view_cancel_plan(request):
    try:
        payload = json.loads(request.body or "{}")
    except json.JSONDecodeError:
        return api_json_response(error="Invalid payload.", status=400)

    plan_name = _parse_plan_name(payload)
    if not plan_name:
        return api_json_response(error="Plan name is required.", status=400)

    subscription = _find_user_subscription(request.user, plan_name)
    if not subscription or subscription.product.name != plan_name:
        return api_json_response(error="Subscription not found.", status=404)

    if subscription.cancel_at_period_end:
        return api_json_response(
            msg={
                "cancel_at_period_end": True,
                "provider_subscription_id": subscription.provider_subscription_id,
            }
        )

    if subscription.provider.lower() == "stripe" and subscription.provider_subscription_id:
        try:
            stripe.Subscription.modify(subscription.provider_subscription_id, cancel_at_period_end=True)
        except stripe.error.StripeError as exc:
            logger.exception(
                "Failed to cancel Stripe subscription %s", subscription.provider_subscription_id
            )
            return api_json_response(error=f"Failed to cancel subscription: {exc}", status=400)

    subscription.cancel_at_period_end = True
    subscription.save(update_fields=["cancel_at_period_end"])

    return api_json_response(
        msg={
            "cancel_at_period_end": subscription.cancel_at_period_end,
            "provider_subscription_id": subscription.provider_subscription_id,
        }
    )


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def view_resume_plan(request):
    try:
        payload = json.loads(request.body or "{}")
    except json.JSONDecodeError:
        return api_json_response(error="Invalid payload.", status=400)

    plan_name = _parse_plan_name(payload)
    if not plan_name:
        return api_json_response(error="Plan name is required.", status=400)

    subscription = _find_user_subscription(request.user, plan_name)
    if not subscription or subscription.product.name != plan_name:
        return api_json_response(error="Subscription not found.", status=404)

    if not subscription.cancel_at_period_end:
        return api_json_response(
            msg={
                "cancel_at_period_end": subscription.cancel_at_period_end,
                "provider_subscription_id": subscription.provider_subscription_id,
            }
        )

    if subscription.provider.lower() == "stripe" and subscription.provider_subscription_id:
        try:
            stripe.Subscription.modify(
                subscription.provider_subscription_id,
                cancel_at_period_end=False,
                prorate=False,
            )
        except stripe.error.StripeError as exc:
            logger.exception(
                "Failed to resume Stripe subscription %s", subscription.provider_subscription_id
            )
            return api_json_response(error=f"Failed to resume subscription: {exc}", status=400)

    subscription.cancel_at_period_end = False
    subscription.is_active = True
    subscription.save(update_fields=["cancel_at_period_end", "is_active"])

    return api_json_response(
        msg={
            "cancel_at_period_end": subscription.cancel_at_period_end,
            "provider_subscription_id": subscription.provider_subscription_id,
        }
    )
