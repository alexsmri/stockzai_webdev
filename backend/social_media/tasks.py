from __future__ import annotations

import logging

from celery import shared_task
from django.utils import timezone

from .models import Prompt, XPost
from .openai import OpenAIClientUnavailable, generate_x_post
from .x import XAPIError, publish_post_to_x, publish_thread_segments, segment_post_body

logger = logging.getLogger(__name__)


def _get_master_prompt() -> str | None:
    prompt_obj = Prompt.objects.filter(prompt_type=Prompt.PromptType.X_POST_MASTER).first()
    if not prompt_obj:
        logger.warning("No master prompt configured; skipping generation.")
        return None
    return prompt_obj.text


@shared_task(name="social_media.write_pending_x_posts")
def write_pending_x_posts() -> int:
    """Generate copy for X posts that still need to be written."""
    master_prompt = _get_master_prompt()
    if not master_prompt:
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
            is_in_review=False,
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

        segments, needs_review = segment_post_body(x_post.post)

        if needs_review:
            logger.warning(
                "Placing XPost(id=%s) into review because a paragraph exceeded tweet limits.",
                x_post.pk,
            )
            x_post.is_in_review = True
            x_post.save(update_fields=["is_in_review", "updated_at"])
            continue

        if not segments:
            logger.warning(
                "Skipping XPost(id=%s) because it produced no thread segments.",
                x_post.pk,
            )
            continue

        try:
            if len(segments) == 1:
                publish_post_to_x(segments[0], community_identifier)
            else:
                publish_thread_segments(segments, community_identifier)
        except XAPIError as exc:
            x_post.is_in_review = True
            x_post.save(update_fields=["is_in_review", "updated_at"])
            logger.exception("X API rejected XPost(id=%s): %s", x_post.pk, exc)
            continue
        except Exception as exc:  # noqa: BLE001
            x_post.is_in_review = True
            x_post.save(update_fields=["is_in_review", "updated_at"])
            logger.exception("Unexpected failure while posting XPost(id=%s): %s", x_post.pk, exc)
            continue

        x_post.is_posted = True
        x_post.save(update_fields=["is_posted", "updated_at"])
        posted += 1

    return posted
