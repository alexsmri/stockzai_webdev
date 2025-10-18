from paddle_billing import Client, Options, Environment
import os
import json
import logging
from django.conf import settings
from django.http import JsonResponse, HttpResponse
from django.views.decorators.csrf import csrf_exempt
from paddle_billing.Notifications import Secret, Verifier
from .models import Product, Purchase, Subscription, User
from datetime import datetime

API_KEY = os.getenv("PADDLE_API_KEY")
WEBHOOK_SECRET = os.getenv("PADDLE_WEBHOOK_SECRET")
environment = os.getenv("PADDLE_API_KEY")
options = Options(Environment.SANDBOX) if environment == "sandbox" else None

paddle = Client(API_KEY, options=options)
logger = logging.getLogger(__name__)

@csrf_exempt
def paddle_webhook(request):
    """
    Handle Paddle webhook events with signature verification.
    """
    verifier = Verifier()

    try:
        integrity_check = verifier.verify(request, Secret(WEBHOOK_SECRET))
        if not integrity_check:
            logger.warning("❌ Invalid Paddle webhook signature")
            return JsonResponse({"error": "Invalid signature"}, status=403)

        payload = json.loads(request.body)
        event_type = payload.get("event_type")
        data = payload.get("data", {})

        logger.info(f"🔔 Paddle event: {event_type}")
        logger.info(f"{data}")

        if event_type == "transaction.completed":
            product_id = data["items"][0]["price"]["product_id"]
            email = data["customer"]["email"]

            user = User.objects.filter(email=email).first()
            product = Product.objects.filter(pk=product_id).first()

            if not user or not product:
                logger.error(f"User or product not found for email={email}, product={product_id}")
                return JsonResponse({"error": "Invalid user or product"}, status=400)

            # Check if recurring or one-time
            billing_cycle = data["items"][0]["price"].get("billing_cycle")
            transaction_id = data["id"]

            if billing_cycle:
                # Subscription
                Subscription.objects.update_or_create(
                    user=user,
                    product=product,
                    defaults={
                        "is_active": True,
                        "started_at": datetime.now(),
                        "provider": "paddle_sandbox",
                        "provider_subscription_id": transaction_id,
                    },
                )
                logger.info(f"✅ Subscription created for {email} → {product.name}")
            else:
                # One-time purchase
                Purchase.objects.create(
                    user=user,
                    product=product,
                    provider="paddle_sandbox",
                    provider_transaction_id=transaction_id,
                )
                logger.info(f"✅ Purchase created for {email} → {product.name}")

        return HttpResponse("OK", status=200)

    except Exception as e:
        logger.exception("❌ Paddle webhook failed")
        return JsonResponse({"error": str(e)}, status=500)



