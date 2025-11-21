import json
import logging
from datetime import datetime
from decimal import Decimal, InvalidOperation
from typing import Any, Iterable, Optional

import stripe
from django.http import HttpResponse, JsonResponse
from django.utils import timezone
from django.views.decorators.csrf import csrf_exempt
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated

from stockzAI import settings
from stockzAI.common.response import api_json_response
from django.utils.dateparse import parse_datetime
from .models import Pricing, Product, Purchase, Subscription, User
from .meta_capi import send_purchase_event

STRIPE_API_KEY = settings.STRIPE_API_KEY or ""
STRIPE_ENDPOINT_SECRET = settings.STRIPE_ENDPOINT_SECRET or ""

stripe.api_key = STRIPE_API_KEY

logger = logging.getLogger(__name__)

if not STRIPE_API_KEY:
    logger.warning("STRIPE_API_KEY is not configured. Stripe operations will not execute.")

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
    except stripe.SignatureVerificationError as exc:
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
    except stripe.StripeError as exc:
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


def _normalise_interval(recurring: Optional[dict[str, Any]]) -> str:
    interval = (recurring or {}).get("interval")
    if not interval:
        return Pricing.INTERVAL_ONETIME
    interval = str(interval).lower()
    mapping = {
        "day": Pricing.INTERVAL_DAILY,
        "week": Pricing.INTERVAL_WEEKLY,
        "month": Pricing.INTERVAL_MONTHLY,
        "year": Pricing.INTERVAL_YEARLY,
    }
    return mapping.get(interval, Pricing.INTERVAL_ONETIME)


def _decimal_from_amount(price: dict[str, Any]) -> Decimal:
    raw_decimal = price.get("unit_amount_decimal")
    if raw_decimal is not None:
        try:
            return (Decimal(raw_decimal) / Decimal("100")).quantize(Decimal("0.01"))
        except (InvalidOperation, ZeroDivisionError):
            logger.warning("Invalid unit_amount_decimal on Stripe price %s", price.get("id"))
    raw_amount = price.get("unit_amount")
    if raw_amount is not None:
        try:
            return (Decimal(raw_amount) / Decimal("100")).quantize(Decimal("0.01"))
        except (InvalidOperation, ZeroDivisionError):
            logger.warning("Invalid unit_amount on Stripe price %s", price.get("id"))
    return Decimal("0.00")


def _ensure_product(price: dict[str, Any]) -> Product:
    product = None
    remote_product = {}
    stripe_product_id = price.get("product")
    product = Product.objects.filter(stripe_product_id=stripe_product_id).first()

    if product:
        return product
    
    if not product and stripe_product_id and STRIPE_API_KEY:
        try:
            remote_product = stripe.Product.retrieve(stripe_product_id)
            product_metadata = remote_product.get("metadata") or {}
            name = product_metadata.get("name")
            verbose_name = remote_product.get("name") or name
            product_description = remote_product.get("description")
            product_active = remote_product.get("active")
            product = Product.objects.filter(name=name).first()
        except stripe.StripeError as exc:
            logger.debug("Could not fetch Stripe product %s: %s", stripe_product_id, exc)
    
    if not product:
        product = Product(name=name)

    if stripe_product_id:
        product.stripe_product_id = stripe_product_id
    if verbose_name:
        product.verbose_name = verbose_name
    if product_description and not product.description:
        product.description = product_description
    product.is_active = product_active

    product.save()
    return product


def _ensure_pricing(price: dict[str, Any], product: Product) -> Pricing:
    stripe_price_id = price.get("id")
    name = price.get("nickname") or product.verbose_name or product.name
    recurring = price.get("recurring") or {}
    interval = _normalise_interval(recurring)
    interval_count = int((recurring.get("interval_count") or 1) or 1)
    amount = _decimal_from_amount(price)
    currency = (price.get("currency") or "usd").lower()
    active = bool(price.get("active", True))

    pricing = None
    if stripe_price_id:
        pricing = Pricing.objects.filter(stripe_price_id=stripe_price_id).first()
    if not pricing:
        pricing = Pricing.objects.filter(
            product=product,
            name=name,
            interval=interval,
            interval_count=interval_count,
        ).first()

    if pricing:
        pricing.product = product
        pricing.name = name
        pricing.interval = interval
        pricing.interval_count = interval_count
        pricing.unit_amount = amount
        pricing.currency = currency
        pricing.is_active = active
        if stripe_price_id:
            pricing.stripe_price_id = stripe_price_id
        pricing.save()
    else:
        pricing = Pricing.objects.create(
            product=product,
            stripe_price_id=stripe_price_id,
            name=name,
            interval=interval,
            interval_count=interval_count,
            unit_amount=amount,
            currency=currency,
            is_active=active,
        )

    return pricing


def _ensure_product_and_pricing(price: dict[str, Any]) -> tuple[Product, Pricing]:
    product = _ensure_product(price)
    pricing = _ensure_pricing(price, product)
    return product, pricing


def webhook_checkout_session_completed(session: dict[str, Any], request=None) -> bool:
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
    except stripe.StripeError as exc:
        logger.exception("Failed to list Stripe Checkout line items for %s: %s", session_id, exc)
        return False
    event_source_url = session.get("success_url") or session.get("cancel_url")

    for item in line_items:
        price_data = item.get("price")
        if isinstance(price_data, str):
            try:
                price = stripe.Price.retrieve(price_data)
            except stripe.StripeError as exc:
                logger.exception("Failed to retrieve Stripe price %s: %s", price_data, exc)
                continue
        else:
            price = price_data or {}
        if not isinstance(price, dict) or not price:
            logger.warning("Stripe line item missing price object: %s", item)
            continue
        product, pricing = _ensure_product_and_pricing(price)

        session_mode = session.get("mode")
        if session_mode == "subscription":
            subscription_id = session.get("subscription")
            subscription_obj = None
            if subscription_id:
                try:
                    subscription_obj = stripe.Subscription.retrieve(subscription_id)
                except stripe.StripeError as exc:
                    logger.exception("Failed to retrieve Stripe subscription %s: %s", subscription_id, exc)

            subscription, _created = Subscription.objects.get_or_create(
                user=user,
                defaults={
                    "product": product,
                    "pricing": pricing,
                    "provider": "stripe",
                    "provider_subscription_id": subscription_id or "",
                },
            )
            subscription.product = product
            if pricing:
                subscription.pricing = pricing
            subscription.provider = "stripe"
            if subscription_id:
                subscription.provider_subscription_id = subscription_id

            if subscription_obj:
                status = subscription_obj.get("status")
                subscription.is_active = status in {"trialing", "active", "past_due"}
                subscription.cancel_at_period_end = bool(subscription_obj.get("cancel_at_period_end"))
                expires_at = _timestamp_to_datetime(subscription_obj.get("cancel_at"))
                if expires_at:
                    subscription.expires_at = expires_at
            else:
                subscription.is_active = True
                subscription.cancel_at_period_end = False
                subscription.save()
            send_purchase_event(
                request=request,
                user=user,
                value=pricing.unit_amount if pricing else None,
                currency=pricing.currency if pricing else None,
                subscription=subscription,
                event_source_url=event_source_url,
                subscription_period_start=(subscription_obj or {}).get("current_period_start") if subscription_obj else None,
            )

        elif session_mode == "payment":
            payment_reference = session.get("payment_intent") or session_id
            Purchase.objects.update_or_create(
                user=user,
                product=product,
                defaults={
                    "provider": "stripe",
                    "provider_transaction_id": payment_reference or "",
                },
            )
            send_purchase_event(
                request=request,
                user=user,
                value=pricing.unit_amount if pricing else None,
                currency=pricing.currency if pricing else None,
                subscription=None,
                event_source_url=event_source_url,
                payment_reference=str(payment_reference or session_id),
            )
        handled_item = True

    return handled_item

def webhook_subscription_created_or_updated(subscription_obj: dict[str, Any], request=None) -> bool:
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

    handled = False
    for item in items:
        price_data = item.get("price")
        if isinstance(price_data, str):
            try:
                price = stripe.Price.retrieve(price_data)
            except stripe.StripeError as exc:
                logger.exception("Failed to retrieve Stripe price %s: %s", price_data, exc)
                continue
        else:
            price = price_data or {}
        if not isinstance(price, dict) or not price:
            continue
        product, pricing = _ensure_product_and_pricing(price)
        subscription, _ = Subscription.objects.get_or_create(
            user=user,
            defaults={
                "product": product,
                "pricing": pricing,
                "provider": "stripe",
                "provider_subscription_id": subscription_id,
            },
        )
        subscription.product = product
        if pricing:
            subscription.pricing = pricing
        subscription.provider = "stripe"
        subscription.provider_subscription_id = subscription_id

        status = subscription_obj.get("status")
        subscription.is_active = status in {"trialing", "active", "past_due"}
        subscription.cancel_at_period_end = bool(subscription_obj.get("cancel_at_period_end"))

        expires_at = _timestamp_to_datetime(subscription_obj.get("cancel_at"))
        if expires_at:
            subscription.expires_at = expires_at

        subscription.save()
        send_purchase_event(
            request=request,
            user=user,
            value=pricing.unit_amount if pricing else None,
            currency=pricing.currency if pricing else None,
            subscription=subscription,
            subscription_period_start=subscription_obj.get("current_period_start"),
        )
        handled = True

    return handled

def webhook_subscription_deleted(subscription_obj: dict[str, Any]):
    subscription_id = subscription_obj.get("id")
    customer_id = subscription_obj.get("customer")
    if not subscription_id or not customer_id:
        logger.warning("Stripe subscription deletion missing id or customer.")
        return False

    user = util_get_user(customer_id)
    if not user:
        logger.warning("User %s not resolved for subscription %s", customer_id, subscription_id)
        return False
    
    subscription = Subscription.objects.filter(
        user=user, provider="stripe", provider_subscription_id=subscription_id
    ).first()
    if subscription:
        subscription.is_active = False
        subscription.cancel_at_period_end = True
        subscription.expires_at = _timestamp_to_datetime(subscription_obj.get("ended_at")) or timezone.now()
        subscription.save(update_fields=["is_active", "cancel_at_period_end", "expires_at"])
        return True



def webhook_product_created_or_updated(product_obj: dict[str, Any]) -> bool:
    stripe_product_id = product_obj.get("id")
    metadata = product_obj.get("metadata") or {}
    name = metadata.get("name")
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
    product.save()
    return True


def webhook_price_created_or_updated(price_obj: dict[str, Any]) -> bool:
    price_id = price_obj.get("id")
    if not price_id:
        logger.warning("Stripe price event missing id.")
        return False

    product = _ensure_product(price_obj)
    _ensure_pricing(price_obj, product)
    return True


def webhook_product_deleted(product_obj: dict[str, Any]) -> bool:
    stripe_product_id = product_obj.get("id")
    metadata = product_obj.get("metadata") or {}
    name = metadata.get("name")

    product = None
    if stripe_product_id:
        product = Product.objects.filter(stripe_product_id=stripe_product_id).first()
    if not product and name:
        product = Product.objects.filter(name=name).first()
    if not product:
        return False
    product.is_active = False
    product.save(update_fields=["is_active"])
    product.pricings.update(is_active=False) # DOES THIS WORK?
    return True


def webhook_price_deleted(price_obj: dict[str, Any]) -> bool:
    price_id = price_obj.get("id")
    if not price_id:
        return False
    pricing = Pricing.objects.filter(stripe_price_id=price_id).first()
    if not pricing:
        return False
    pricing.is_active = False
    pricing.save(update_fields=["is_active"])
    return True


def webhook_checkout_session_failed(session: dict[str, Any]) -> bool:
    logger.info("Stripe checkout session %s failed asynchronously.", session.get("id"))
    return True


def webhook_checkout_session_expired(session: dict[str, Any]) -> bool:
    logger.info("Stripe checkout session %s expired without completion.", session.get("id"))
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
        event_handlers = {
            "customer.created": webhook_customer_created,
            "checkout.session.completed": lambda payload: webhook_checkout_session_completed(payload, request=request),
            "checkout.session.async_payment_failed": webhook_checkout_session_failed,
            "checkout.session.async_payment_succeeded": lambda payload: webhook_checkout_session_completed(payload, request=request),
            "checkout.session.expired": webhook_checkout_session_expired,
            "customer.subscription.created": lambda payload: webhook_subscription_created_or_updated(payload, request=request),
            "customer.subscription.updated": lambda payload: webhook_subscription_created_or_updated(payload, request=request),
            "customer.subscription.deleted": webhook_subscription_deleted,
            "product.created": webhook_product_created_or_updated,
            "product.updated": webhook_product_created_or_updated,
            "product.deleted": webhook_product_deleted,
            "price.created": webhook_price_created_or_updated,
            "price.updated": webhook_price_created_or_updated,
            "price.deleted": webhook_price_deleted,
        }

        handler = event_handlers.get(event_type)
        if handler:
            out = handler(data)

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
        except stripe.StripeError as exc:
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
# Needs work, fails rn
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
            )
        except stripe.StripeError as exc:
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
