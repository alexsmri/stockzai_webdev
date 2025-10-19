import os
import json
import logging
from calendar import monthrange
from datetime import timedelta

from django.http import JsonResponse, HttpResponse
from django.utils import timezone
from django.views.decorators.csrf import csrf_exempt
from paddle_billing import Client, Options, Environment
from paddle_billing.Notifications import Secret, Verifier

from stockzAI.common.PaddleRequest import PaddleRequest
from .models import Product, Purchase, Subscription, User

API_KEY = os.getenv("PADDLE_API_KEY")
WEBHOOK_SECRET = os.getenv("PADDLE_WEBHOOK_SECRET")
ENVIRONMENT = os.getenv("PADDLE_ENVIRONMENT")
options = Options(Environment.SANDBOX) if ENVIRONMENT == "sandbox" else None

paddle = Client(API_KEY, options=options)
logger = logging.getLogger(__name__)

def util_verify_signature(request):
    raw_body = request.body.decode("utf-8")
    logger.info(raw_body)
    headers = {"Paddle-Signature": request.headers.get("Paddle-Signature")}
    logger.info(headers)

    if not headers["Paddle-Signature"]:
        return False
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

    try:
        if not items:
            logger.warning("Paddle transaction %s has no items", transaction_id)
            return False

        user = User.objects.get(paddle_id=customer_id)

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
                if Subscription.objects.filter(provider_subscription_id=subscription_id).exists():
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
                billing_period = data.get("billing_period") or {}
                expires_at = billing_period.get("ends_at")

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
        logger.exception(f"Exception '{exc}' occured when handling paddle transaction f{transaction_id}")
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
        logger.exception(f"Exception '{exc}' occured when creating paddle product '{verbose_name}, {paddle_id}'")
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





