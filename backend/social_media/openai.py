from __future__ import annotations

import logging

from django.conf import settings
from openai import OpenAI

logger = logging.getLogger(__name__)


class OpenAIClientUnavailable(RuntimeError):
    """Raised when OpenAI configuration is missing."""


def _build_client() -> OpenAI:
    api_key = getattr(settings, "OPENAI_API_KEY", None)
    if not api_key:
        raise OpenAIClientUnavailable("OPENAI_API_KEY is not configured.")
    return OpenAI(api_key=api_key)


def generate_x_post(prompt: str, master_prompt: str) -> str:
    """Use OpenAI Responses API to craft an X post."""
    if not prompt:
        raise ValueError("Prompt must not be empty.")

    client = _build_client()
    model = getattr(settings, "OPENAI_MODEL", None)
    if not model:
        raise OpenAIClientUnavailable("OPENAI_MODEL is not configured.")

    composed_prompt = f"{master_prompt}\n\n{prompt}"
    logger.debug("Sending composed prompt to OpenAI model=%s", model)

    response = client.responses.create(
        model=model,
        input=composed_prompt,
    )

    return _extract_text(response)


def _extract_text(response) -> str:
    """Extract the first textual answer from an OpenAI responses payload."""
    for item in getattr(response, "output", []):
        for content_piece in getattr(item, "content", []):
            if content_piece.type == "output_text":
                text_value = getattr(content_piece, "text", None)
                if text_value:
                    return text_value.strip()
            text_obj = getattr(content_piece, "text", None)
            if isinstance(text_obj, str):
                return text_obj.strip()
            if hasattr(content_piece, "value"):
                return str(content_piece.value).strip()

    if hasattr(response, "output_text") and response.output_text:
        return str(response.output_text).strip()

    raise RuntimeError("OpenAI response did not include textual output.")
