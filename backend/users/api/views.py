from django.shortcuts import render
from django.db import transaction
from django.views.decorators.csrf import csrf_exempt
from users.models import User, TokenVerification, TokenPasswordReset, TokenNewsletter, UserConsents, TrackingEvent
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView, TokenVerifyView
from rest_framework import generics
from rest_framework.exceptions import ValidationError
from .serializers import UserSerializer, TokenLoginSerializer, TokenRefreshSerializer, TokenVerifySerializer
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import force_bytes
from stockzAI.response import api_json_response
from users.tokens import make_otp, password_reset_token
from users.utils.tracking import track_event
from rest_framework.decorators import permission_classes, api_view
import json
import logging

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
        if consents_data:
            UserConsents.objects.create(user=user, **consents_data)

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
        body = json.loads(request.body)
        email = body.get('email')
        user = User.objects.get(email=email)
        if user:
            token = make_otp(VERIFICATION_OTP_DIGITS)
            uid = urlsafe_base64_encode(force_bytes(user.pk))
            TokenVerification.objects.filter(user=user).delete()
            TokenVerification.objects.create(user=user, token=token, uid=uid)
            return api_json_response(msg={"uid": uid})
    except Exception as e:
        return api_json_response(error="Something went wrong", status=400)

@csrf_exempt
def view_verify(request):
    if request.method != "POST":
        return api_json_response(error="Only POST requests allowed", status=400)
    try:
        body = json.loads(request.body)
        token = body.get("token")
        uid = body.get("uid")
        token_obj = TokenVerification.objects.get(token=token, uid=uid)
        user = token_obj.user
        if token_obj:
            if token_obj.is_expired():
                return api_json_response(msg=False, error="Code Expired.")
            if token_obj.is_used:
                return api_json_response(msg=False, error="Code Invalid.")

            token_obj.is_used = True
            token_obj.save()

            user.is_active = True
            user.save()

            return api_json_response(msg=True)

    except Exception as e:
        logger.exception(e)
        return api_json_response(error="Something went wrong", status=400)

    except Exception as e:
        return api_json_response(error="Something went wrong", status=400)

@api_view(["POST"])
@permission_classes([AllowAny])
def view_password_reset_token(request):
    try:
        body = json.loads(request.body)
        email = body.get("email")
        user = User.objects.get(email=email)
        if user:
            token = password_reset_token.make_token(user)
            uid = urlsafe_base64_encode(force_bytes(user.pk))
            TokenPasswordReset.objects.filter(user=user).delete()
            token_obj = TokenPasswordReset(user=user, token=token, uid=uid)
            token_obj.save()
            return api_json_response(msg=True)
    except Exception as e:
        logger.exception(e)
        return api_json_response(error="Something went wrong", status=400)

@api_view(["POST"])
@permission_classes([AllowAny])
def view_validate_password_reset_token(request):
    try:
        body = json.loads(request.body)
        token = body.get("token")
        uid = body.get("uid")
        token_obj = TokenPasswordReset.objects.get(token=token, uid=uid)

        if token_obj:

            if token_obj.is_expired():
                return api_json_response(msg=False)
            if token_obj.is_used:
                return api_json_response(msg=False)

            return api_json_response(msg=True)

    except Exception as e:
        return api_json_response(msg=False, error="Something went wrong", status=200)

@api_view(["POST"])
@permission_classes([AllowAny])
def view_reset_password(request):
    try:
        body = json.loads(request.body)
        token = body.get("token")
        uid = body.get("uid")
        password = body.get("password")
        token_obj = TokenPasswordReset.objects.get(token=token, uid=uid)
        user = token_obj.user
        if token_obj:
            if token_obj.is_expired():
                return api_json_response(msg=False)
            if token_obj.is_used:
                return api_json_response(msg=False)

            token_obj.is_used = True
            token_obj.save()

            user.set_password(password)
            user.save()

            return api_json_response(msg=True)

    except Exception as e:
        return api_json_response(error="Something went wrong", status=400)

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def view_subscribe_newsletter_token(request):
    consents, _ = UserConsents.objects.get_or_create(user=request.user)
    if consents.consents_newsletter:
        return api_json_response(msg=False, error="You are already subscribed to the newsletter.")

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
        return api_json_response(msg=False, error="Token and uid are required.")

    try:
        token_obj = TokenNewsletter.objects.get(token=token, uid=uid)
    except TokenNewsletter.DoesNotExist:
        return api_json_response(msg=False, error="Verification code invalid.")

    if token_obj.user_id != request.user.id:
        return api_json_response(msg=False, error="Verification code invalid for this user.")

    if token_obj.is_expired() or token_obj.is_used:
        return api_json_response(msg=False, error="Verification code expired.")

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
    msg_consents = {"consents_newsletter": consents.consents_newsletter} if consents else {}
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
        return api_json_response(error="Something went wrong.", status=400)


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
        return api_json_response(error="No newsletter subscription found.", status=400)

    if not consents.consents_newsletter:
        return api_json_response(error="You are not subscribed to the newsletter.", status=400)

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
    msg = {"consents_newsletter": consents.consents_newsletter} if consents else {}
    return api_json_response(msg=msg)











