from __future__ import annotations

import logging
from pathlib import Path

from celery import shared_task
from django.utils import timezone

from .models import XPost
from .openai import OpenAIClientUnavailable, generate_x_post
from .x import XAPIError, publish_post_to_x

logger = logging.getLogger(__name__)

MASTER_PROMPT_PATH = Path(__file__).resolve().parent / "material" / "X_writer_prompt.txt"


def _load_master_prompt() -> str:
    try:
        return MASTER_PROMPT_PATH.read_text(encoding="utf-8").strip()
    except FileNotFoundError:
        logger.error("Master prompt file missing at %s", MASTER_PROMPT_PATH)
        return ""


@shared_task(name="social_media.write_pending_x_posts")
def write_pending_x_posts() -> int:
    """Generate copy for X posts that still need to be written."""
    master_prompt = _load_master_prompt()
    if not master_prompt:
        logger.warning("Skipping X post generation because no master prompt is available.")
        return 0

    written_count = 0

    posts = list(
        XPost.objects.filter(is_written=False).order_by("scheduled_for", "id")
    )

    if not posts:
        return 0

    for x_post in posts:
        try:
            generated = generate_x_post(x_post.prompt, master_prompt)
        except OpenAIClientUnavailable as err:
            logger.error("OpenAI credentials missing: %s", err)
            break
        except Exception as exc:  # noqa: BLE001
            logger.exception("Failed to craft copy for XPost(id=%s): %s", x_post.pk, exc)
            continue

        x_post.post = generated
        x_post.is_written = True
        x_post.save(update_fields=["post", "is_written", "updated_at"])
        written_count += 1

    return written_count


@shared_task(name="social_media.publish_ready_x_posts")
def publish_ready_x_posts() -> int:
    """Send written and overdue posts to X."""
    ready_posts = list(
        XPost.objects.filter(
            is_written=True,
            is_posted=False,
            scheduled_for__lte=timezone.now(),
        ).order_by("scheduled_for", "id")
    )

    if not ready_posts:
        return 0

    posted = 0
    for x_post in ready_posts:
        if not x_post.post:
            logger.warning("Skipping XPost(id=%s) because post body is empty.", x_post.pk)
            continue

        community_identifier = None
        if x_post.community:
            community_identifier = x_post.community.community_id

        try:
            publish_post_to_x(x_post.post, community_identifier)
        except XAPIError as exc:
            logger.exception("X API rejected XPost(id=%s): %s", x_post.pk, exc)
            continue
        except Exception as exc:  # noqa: BLE001
            logger.exception("Unexpected failure while posting XPost(id=%s): %s", x_post.pk, exc)
            continue

        x_post.is_posted = True
        x_post.save(update_fields=["is_posted", "updated_at"])
        posted += 1

    return posted
