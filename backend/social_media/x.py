from __future__ import annotations

import logging
from typing import Any, Dict, Optional
import requests
from requests_oauthlib import OAuth1
from django.conf import settings

logger = logging.getLogger(__name__)

X_API_KEY = getattr(settings, "X_API_KEY", None)
X_API_KEY_SECRET = getattr(settings, "X_API_KEY_SECRET", None)
X_ACCESS_TOKEN = getattr(settings, "X_ACCESS_TOKEN", None)
X_ACCESS_TOKEN_SECRET = getattr(settings, "X_ACCESS_TOKEN_SECRET", None)

auth = OAuth1(X_API_KEY, X_API_KEY_SECRET, X_ACCESS_TOKEN, X_ACCESS_TOKEN_SECRET) 

class XAPIError(RuntimeError):
    """Raised when the X API rejects a request."""


def publish_post_to_x(text: str, community_id: Optional[str] = None) -> Dict[str, Any]:
    """Send a post to the X API."""
    if not text:
        raise ValueError("Cannot publish an empty post.")

    url = getattr(settings, "X_API_POST_URL", "https://api.x.com/2/tweets")
    payload: Dict[str, Any] = {"text": text}
    target_community = community_id or getattr(settings, "X_DEFAULT_COMMUNITY_ID", None)
    if target_community:
        payload["community_id"] = target_community

    logger.info("Publishing post to X url=%s community=%s", url, payload.get("community_id"))

    response = requests.post(url, auth=auth, json=payload, timeout=15)

    if response.ok:
        logger.debug("Post created: %s", response.text)
        return response.json()

    raise XAPIError(f"X API error {response.status_code}: {response.text}")
