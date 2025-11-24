from django.contrib.auth.tokens import PasswordResetTokenGenerator as PWRGenerator
import secrets
import string
from datetime import timedelta
from django.conf import settings
from rest_framework_simplejwt.tokens import Token
from rest_framework_simplejwt.exceptions import TokenError
from hashlib import sha256
from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import force_bytes
from users.models import TokenVerification, TokenNewsletter, TokenPasswordReset
from users.tasks import send_verification_email, send_newsletter_email, send_password_reset_email
import logging

logger = logging.getLogger(__name__)

class PasswordResetTokenGenerator(PWRGenerator):
    def _make_hash_value(self, user, timestamp):
        return (
            str(user.pk) + str(timestamp) + str(user.is_active)
        )

def make_otp(digits: int):
    digits = max(1, int(digits))
    alphabet = string.digits
    return "".join(secrets.choice(alphabet) for _ in range(digits))

password_reset_token = PasswordResetTokenGenerator()


def hash_otp(value: str) -> str:
    return sha256(value.encode("utf-8")).hexdigest()


def create_verification_token(user, digits: int = 6) -> str:
    token = make_otp(digits)
    uid = urlsafe_base64_encode(force_bytes(user.pk))
    TokenVerification.objects.filter(user=user).delete()
    TokenVerification.objects.create(user=user, token_hash=hash_otp(token), uid=uid)
    send_verification_email.delay(user.email, user.username, uid, token)
    return uid


def create_newsletter_token(user, digits: int = 6) -> str:
    token = make_otp(digits)
    uid = urlsafe_base64_encode(force_bytes(user.pk))
    TokenNewsletter.objects.filter(user=user).delete()
    TokenNewsletter.objects.create(user=user, token_hash=hash_otp(token), uid=uid)
    send_newsletter_email.delay(user.email, user.username, uid, token)
    return uid

def create_password_reset_token(user, digits: int = 6) -> str:
    token = password_reset_token.make_token(user)
    uid = urlsafe_base64_encode(force_bytes(user.pk))
    TokenPasswordReset.objects.filter(user=user).delete()
    TokenPasswordReset.objects.create(
        user=user,
        token_hash=hash_otp(token),
        uid=uid,
    )
    send_password_reset_email.delay(user.email, user.username, uid, token)
    return uid


def _session_lifetime() -> timedelta:
    return getattr(settings, "SESSION_TOKEN_LIFETIME", timedelta(minutes=15))


class SessionToken(Token):
    """
    SimpleJWT-backed token dedicated to short-lived session flows.
    """

    token_type = "session"
    lifetime = _session_lifetime()


def make_session_token(payload: dict, lifetime: timedelta | None = None) -> str:
    token = SessionToken()
    if lifetime is not None:
        token.set_exp(lifetime=lifetime)
    token["token_type"] = SessionToken.token_type
    for key, value in payload.items():
        safe_key = str(key) if not isinstance(key, str) else key
        if safe_key != key:
            logger.warning("Coercing non-string session token claim key %r (%s)", key, type(key))
        token[safe_key] = value
    return str(token)


def parse_session_token(raw_token: str):
    try:
        token = SessionToken(raw_token)
    except TokenError:
        return None
    if token.get("token_type") != "session":
        return None
    return token
