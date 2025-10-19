from paddle_billing import Client, Options, Environment
import os
import json
import logging
from stockzAI.common.PaddleRequest import PaddleRequest
from django.http import JsonResponse, HttpResponse
from django.views.decorators.csrf import csrf_exempt
from paddle_billing.Notifications import Secret, Verifier
from .models import Product, Purchase, Subscription, User
from paddle_billing.Notifications.Requests.Request import Request
from datetime import datetime

ALLOWED_INTERVALS = {
    "month": lambda: datetime.now().month + 1, 
    "year": lambda: datetime.now().year + 1, 
    "day": lambda: datetime.now().day + 1, 
    "week": lambda: datetime.now().day + 7,
    }

API_KEY = os.getenv("PADDLE_API_KEY")
WEBHOOK_SECRET = os.getenv("PADDLE_WEBHOOK_SECRET")
ENVIRONMENT = os.getenv("PADDLE_ENVIRONMENT")
options = Options(Environment.SANDBOX) if ENVIRONMENT == "sandbox" else None

paddle = Client(API_KEY, options=options)
logger = logging.getLogger(__name__)

def util_get_expires_at(interval: str):
    if interval not in ALLOWED_INTERVALS.keys():
        return
    else:
        expires_at = datetime.now()
        addition = ALLOWED_INTERVALS[interval]
        if interval in ["week", "day"]:
            expires_at.day = addition
        elif interval == "month":
            expires_at.month = addition
        else:
            expires_at.year = addition

    return expires_at

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
    status = data.get("status")

    try:
        if items:
            user = User.objects.get(paddle_id=customer_id)
            for item in items:
                price = item.get("price")

                if not price:
                    continue

                product_id = price.get("product_id")
                status = price.get("status")
                billing_cycle = price.get("billing_cycle")

                if status == "archived" or not product_id:
                    continue
                
                product = Product.objects.get(paddle_id=product_id)
                if billing_cycle is None:
                    Purchase.objects.create(
                        user=user, 
                        product=product, 
                        provider="paddle", 
                        provider_transaction_id=transaction_id
                    )
                else:
                    expires_at = util_get_expires_at(billing_cycle.get("interval"))
                    subscription = Subscription.objects.get(provider_subscription_id=subscription_id)
                    subscription.expires_at = expires_at
                    subscription.is_active = True
        return True
        
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

        logger.info(f"🔔 Paddle event: {event_type}")
        logger.info(f"{data}")

        if event_type == "customer.created":
            out = webhook_customer_created(data)
        
        if event_type == "transaction.completed":
            out = webhook_transaction_completed(data)
        
        if event_type in ["product.created", "product.updated"]:
            out = webhook_product_created_or_updated(data)
        
        msg = "OK" if out else "Error"
        return HttpResponse(msg, status=200)

    except Exception as e:
        logger.exception("❌ Paddle webhook failed")
        return JsonResponse({"error": str(e)}, status=500)



