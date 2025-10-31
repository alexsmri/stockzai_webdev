from django.shortcuts import render
from django.db import transaction
from django.views.decorators.csrf import csrf_exempt
from django.conf import settings
from users.models import (
    User,
    TokenVerification,
    TokenPasswordReset,
    TokenNewsletter,
    UserConsents,
    TrackingEvent,
    Subscription,
    Product,
    PermissionCode,
)
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView, TokenVerifyView
from rest_framework import generics
from rest_framework.exceptions import ValidationError
from .serializers import UserSerializer, TokenLoginSerializer, TokenRefreshSerializer, TokenVerifySerializer
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import force_bytes
from stockzAI.common.response import api_json_response
from users.tokens import make_otp, password_reset_token
from users.utils.tracking import track_event
from rest_framework.decorators import permission_classes, api_view
import json
import logging
import uuid

logger = logging.getLogger(__name__)
VERIFICATION_OTP_DIGITS = 6

class RegisterUserView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny]

    @transaction.atomic
    def perform_create(self, serializer):
        user = serializer.save()
        consents_data = self.request.data.get("consents") or {}
        allowed_fields = {"consents_newsletter", "consents_tos"}
        sanitized = {
            field: bool(consents_data.get(field))
            for field in allowed_fields
            if field in consents_data
        }
        UserConsents.objects.create(user=user, **sanitized)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)

        try:
            serializer.is_valid(raise_exception=True)
            self.perform_create(serializer)
            return api_json_response(msg=serializer.data, status=200)

        except ValidationError as e:
            error = ""
            for _, errs in e.detail.items():
                for err in errs:
                    error += f"{str(err)} "
            return api_json_response(error=error, status=200)

class LoginUserView(TokenObtainPairView):
    serializer_class = TokenLoginSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)

        try:
            serializer.is_valid(raise_exception=True)
        except Exception as e:
            return api_json_response(error="Credentials Invalid.", status=200)
        msg={
            "access": serializer.validated_data["access"],
            "refresh": serializer.validated_data["refresh"],
            }
        return api_json_response(msg=msg)

class RefreshTokenView(TokenRefreshView):
    serializer_class = TokenRefreshSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)

        try:
            serializer.is_valid(raise_exception=True)
        except Exception as e:
            return api_json_response(error="Credentials Invalid.", status=400)
        msg={
            "access": serializer.validated_data["access"],
            }
        return api_json_response(msg=msg)

class VerifyTokenView(TokenVerifyView):
    serializer_class = TokenVerifySerializer
    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)

        try:
            serializer.is_valid(raise_exception=True)
        except Exception as e:
            return api_json_response(error="Credentials Invalid.", status=400)
        msg="Credentials valid."
        return api_json_response(msg=msg)

@csrf_exempt
def view_verification_token(request):
    if request.method != "POST":
        return api_json_response(error="Only POST requests allowed", status=400)
    try:
        body = json.loads(request.body or "{}")
    except json.JSONDecodeError:
        return api_json_response(error="Invalid payload.", status=400)

    email = body.get("email")
    if not email:
        return api_json_response(error="Email is required.", status=200)

    try:
        user = User.objects.get(email=email)
    except User.DoesNotExist:
        dummy_uid = urlsafe_base64_encode(force_bytes(uuid.uuid4().hex))
        return api_json_response(msg={"uid": dummy_uid})

    try:
        token = make_otp(VERIFICATION_OTP_DIGITS)
        uid = urlsafe_base64_encode(force_bytes(user.pk))
        TokenVerification.objects.filter(user=user).delete()
        TokenVerification.objects.create(user=user, token=token, uid=uid)
        return api_json_response(msg={"uid": uid})
    except Exception as e:
        logger.exception("Failed to create verification token", exc_info=e)
        return api_json_response(error="Something went wrong", status=500)

@csrf_exempt
def view_verify(request):
    if request.method != "POST":
        return api_json_response(error="Only POST requests allowed", status=400)
    try:
        body = json.loads(request.body or "{}")
    except json.JSONDecodeError:
        return api_json_response(error="Invalid payload.", status=400)

    token = body.get("token")
    uid = body.get("uid")
    if not token or not uid:
        return api_json_response(error="Token and uid are required.", status=200)

    try:
        token_obj = TokenVerification.objects.get(token=token, uid=uid)
    except TokenVerification.DoesNotExist:
        return api_json_response(error="Code Invalid.", status=200)

    if token_obj.is_expired():
        return api_json_response(error="Code Expired.", status=200)
    if token_obj.is_used:
        return api_json_response(error="Code Invalid.", status=200)

    user = token_obj.user
    token_obj.is_used = True
    token_obj.save(update_fields=["is_used"])

    user.is_active = True
    user.save(update_fields=["is_active"])

    return api_json_response(msg=True)

@api_view(["POST"])
@permission_classes([AllowAny])
def view_password_reset_token(request):
    try:
        body = json.loads(request.body or "{}")
    except json.JSONDecodeError:
        return api_json_response(error="Invalid payload.", status=400)

    email = body.get("email")
    if not email:
        return api_json_response(error="Email is required.", status=200)

    try:
        user = User.objects.get(email=email)
    except User.DoesNotExist:
        return api_json_response(msg=True)

    try:
        token = password_reset_token.make_token(user)
        uid = urlsafe_base64_encode(force_bytes(user.pk))
        TokenPasswordReset.objects.filter(user=user).delete()
        TokenPasswordReset.objects.create(user=user, token=token, uid=uid)
        return api_json_response(msg=True)
    except Exception as e:
        logger.exception("Failed to create password reset token", exc_info=e)
        return api_json_response(error="Something went wrong", status=500)

@api_view(["POST"])
@permission_classes([AllowAny])
def view_validate_password_reset_token(request):
    try:
        body = json.loads(request.body or "{}")
    except json.JSONDecodeError:
        return api_json_response(error="Invalid payload.", status=400)

    token = body.get("token")
    uid = body.get("uid")
    if not token or not uid:
        return api_json_response(error="Token and uid are required.", status=200)

    try:
        token_obj = TokenPasswordReset.objects.get(token=token, uid=uid)
    except TokenPasswordReset.DoesNotExist:
        return api_json_response(error="Reset token invalid.", status=200)

    if token_obj.is_expired():
        return api_json_response(error="Reset token expired.", status=200)
    if token_obj.is_used:
        return api_json_response(error="Reset token already used.", status=200)

    return api_json_response(msg=True)

@api_view(["POST"])
@permission_classes([AllowAny])
def view_reset_password(request):
    try:
        body = json.loads(request.body or "{}")
    except json.JSONDecodeError:
        return api_json_response(error="Invalid payload.", status=400)

    token = body.get("token")
    uid = body.get("uid")
    password = body.get("password")
    if not all([token, uid, password]):
        return api_json_response(error="Token, uid and password are required.", status=200)

    try:
        token_obj = TokenPasswordReset.objects.get(token=token, uid=uid)
    except TokenPasswordReset.DoesNotExist:
        return api_json_response(error="Reset token invalid.", status=200)

    if token_obj.is_expired():
        return api_json_response(error="Reset token expired.", status=200)
    if token_obj.is_used:
        return api_json_response(error="Reset token already used.", status=200)

    user = token_obj.user
    token_obj.is_used = True
    token_obj.save(update_fields=["is_used"])

    user.set_password(password)
    user.save()

    return api_json_response(msg=True)

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def view_subscribe_newsletter_token(request):
    consents, _ = UserConsents.objects.get_or_create(user=request.user)
    if consents.consents_newsletter:
        return api_json_response(error="You are already subscribed to the newsletter.", status=200)

    token = make_otp(VERIFICATION_OTP_DIGITS)
    uid = urlsafe_base64_encode(force_bytes(request.user.pk))
    TokenNewsletter.objects.filter(user=request.user).delete()
    TokenNewsletter.objects.create(user=request.user, token=token, uid=uid)

    return api_json_response(msg={"uid": uid})


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def view_subscribe_newsletter_verify(request):
    try:
        body = json.loads(request.body or "{}")
    except json.JSONDecodeError:
        return api_json_response(error="Invalid payload.", status=400)

    token = body.get("token")
    uid = body.get("uid")

    if not token or not uid:
        return api_json_response(error="Token and uid are required.", status=200)

    try:
        token_obj = TokenNewsletter.objects.get(token=token, uid=uid)
    except TokenNewsletter.DoesNotExist:
        return api_json_response(error="Verification code invalid.", status=200)

    if token_obj.user_id != request.user.id:
        return api_json_response(error="Verification code invalid for this user.", status=200)

    if token_obj.is_expired() or token_obj.is_used:
        return api_json_response(error="Verification code expired.", status=200)

    token_obj.is_used = True
    token_obj.save(update_fields=["is_used"])

    consents, _ = UserConsents.objects.get_or_create(user=request.user)
    consents.consents_newsletter = True
    consents.save(update_fields=["consents_newsletter"])

    return api_json_response(msg=True)

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def view_credentials(request):
    consents = UserConsents.objects.filter(user=request.user).first()
    msg_consents = (
        {
            "consents_newsletter": consents.consents_newsletter,
            "consents_tos": consents.consents_tos,
        }
        if consents
        else {}
    )
    user = request.user
    msg = {
        "email": user.email,
        "username": user.username,
        "consents": msg_consents
    }
    return api_json_response(msg=msg)


@api_view(["POST"])
@permission_classes([AllowAny])
def view_check_new_user(request):
    try:
        body = json.loads(request.body)
        email = body.get("email")
        username = body.get("username")

        email_taken = User.objects.filter(email=email).exists()
        username_taken = User.objects.filter(username=username).exists()

        msg = not email_taken and not username_taken
        error = None
        if email_taken and username_taken:
            error = "Username already taken. Email already in use."
        elif username_taken:
            error = "Username already taken."
        elif email_taken:
            error = "Email already in use."

        return api_json_response(msg=msg, error=error)
    except Exception:
        return api_json_response(error="Something went wrong.", status=500)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def view_edit_profile(request):
    try:
        body = json.loads(request.body)
        user = request.user
        new_username = body.get("username")

        if User.objects.filter(username=new_username).exclude(pk=user.pk).exists():
            return api_json_response(error="Username already taken")

        user.username = new_username
        user.save()

        msg = {
            "email": user.email,
            "username": user.username,
        }

        return api_json_response(msg=msg)
    except Exception as e:
        return api_json_response(error=str(e))


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def view_unsubscribe_newsletter(request):
    try:
        body = json.loads(request.body or "{}")
    except json.JSONDecodeError:
        return api_json_response(error="Invalid payload.", status=400)

    reason = (body.get("reason") or "").strip()

    try:
        consents = UserConsents.objects.get(user=request.user)
    except UserConsents.DoesNotExist:
        return api_json_response(error="No newsletter subscription found.", status=200)

    if not consents.consents_newsletter:
        return api_json_response(error="You are not subscribed to the newsletter.", status=200)

    consents.consents_newsletter = False
    consents.save(update_fields=["consents_newsletter"])

    track_event(
        request,
        TrackingEvent.EVENT_NEWSLETTER_UNSUB,
        {
            "reason": reason or "unspecified",
        },
    )

    if reason:
        logger.info("User %s unsubscribed from newsletter: %s", request.user.pk, reason)

    return api_json_response(msg=True)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def view_consents(request):
    consents = UserConsents.objects.filter(user=request.user).first()
    msg = (
        {
            "consents_newsletter": consents.consents_newsletter,
            "consents_tos": consents.consents_tos,
        }
        if consents
        else {}
    )
    return api_json_response(msg=msg)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def view_get_subscriptions(request):
    subscriptions = (
        Subscription.objects.filter(user=request.user)
        .select_related("product")
        .order_by("-updated_at")
    )
    response_payload = [
        {
            "product": subscription.product.name,
            "expires_at": subscription.expires_at.isoformat() if subscription.expires_at else None,
            "cancel_at_period_end": subscription.cancel_at_period_end,
            "provider": subscription.provider,
            "provider_subscription_id": subscription.provider_subscription_id,
        }
        for subscription in subscriptions
        if subscription.is_active
    ]
    return api_json_response(msg=response_payload)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def view_access(request):
    user: User = request.user
    products = user._entitled_products

    product_names = []
    permission_names = set()

    for product in products:
        product_permissions = list(product.permissions or [])
        product_names.append(product.name)
        permission_names.update(product_permissions)

    if not settings.PAYWALL_ENABLED:
        product_names = sorted(
            Product.objects.filter(is_active=True).values_list("name", flat=True)
        )
        permission_names = {code.value for code in PermissionCode}

    msg = {
        "products": product_names,
        "permissions": sorted(permission_names),
        "paywallEnabled": settings.PAYWALL_ENABLED,
    }

    return api_json_response(msg=msg)











