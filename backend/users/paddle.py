import os
import json
import logging
from calendar import monthrange
from datetime import timedelta

from django.http import JsonResponse, HttpResponse
from django.utils import timezone
from django.utils.dateparse import parse_datetime
from django.views.decorators.csrf import csrf_exempt
from paddle_billing import Client, Options, Environment
from paddle_billing.Notifications import Secret, Verifier
from paddle_billing.Resources.Subscriptions.Operations import CancelSubscription, ResumeSubscription

from stockzAI.common.PaddleRequest import PaddleRequest
from .models import Product, Purchase, Subscription, User
from stockzAI.common.response import api_json_response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated

API_KEY = os.getenv("PADDLE_API_KEY")
WEBHOOK_SECRET = os.getenv("PADDLE_WEBHOOK_SECRET")
ENVIRONMENT = os.getenv("PADDLE_ENVIRONMENT")
options = Options(Environment.SANDBOX) if ENVIRONMENT == "sandbox" else None

paddle = Client(API_KEY, options=options)
logger = logging.getLogger(__name__)

def util_verify_signature(request):
    raw_body = request.body.decode("utf-8")
    logger.debug("Paddle webhook payload: %s", raw_body)

    signature = request.headers.get("Paddle-Signature")
    if not signature:
        logger.warning("Missing Paddle-Signature header on webhook request")
        return False

    headers = {"Paddle-Signature": signature}
    paddle_request = PaddleRequest.create(body=raw_body, headers=headers)

    verifier = Verifier()
    try:
        verified = verifier.verify(paddle_request, Secret(WEBHOOK_SECRET))
    except Exception as e:
        logger.exception("Verification exception")
        return False

    if not verified:
        logger.warning("Invalid Paddle webhook signature")

    return verified

def util_get_user(paddle_id: str):
    user = User.objects.filter(paddle_id=paddle_id).first()

    if user:
        return user
    
    try:
        customer = paddle.customers.get(paddle_id)
    except Exception as exc:
        logger.warning(f"Failed to fetch Paddle customer {paddle_id}: {exc}")
        return None
    
    email = customer.email
    if not email:
        logger.warning(f"Paddle customer {paddle_id} has no email field")
        return None
    
    user = User.objects.filter(email=email).first()
    if not user:
        logger.warning(f"Local user with email {email} not found for Paddle ID {paddle_id}")
        return None

    user.paddle_id = paddle_id
    user.save(update_fields=["paddle_id"])
    logger.info(f"Linked Paddle customer {paddle_id} to user {user.id}")
    return user

def webhook_customer_created(data: dict):
    email = data.get("email")
    paddle_id = data.get("id")
    try:
        if email:
            user = User.objects.get(email=email)
            user.paddle_id = paddle_id
            user.save()
        return True
    except User.DoesNotExist:
        logger.error(f"Paddle user with email {email} and ID {paddle_id} does not exist.")
        return


def webhook_transaction_completed(data: dict):
    items: list[dict] = data.get("items")
    customer_id = data.get("customer_id")
    subscription_id = data.get("subscription_id")
    transaction_id = data.get("id")

    user = util_get_user(customer_id)
    if not user:
        logger.warning(f"User {customer_id} not found by util_get_user")
        return
    
    try:
        if not items:
            logger.warning("Paddle transaction %s has no items", transaction_id)
            return False
        

        handled_item = False
        for item in items:
            price = item.get("price") or {}
            product_id = price.get("product_id")
            price_status = price.get("status")
            billing_cycle = price.get("billing_cycle")

            if price_status == "archived":
                continue
            if not product_id:
                logger.warning("Skipping Paddle item without product_id: %s", item)
                continue

            product = Product.objects.filter(paddle_id=product_id).first()
            if not product:
                logger.error("No local Product for Paddle product_id %s", product_id)
                continue

            if billing_cycle:
                if subscription_id and Subscription.objects.filter(provider_subscription_id=subscription_id).exists():
                    logger.info(f"Transaction {transaction_id} already processed.")
                    return True
                
                subscription, _ = Subscription.objects.get_or_create(
                    user=user,
                    defaults={
                        "product": product,
                        "provider": "paddle",
                        "provider_subscription_id": subscription_id or "",
                    },
                )
                if subscription_id:
                    subscription.provider_subscription_id = subscription_id
                subscription.product = product
                subscription.provider = "paddle"
                expires_at = None
                billing_period = data.get("billing_period") or {}
                expires_at_str = billing_period.get("ends_at") if isinstance(billing_period, dict) else None

                if expires_at_str:
                    parsed = parse_datetime(expires_at_str)
                    if parsed:
                        if timezone.is_naive(parsed):
                            parsed = timezone.make_aware(parsed, timezone.utc)
                        expires_at = parsed
                    else:
                        logger.warning("Unable to parse Paddle subscription expiry %s", expires_at_str)

                if expires_at:
                    subscription.expires_at = expires_at

                subscription.is_active = True
                subscription.cancel_at_period_end = False
                subscription.save()
            else:
                if Purchase.objects.filter(provider_transaction_id=transaction_id).exists():
                    logger.info(f"Transaction {transaction_id} already processed.")
                    return True
                
                Purchase.objects.update_or_create(
                    user=user,
                    product=product,
                    defaults={
                        "provider": "paddle",
                        "provider_transaction_id": transaction_id or "",
                    },
                )
            handled_item = True

        return handled_item
    except Exception as exc:
        logger.exception("Exception '%s' occurred when handling paddle transaction %s", exc, transaction_id)
        return

def webhook_product_created_or_updated(data: dict):
    paddle_id = data.get("id")
    verbose_name = data.get("name")
    custom_data = data.get("custom_data")
    status = data.get("status")

    is_active = True if status == "active" else False

    try:
        if not custom_data:
            return
        name = custom_data.get("name")
        if not name:
            return
        
        product, _ = Product.objects.get_or_create(name=name)
        product.paddle_id = paddle_id
        product.verbose_name = verbose_name if not product.verbose_name else product.verbose_name
        product.is_active = is_active
        product.save()
        return True
    
    except Exception as exc:
        logger.exception("Exception '%s' occurred when creating paddle product '%s, %s'", exc, verbose_name, paddle_id)
        return

@csrf_exempt
def paddle_webhook(request):
    """
    Handle Paddle webhook events with signature verification.
    """

    try:
        integrity_check = util_verify_signature(request)
        if not integrity_check:
            return JsonResponse({"error": "Invalid signature"}, status=403)

        payload = json.loads(request.body)
        event_type = payload.get("event_type")
        data = payload.get("data", {})

        logger.info("Paddle event: %s", event_type)
        logger.info("%s", data)

        out = False
        if event_type == "customer.created":
            out = webhook_customer_created(data)
        elif event_type == "transaction.completed":
            out = webhook_transaction_completed(data)
        elif event_type in ["product.created", "product.updated"]:
            out = webhook_product_created_or_updated(data)

        return HttpResponse("OK" if out else "Error", status=200)

    except Exception as e:
        logger.exception("Paddle webhook failed")
        return JsonResponse({"error": str(e)}, status=500)

def _parse_plan_name(payload: dict):
    if not isinstance(payload, dict):
        return None
    plan_name = payload.get("plan_name") or payload.get("plan")
    if isinstance(plan_name, str):
        return plan_name.strip()
    return None


def _find_user_subscription(user: User, plan_name: str | None) -> Subscription | None:
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

    if subscription.provider.lower() == "paddle" and subscription.provider_subscription_id:
        try:
            paddle.subscriptions.cancel(subscription.provider_subscription_id, CancelSubscription())
        except Exception as exc:
            logger.exception("Failed to cancel Paddle subscription %s", subscription.provider_subscription_id)
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

    if subscription.provider.lower() == "paddle" and subscription.provider_subscription_id:
        try:
            paddle.subscriptions.resume(subscription.provider_subscription_id, ResumeSubscription())
        except Exception as exc:
            logger.exception("Failed to resume Paddle subscription %s", subscription.provider_subscription_id)
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
