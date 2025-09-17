import logging
from typing import Any, Dict, Optional

from django.http import HttpRequest

from ..models import TrackingEvent

logger = logging.getLogger(__name__)


def _extract_ip(request: Optional[HttpRequest]) -> Optional[str]:
    if not request:
        return None
    forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if forwarded_for:
        # "client, proxy1, proxy2"
        parts = [ip.strip() for ip in forwarded_for.split(',') if ip]
        if parts:
            return parts[0][:45]
    ip = request.META.get('REMOTE_ADDR')
    return ip[:45] if ip else None


def track_event(
    request: Optional[HttpRequest],
    event_type: str,
    payload: Optional[Dict[str, Any]] = None,
) -> None:
    """Persist a tracking event and log failures without interrupting flows."""
    payload = payload or {}
    try:
        user = None
        if request and hasattr(request, 'user') and getattr(request.user, 'is_authenticated', False):
            user = request.user
        TrackingEvent.objects.create(
            user=user,
            event_type=event_type,
            payload=payload,
            ip_address=_extract_ip(request),
            user_agent=(request.META.get('HTTP_USER_AGENT', '')[:1024] if request else ''),
        )
    except Exception:
        # Do not break the response flow if tracking fails.
        logger.exception('Failed to record tracking event', extra={'event_type': event_type, 'payload': payload})
