from __future__ import annotations

import logging
import re
from typing import Any, Dict, List, Optional, Tuple
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


MAX_SINGLE_POST_CHARS = 270
MAX_THREAD_POST_CHARS = 275
THREAD_SUFFIX = " (Thread)"
THREAD_SUFFIX_LENGTH = len(THREAD_SUFFIX)


def publish_post_to_x(
    text: str,
    community_id: Optional[str] = None,
    reply_to_tweet_id: Optional[str] = None,
) -> Dict[str, Any]:
    """Send a post to the X API."""
    if not text:
        raise ValueError("Cannot publish an empty post.")

    url = getattr(settings, "X_API_POST_URL", "https://api.x.com/2/tweets")
    payload: Dict[str, Any] = {"text": text}
    target_community = community_id if reply_to_tweet_id is None else None
    if target_community:
        payload["community_id"] = target_community
        payload["share_with_followers"] = True

    if reply_to_tweet_id:
        payload["reply"] = {"in_reply_to_tweet_id": reply_to_tweet_id}

    logger.info("Publishing post to X url=%s community=%s", url, payload.get("community_id"))

    response = requests.post(url, auth=auth, json=payload, timeout=15)


    if response.ok:
        logger.info("Post created: %s", response.text)
        logger.info("Response: %s", response)
        return response.json()

    raise XAPIError(f"X API error {response.status_code}: {response.text}")


def _build_segments(
    paragraphs: List[str],
    first_segment_limit: int,
    other_segment_limit: int,
) -> Tuple[List[str], bool]:
    """Combine paragraphs into tweet-sized chunks enforcing per-segment limits.

    Returns (segments, fits_limits_flag).
    """
    if first_segment_limit <= 0 or other_segment_limit <= 0:
        return [], False

    segments: List[str] = []
    current: Optional[str] = None
    limit_for_current = first_segment_limit

    for paragraph in paragraphs:
        if not paragraph:
            continue

        if current is None:
            if len(paragraph) > limit_for_current:
                return [], False
            current = paragraph
            continue

        candidate = f"{current}\n\n{paragraph}"
        if len(candidate) <= limit_for_current:
            current = candidate
            continue

        segments.append(current)
        limit_for_current = other_segment_limit
        if len(paragraph) > limit_for_current:
            return [], False
        current = paragraph

    if current:
        segments.append(current)

    return segments, True


def _split_paragraph_on_sentence(paragraph: str, limit: int) -> Optional[List[str]]:
    """Split an overlong paragraph on sentence boundaries ('. ') to fit the limit."""
    parts: List[str] = []
    remaining = paragraph

    while len(remaining) > limit:
        split_idx = remaining.rfind(". ", 0, limit)
        if split_idx == -1:
            return None

        first = remaining[: split_idx + 1].strip()
        second = remaining[split_idx + 2 :].strip()
        if not first or not second:
            return None

        parts.append(first)
        remaining = second

    parts.append(remaining)
    return parts


def _thread_prefix(total_segments: int, index: int) -> str:
    return f"({index}/{total_segments}): "


def _thread_prefix_length(total_segments: int, index: int) -> int:
    return len(_thread_prefix(total_segments, index))


def segment_post_body(text: str) -> Tuple[List[str], bool]:
    """Split a post into thread-ready segments.

    Returns a tuple of (segments, needs_review_flag).
    """
    normalized = (text or "").strip()
    if not normalized:
        return [], False

    if len(normalized) <= MAX_SINGLE_POST_CHARS:
        return [normalized], False

    raw_paragraphs = [chunk.strip() for chunk in re.split(r"\n\s*\n", normalized) if chunk.strip()]
    if not raw_paragraphs:
        return [normalized], False

    paragraphs: List[str] = []
    for paragraph in raw_paragraphs:
        if len(paragraph) > MAX_THREAD_POST_CHARS:
            split_parts = _split_paragraph_on_sentence(paragraph, MAX_THREAD_POST_CHARS)
            if not split_parts:
                return [], True
            paragraphs.extend(split_parts)
        else:
            paragraphs.append(paragraph)

    segments, fits_limit = _build_segments(
        paragraphs, MAX_THREAD_POST_CHARS, MAX_THREAD_POST_CHARS
    )
    if not fits_limit:
        return [], True

    if len(segments) <= 1:
        return segments, False

    first_segment_limit = MAX_THREAD_POST_CHARS - THREAD_SUFFIX_LENGTH
    if first_segment_limit <= 0:
        return [], True

    other_segment_limit = MAX_THREAD_POST_CHARS
    while True:
        segments_with_suffix, fits_thread_limit = _build_segments(
            paragraphs,
            first_segment_limit,
            other_segment_limit,
        )
        if not fits_thread_limit:
            return [], True

        total_segments = len(segments_with_suffix)
        if total_segments <= 1:
            return segments_with_suffix, False

        max_prefix_reserve = _thread_prefix_length(total_segments, total_segments)
        required_other_limit = MAX_THREAD_POST_CHARS - max_prefix_reserve

        if required_other_limit <= 0:
            return [], True

        if other_segment_limit == required_other_limit:
            return segments_with_suffix, False

        if required_other_limit > other_segment_limit:
            return segments_with_suffix, False

        other_segment_limit = required_other_limit


def publish_thread_segments(segments: List[str], community_id: Optional[str] = None) -> List[Dict[str, Any]]:
    """Publish a list of segments as a thread."""
    if not segments:
        raise ValueError("Cannot publish an empty thread.")

    responses: List[Dict[str, Any]] = []
    previous_tweet_id: Optional[str] = None
    segment_count = len(segments)

    for index, segment in enumerate(segments):
        if index == 0:
            segment = f"{segment}{THREAD_SUFFIX}"
        else:
            prefix = _thread_prefix(segment_count, index + 1)
            segment = f"{prefix}{segment}"
        response = publish_post_to_x(
            segment,
            community_id=community_id if index == 0 else None,
            reply_to_tweet_id=previous_tweet_id if index > 0 else None,
        )
        responses.append(response)

        previous_tweet_id = response.get("data", {}).get("id")
        if index < segment_count - 1 and not previous_tweet_id:
            raise XAPIError("Missing tweet id for thread segment; cannot continue replies.")

    return responses
