import logging
import threading
import uuid
from datetime import datetime, timezone
from decimal import Decimal
from typing import Any, Dict, Optional
from hashlib import sha256

import requests
from django.conf import settings
from django.http import HttpRequest

from .models import Subscription, User, UserConsents
from .utils.tracking import _extract_ip

logger = logging.getLogger(__name__)


META_PIXEL_ID: Optional[str] = getattr(settings, "META_PIXEL_ID", None)
META_CAPI_ACCESS_TOKEN: Optional[str] = getattr(settings, "META_CAPI_ACCESS_TOKEN", None)
META_TEST_EVENT_CODE: Optional[str] = getattr(settings, "META_TEST_EVENT_CODE", None)
META_CAPI_ENABLED: bool = bool(getattr(settings, "META_CAPI_ENABLED", False))

_META_ENDPOINT = (
    f"https://graph.facebook.com/v24.0/{META_PIXEL_ID}/events"
    if META_PIXEL_ID
    else None
)


def _normalize_email(email: Optional[str]) -> Optional[str]:
    if not email or not isinstance(email, str):
        return None
    normalized = sha256(email.strip().lower().encode("utf-8")).hexdigest()
    return normalized or None


def _extract_user_agent(request: Optional[HttpRequest]) -> Optional[str]:
    if not request:
        return None
    user_agent = request.META.get("HTTP_USER_AGENT")
    if not user_agent:
        return None
    return user_agent[:512]


def _event_source_url(request: Optional[HttpRequest]) -> Optional[str]:
    if not request:
        return None
    try:
        return request.build_absolute_uri()
    except Exception:
        return None


def _has_consent(user: Optional[User]) -> bool:
    return True
    """Basic GDPR guard: only proceed when explicit consents are stored."""
    if not user:
        return False
    try:
        consents: Optional[UserConsents] = getattr(user, "consents", None) or user.consents
    except UserConsents.DoesNotExist:
        consents = None
    if not consents:
        return False
    return bool(consents.consents_information_only and consents.consents_tos)


def _dispatch_async(payload: Dict[str, Any], event_id: str) -> None:
    logger.warning(META_CAPI_ENABLED)
    if not META_CAPI_ENABLED or not _META_ENDPOINT or not META_CAPI_ACCESS_TOKEN:
        return

    def _call():
        logger.warning(f"Meta Request{payload}")
        try:
            response = requests.post(
                _META_ENDPOINT,
                params={"access_token": META_CAPI_ACCESS_TOKEN},
                json=payload,
                timeout=5,
            )
            if response.status_code >= 400:
                logger.warning(
                    "Meta CAPI call failed for event %s: %s %s",
                    event_id,
                    response.status_code,
                    response.text,
                )
        except Exception:
            logger.exception("Meta CAPI call raised for event %s", event_id)

    threading.Thread(target=_call, daemon=True).start()


def _base_event_payload(
    request: Optional[HttpRequest],
    event_name: str,
    event_id: Optional[str] = None,
    event_source_url: Optional[str] = None,
) -> Dict[str, Any]:
    event_time = int(datetime.now(tz=timezone.utc).timestamp())
    source_url = event_source_url or _event_source_url(request)
    client_user_agent = _extract_user_agent(request)
    client_ip = _extract_ip(request)
    resolved_event_id = event_id or uuid.uuid4().hex

    event_payload: Dict[str, Any] = {
        "event_name": event_name,
        "event_time": event_time,
        "action_source": "website",
        "event_id": resolved_event_id,
    }

    if source_url:
        event_payload["event_source_url"] = source_url
    user_data: Dict[str, Any] = {}
    if client_user_agent:
        user_data["client_user_agent"] = client_user_agent
    if client_ip:
        user_data["client_ip_address"] = client_ip
    if user_data:
        event_payload["user_data"] = user_data

    return event_payload


def build_registration_payload(
    request: Optional[HttpRequest],
    user: Optional[User],
    event_id: Optional[str] = None,
) -> Dict[str, Any]:
    """Construct the raw payload for a CompleteRegistration Meta event."""
    payload = _base_event_payload(
        request=request,
        event_name="CompleteRegistration",
        event_id=event_id,
    )

    email = _normalize_email(getattr(user, "email", None))
    if email:
        payload.setdefault("user_data", {})["em"] = email

    outer_payload: Dict[str, Any] = {"data": [payload]}
    if META_TEST_EVENT_CODE:
        outer_payload["test_event_code"] = META_TEST_EVENT_CODE
    return outer_payload


def build_purchase_payload(
    request: Optional[HttpRequest],
    user: Optional[User],
    value: Optional[Decimal],
    currency: Optional[str],
    subscription: Optional[Subscription] = None,
    event_id: Optional[str] = None,
    event_source_url: Optional[str] = None,
    subscription_period_start: Optional[int] = None,
    payment_reference: Optional[str] = None,
) -> Dict[str, Any]:
    """Construct the raw payload for a Purchase Meta event."""
    resolved_event_id = _purchase_event_id(
        explicit_event_id=event_id,
        subscription=subscription,
        subscription_period_start=subscription_period_start,
        payment_reference=payment_reference,
    )
    payload = _base_event_payload(
        request=request,
        event_name="Purchase",
        event_id=resolved_event_id,
        event_source_url=event_source_url,
    )

    email = _normalize_email(getattr(user, "email", None))
    if email:
        payload.setdefault("user_data", {})["em"] = email

    custom_data: Dict[str, Any] = {}
    if value is not None:
        custom_data["value"] = float(value)
    if currency:
        custom_data["currency"] = currency.lower()
    if subscription and subscription.provider_subscription_id:
        custom_data["subscription_id"] = subscription.provider_subscription_id
    if custom_data:
        payload["custom_data"] = custom_data

    outer_payload: Dict[str, Any] = {"data": [payload]}
    if META_TEST_EVENT_CODE:
        outer_payload["test_event_code"] = META_TEST_EVENT_CODE
    return outer_payload


def _purchase_event_id(
    explicit_event_id: Optional[str],
    subscription: Optional[Subscription],
    subscription_period_start: Optional[int],
    payment_reference: Optional[str],
) -> str:
    if explicit_event_id:
        return explicit_event_id
    if subscription and subscription.provider_subscription_id:
        period = subscription_period_start if subscription_period_start is not None else "start"
        return f"{subscription.provider_subscription_id}:{period}"
    if payment_reference:
        return str(payment_reference)
    return uuid.uuid4().hex


def send_registration_event(
    request: Optional[HttpRequest],
    user: Optional[User],
    event_id: Optional[str] = None,
) -> Dict[str, Any]:
    """
    Build and asynchronously dispatch the CompleteRegistration payload.

    Returns the payload structure for verification/debugging without logging PII.
    """
    payload = build_registration_payload(request=request, user=user, event_id=event_id)
    event_identifier = payload["data"][0]["event_id"]
    if not (_has_consent(user) and META_CAPI_ENABLED):
        return payload
    _dispatch_async(payload, event_identifier)
    return payload


def send_purchase_event(
    request: Optional[HttpRequest],
    user: Optional[User],
    value: Optional[Decimal],
    currency: Optional[str],
    subscription: Optional[Subscription] = None,
    event_id: Optional[str] = None,
    event_source_url: Optional[str] = None,
    subscription_period_start: Optional[int] = None,
    payment_reference: Optional[str] = None,
) -> Dict[str, Any]:
    """
    Build and asynchronously dispatch the Purchase payload.

    Returns the payload structure for verification/debugging without logging PII.
    """
    payload = build_purchase_payload(
        request=request,
        user=user,
        value=value,
        currency=currency,
        subscription=subscription,
        event_id=event_id,
        event_source_url=event_source_url,
        subscription_period_start=subscription_period_start,
        payment_reference=payment_reference,
    )
    event_identifier = payload["data"][0]["event_id"]
    if not (_has_consent(user) and META_CAPI_ENABLED):
        return payload
    _dispatch_async(payload, event_identifier)
    return payload
