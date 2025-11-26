from django.shortcuts import render
from django.db import transaction
from django.views.decorators.csrf import csrf_exempt
from django.conf import settings
from users.models import (
    Email,
    User,
    TokenVerification,
    TokenPasswordReset,
    TokenNewsletter,
    UserConsents,
    UserStatus,
    TrackingEvent,
    Subscription,
    Product,
    PermissionCode,
    SocialAccount,
    SocialProvider,
)
from users.meta_capi import send_registration_event
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView, TokenVerifyView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework import generics
from rest_framework.exceptions import ValidationError
from django.core.validators import validate_email
from django.core.exceptions import ValidationError as DjangoValidationError
from .serializers import (
    UserSerializer,
    TokenLoginSerializer,
    TokenRefreshSerializer,
    TokenVerifySerializer,
    UserStatusSerializer,
)
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import force_bytes
from stockzAI.common.response import api_json_response
from users.tokens import (
    password_reset_token,
    make_session_token,
    parse_session_token,
    hash_otp,
    create_verification_token,
    create_newsletter_token,
    create_password_reset_token
)
from users.utils.tracking import track_event
from rest_framework.decorators import permission_classes, api_view
import json
import logging
import uuid
import requests
from google.oauth2 import id_token as google_id_token
from google.auth.transport import requests as google_requests
from datetime import timedelta
from django.db import IntegrityError
from hashlib import sha256
from dataclasses import dataclass

logger = logging.getLogger(__name__)
VERIFICATION_OTP_DIGITS = 6
SESSION_INTENT_SIGNUP = "signup"
SESSION_INTENT_LINK = "link"


def issue_tokens(user: User) -> dict[str, str]:
    refresh = RefreshToken.for_user(user)
    return {"access": str(refresh.access_token), "refresh": str(refresh)}


def _normalize_email(value: str | None) -> str | None:
    if not isinstance(value, str):
        return None
    cleaned = value.strip().lower()
    return cleaned or None


def _canonicalize_email_for_provider(provider: str | None, email: str | None) -> str | None:
    base = _normalize_email(email)
    if not base:
        return None
    try:
        local, domain = base.split("@", 1)
    except ValueError:
        return None

    if provider == SocialProvider.GOOGLE and domain in {"gmail.com", "googlemail.com"}:
        local = local.split("+", 1)[0]
        local = local.replace(".", "")
    return f"{local}@{domain}"

@transaction.atomic
def _create_social_user(provider, sub, canonical_email):
    try:
        user = User.objects.create_user(email=canonical_email, password=None, is_active=True)
    except IntegrityError:
        return User.objects.get(email__iexact=canonical_email)

    try:
        SocialAccount.objects.create(
            user=user,
            provider=provider,
            provider_user_id=sub,
            email=canonical_email,
        )
    except IntegrityError:
        return SocialAccount.objects.get(provider=provider, provider_user_id=sub).user

    return user

def _ensure_user_consents(user: User, consents_payload: dict, allow_missing: bool = False):
    consents, _ = UserConsents.objects.get_or_create(user=user)
    required_tos = bool(consents_payload.get("consents_tos"))
    required_info_only = bool(consents_payload.get("consents_information_only"))
    if not allow_missing and (not required_tos or not required_info_only):
        raise ValidationError(
            {"consents_information_only": ["Informational consent is required."]},
        )

    consents.consents_tos = required_tos or consents.consents_tos
    consents.consents_information_only = required_info_only or consents.consents_information_only
    consents.consents_newsletter = bool(consents_payload.get("consents_newsletter")) or consents.consents_newsletter
    consents.save()
    return consents


def _get_binding_claims(request) -> dict:
    ua = (request.META.get("HTTP_USER_AGENT") or "")[:256]
    fp = (request.META.get("HTTP_X_CLIENT_FINGERPRINT") or "")[:256]
    ip = (request.META.get("REMOTE_ADDR") or "")[:64]
    def _hash(val: str) -> str:
        return sha256(val.encode("utf-8")).hexdigest() if val else ""
    return {
        "ua": _hash(ua),
        "fp": _hash(fp),
        "ip": _hash(ip),
    }


def _make_session_token(payload: dict, request) -> str:
    binding = _get_binding_claims(request)
    token_payload = {**payload, **{"binding": binding}}
    return make_session_token(
        token_payload,
        lifetime=getattr(settings, "SESSION_TOKEN_LIFETIME", timedelta(minutes=15)),
    )


def _binding_matches(token, request) -> bool:
    binding = token.get("binding") or {}
    current = _get_binding_claims(request)
    return (
        binding.get("ua") == current.get("ua")
        and binding.get("fp") == current.get("fp")
        and binding.get("ip") == current.get("ip")
    )


def _parse_bound_session_token(request, raw_token: str):
    parsed = parse_session_token(raw_token)
    if not parsed:
        return None
    if not _binding_matches(parsed, request):
        return None
    return parsed


def _has_required_profile(user: User) -> bool:
    if not (user.username or "").strip():
        return False
    consents = getattr(user, "consents", None)
    if not consents:
        return False
    return bool(consents.consents_tos and consents.consents_information_only)


@dataclass
class SocialLoginContext:
    provider: str
    sub: str | None
    email: str | None
    email_verified: bool
    canonical_email: str | None


def _verify_google_id_token(raw_token: str) -> dict | None:
    client_id = getattr(settings, "GOOGLE_CLIENT_ID", None)
    if not client_id:
        logger.error("GOOGLE_CLIENT_ID missing in settings")
        return None
    try:
        claims = google_id_token.verify_oauth2_token(raw_token, google_requests.Request(), client_id)
        issuer = claims.get("iss")
        if issuer not in {"https://accounts.google.com", "accounts.google.com"}:
            logger.warning("Invalid Google token issuer: %s", issuer)
            return None
        return claims
    except Exception as exc:  # noqa: BLE001
        logger.warning("Google token verification failed: %s", exc)
        return None


def _username_is_taken(username: str, exclude_user_id: int | None = None) -> bool:
    qs = User.objects.filter(username__iexact=username)
    if exclude_user_id:
        qs = qs.exclude(pk=exclude_user_id)
    return qs.exists()
    

def _social_login_state_machine(request, ctx: SocialLoginContext):
    if not ctx.sub:
        return api_json_response(error="Invalid provider response.", status=200)
    if not ctx.email_verified:
        return api_json_response(error="Email must be verified by provider.", status=200)

    canonical_email = ctx.canonical_email
    if not canonical_email:
        return api_json_response(error="Email is required from provider.", status=200)

    existing_social = (
        SocialAccount.objects.filter(provider=ctx.provider, provider_user_id=ctx.sub)
        .select_related("user")
        .first()
    )
    if existing_social:
        user = existing_social.user
        if not _has_required_profile(user):
            session_token = _make_session_token(
                {
                    "intent": SESSION_INTENT_SIGNUP,
                    "provider": ctx.provider,
                    "sub": ctx.sub,
                    "email": canonical_email,
                    "user_id": user.id,
                },
                request,
            )
            return api_json_response(
                msg={
                    "needs_profile": True,
                    "session_token": session_token,
                    "email": canonical_email,
                }
            )
        if not user.is_active:
            user.is_active = True
            user.save(update_fields=["is_active"])
        return api_json_response(msg=issue_tokens(user))

    existing_user = User.objects.filter(email__iexact=canonical_email).first()
    if existing_user:
        uid = create_verification_token(existing_user, VERIFICATION_OTP_DIGITS)
        session_payload = {
            "intent": SESSION_INTENT_LINK,
            "provider": ctx.provider,
            "sub": ctx.sub,
            "email": canonical_email,
            "user_id": existing_user.id,
        }
        session_token = _make_session_token(session_payload, request)
        return api_json_response(
            msg={
                "needs_verification": True,
                "uid": uid,
                "email": canonical_email,
                "provider": ctx.provider,
                "session_token": session_token,
            }
        )
    
    user = _create_social_user(ctx.provider, ctx.sub, canonical_email)

    session_token = _make_session_token(
        {
            "intent": SESSION_INTENT_SIGNUP,
            "provider": ctx.provider,
            "sub": ctx.sub,
            "email": canonical_email,
            "user_id": user.id,
        },
        request,
    )
    return api_json_response(
        msg={
            "needs_profile": True,
            "session_token": session_token,
            "email": canonical_email,
        }
    )

class RegisterUserView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny]

    @transaction.atomic
    def perform_create(self, serializer):
        user = serializer.save()
        consents_data = self.request.data.get("consents") or {}
        allowed_fields = {"consents_newsletter", "consents_tos", "consents_information_only"}
        if not bool(consents_data.get("consents_information_only")) or not bool(consents_data.get("consents_tos")):
            raise ValidationError(
                {"consents_information_only": ["Informational consent is required."]}
            )
        sanitized = {
            field: bool(consents_data.get(field))
            for field in allowed_fields
            if field in consents_data
        }
        UserConsents.objects.create(user=user, **sanitized)
        transaction.on_commit(lambda: send_registration_event(self.request, user))

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
        uid = create_verification_token(user, VERIFICATION_OTP_DIGITS)
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
        token_obj = TokenVerification.objects.get(token_hash=hash_otp(token), uid=uid)
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
        uid = create_password_reset_token(user, VERIFICATION_OTP_DIGITS)
        return api_json_response(msg={"uid": uid})
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

    token_obj = TokenPasswordReset.objects.filter(uid=uid, token_hash=hash_otp(token)).first()
    if not token_obj:
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

    token_obj = TokenPasswordReset.objects.filter(uid=uid, token_hash=hash_otp(token)).first()
    if not token_obj:
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

    uid = create_newsletter_token(request.user, VERIFICATION_OTP_DIGITS)

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
        token_obj = TokenNewsletter.objects.get(token_hash=hash_otp(token), uid=uid)
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
            "consents_information_only": consents.consents_information_only,
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
            "consents_information_only": consents.consents_information_only,
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


@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def view_status(request):
    status_obj, _ = UserStatus.objects.get_or_create(user=request.user)

    if request.method == "GET":
        serializer = UserStatusSerializer(status_obj)
        return api_json_response(msg=serializer.data)

    serializer = UserStatusSerializer(
        status_obj,
        data=request.data,
        partial=True,
    )
    if serializer.is_valid():
        serializer.save()
        return api_json_response(msg=serializer.data)

    error_messages = []
    for field_errors in serializer.errors.values():
        if isinstance(field_errors, (list, tuple)):
            error_messages.extend(str(item) for item in field_errors)
        else:
            error_messages.append(str(field_errors))
    error_message = " ".join(error_messages) or "Invalid data."
    return api_json_response(error=error_message, status=200)


@api_view(["POST"])
@permission_classes([AllowAny])
def view_track_onboarding_choose_ticker(request):
    body = request.data if isinstance(request.data, dict) else {}

    def _sanitize(value: str | None, max_length: int = 128) -> str | None:
        if not isinstance(value, str):
            return None
        trimmed = value.strip()
        return trimmed[:max_length] if trimmed else None

    payload = {}
    path_value = _sanitize(body.get("path"), 256)
    payload["path"] = path_value or "/onboarding/choose-ticker"

    selection_value = _sanitize(body.get("selection"))
    if selection_value:
        payload["selection"] = selection_value

    source_value = _sanitize(body.get("source"))
    if source_value:
        payload["source"] = source_value

    campaign_value = _sanitize(body.get("campaign"))
    if campaign_value:
        payload["campaign"] = campaign_value

    track_event(
        request,
        TrackingEvent.EVENT_ONBOARDING_CHOOSE_TICKER,
        payload,
    )

    return api_json_response(msg=True)


@api_view(["POST"])
@permission_classes([AllowAny])
def view_capture_email(request):
    body = request.data if isinstance(request.data, dict) else {}
    raw_email = body.get("email")
    if not isinstance(raw_email, str):
        return api_json_response(error="Email is required.", status=200)

    normalized_email = raw_email.strip().lower()
    if not normalized_email:
        return api_json_response(error="Email is required.", status=200)

    try:
        validate_email(normalized_email)
    except DjangoValidationError:
        return api_json_response(error="Invalid email address.", status=200)

    if User.objects.filter(email__iexact=normalized_email).exists():
        return api_json_response(msg=False)

    _, created = Email.objects.get_or_create(email=normalized_email)
    return api_json_response(msg=created)

@api_view(["POST"])
@permission_classes([AllowAny])
def view_social_google(request):
    try:
        body = json.loads(request.body or "{}")
    except json.JSONDecodeError:
        return api_json_response(error="Invalid payload.", status=400)

    raw_token = body.get("id_token")
    auth_code = body.get("code")
    state = body.get("state")
    code_verifier = body.get("code_verifier")
    redirect_uri = getattr(settings, "GOOGLE_OAUTH_REDIRECT_URI", None)

    logger.warning(
        "Social Google start"),
    logger.warning({
            "has_id_token": bool(raw_token),
            "has_code": bool(auth_code),
            "state_present": bool(state),
            "redirect_uri_set": bool(redirect_uri),
        },
    )

    if not raw_token and auth_code:
        client_id = getattr(settings, "GOOGLE_CLIENT_ID", None)
        client_secret = getattr(settings, "GOOGLE_CLIENT_SECRET", None)
        if not client_id or not client_secret:
            return api_json_response(error="Google OAuth client configuration missing.", status=200)
        if not redirect_uri:
            return api_json_response(error="redirect_uri required for OAuth exchange.", status=200)
        cookie_state = request.COOKIES.get("google_oauth_state")
        if not cookie_state or not state or cookie_state != state:
            logger.warning(
                "Social Google state mismatch"),
            logger.warning({"cookie_state": bool(cookie_state), "state_present": bool(state)},
            )
            return api_json_response(error="State mismatch.", status=200)

        logger.warning(
            "Exchanging Google auth code"),
        logger.warning({
                "has_code_verifier": bool(code_verifier),
                "redirect_uri": redirect_uri,
            },
        )
        token_resp = requests.post(
            "https://oauth2.googleapis.com/token",
            data={
                "code": auth_code,
                "client_id": client_id,
                "client_secret": client_secret,
                "redirect_uri": redirect_uri,
                "grant_type": "authorization_code",
                **({"code_verifier": code_verifier} if code_verifier else {}),
            },
            headers={"Content-Type": "application/x-www-form-urlencoded"},
            timeout=10,
        )
        try:
            token_payload = token_resp.json()
        except Exception:  # pragma: no cover - defensive
            token_payload = {}
        raw_token = token_payload.get("id_token")
        if not raw_token:
            logger.warning(
                "Google token exchange failed"),
            logger.warning({
                    "status": token_resp.status_code,
                    "text": token_resp.text[:500],
                    "error": token_payload.get("error"),
                },
            )
            error_msg = token_payload.get("error_description") or token_payload.get("error") or "Unable to exchange code."
            return api_json_response(error=error_msg, status=200)

    if not raw_token:
        return api_json_response(error="id_token required.", status=200)

    claims = _verify_google_id_token(raw_token)
    if not claims:
        return api_json_response(error="Unable to verify Google token.", status=200)

    sub = claims.get("sub")
    email = claims.get("email")
    email_verified = bool(claims.get("email_verified"))

    logger.warning(
        "Google token verified"),
    logger.warning({"email": email, "sub_present": bool(sub), "email_verified": email_verified},
    )

    ctx = SocialLoginContext(
        provider=SocialProvider.GOOGLE,
        sub=sub,
        email=email,
        email_verified=email_verified,
        canonical_email=_canonicalize_email_for_provider(SocialProvider.GOOGLE, email),
    )
    return _social_login_state_machine(request, ctx)


@api_view(["POST"])
@permission_classes([AllowAny])
def view_social_complete(request):
    body = request.data if isinstance(request.data, dict) else {}
    session_token = body.get("session_token")
    username = (body.get("username") or "").strip()
    consents_payload = body.get("consents") or {}
    newsletter = body.get("newsletter")
    if newsletter is not None:
        consents_payload["consents_newsletter"] = bool(newsletter)

    if not session_token:
        return api_json_response(error="Session token required.", status=200)

    claims = _parse_bound_session_token(request, session_token)
    if not claims:
        return api_json_response(error="Invalid or expired session.", status=200)

    intent = claims.get("intent")
    provider = claims.get("provider")
    sub = claims.get("sub")
    email = claims.get("email")
    user_id = claims.get("user_id")

    if intent not in {SESSION_INTENT_SIGNUP, SESSION_INTENT_LINK} or not provider or not sub or not user_id:
        return api_json_response(error="Invalid session details.", status=200)

    user = User.objects.filter(pk=user_id).first()
    if not user:
        return api_json_response(error="User not found for session.", status=200)

    if not username:
        return api_json_response(error="Username is required.", status=200)
    if _username_is_taken(username, exclude_user_id=user.id):
        return api_json_response(error="Username already taken.", status=200)

    try:
        _ensure_user_consents(user, consents_payload)
    except ValidationError as exc:
        error = ""
        for _, errs in exc.detail.items():
            for err in errs:
                error += f"{str(err)} "
        return api_json_response(error=error or "Consents required.", status=200)

    user.username = username
    if not user.is_active:
        user.is_active = True
    user.save(update_fields=["username", "is_active"])

    if not SocialAccount.objects.filter(provider=provider, provider_user_id=sub, user=user).exists():
        try:
            SocialAccount.objects.create(
                user=user, provider=provider, provider_user_id=sub, email=email or user.email
            )
        except IntegrityError:
            logger.exception("Failed to link social account on completion")

    return api_json_response(msg=issue_tokens(user))


@api_view(["POST"])
@permission_classes([AllowAny])
def view_social_link_verify(request):
    body = request.data if isinstance(request.data, dict) else {}
    token_value = body.get("token")
    uid = body.get("uid")
    session_token = body.get("session_token")

    if not token_value or not uid or not session_token:
        return api_json_response(error="Token, uid and session_token are required.", status=200)

    claims = _parse_bound_session_token(request, session_token)
    if not claims or claims.get("intent") != SESSION_INTENT_LINK:
        return api_json_response(error="Invalid or expired session.", status=200)

    provider = claims.get("provider")
    sub = claims.get("sub")
    email = claims.get("email")
    user_id = claims.get("user_id")

    try:
        token_obj = TokenVerification.objects.get(token_hash=hash_otp(token_value), uid=uid)
    except TokenVerification.DoesNotExist:
        return api_json_response(error="Code Invalid.", status=200)

    if token_obj.is_expired():
        return api_json_response(error="Code Expired.", status=200)
    if token_obj.is_used:
        return api_json_response(error="Code Invalid.", status=200)

    if user_id and token_obj.user_id != user_id:
        return api_json_response(error="Verification code invalid for this user.", status=200)

    user = token_obj.user
    token_obj.is_used = True
    token_obj.save(update_fields=["is_used"])

    existing_social = SocialAccount.objects.filter(
        provider=provider, provider_user_id=sub, user=user
    ).exists()

    if _has_required_profile(user) and existing_social:
        return api_json_response(msg=issue_tokens(user))

    if _has_required_profile(user):
        try:
            SocialAccount.objects.get_or_create(
                provider=provider, provider_user_id=sub, defaults={"user": user, "email": email or user.email}
            )
        except IntegrityError:
            logger.exception("Failed to link social account after verification")
        return api_json_response(msg=issue_tokens(user))

    session_payload = {
        "intent": SESSION_INTENT_LINK,
        "provider": provider,
        "sub": sub,
        "email": email or user.email,
        "user_id": user.id,
    }
    next_session = _make_session_token(session_payload, request)
    return api_json_response(
        msg={
            "needs_profile": True,
            "session_token": next_session,
            "email": email or user.email,
        }
    )
