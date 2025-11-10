from datetime import timedelta

from django.db import models
from django.utils import timezone


class Prompt(models.Model):
    class PromptType(models.TextChoices):
        X_POST_MASTER = ("x_post_master", "X Post Master")

    prompt_type = models.CharField(
        max_length=64,
        choices=PromptType.choices,
        unique=True,
        help_text="Identifier for this prompt’s usage.",
    )
    text = models.TextField(help_text="Full prompt content used for generation.")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Prompt"
        verbose_name_plural = "Prompts"
        ordering = ["prompt_type"]

    def __str__(self):
        return self.get_prompt_type_display()


class XCommunity(models.Model):
    name = models.CharField(max_length=64, blank=True, null=True)
    community_id = models.CharField(
        max_length=255,
        blank=True,
        null=True,
        help_text="X Community identifier",
    )

    class Meta:
        verbose_name = "X Community"
        verbose_name_plural = "X Communities"
        ordering = ["name", "community_id"]

    def __str__(self):
        return self.name or self.community_id or f"Community {self.pk}"


class XPost(models.Model):
    prompt = models.TextField(help_text="Raw instruction used to craft an X post.")
    scheduled_for = models.DateTimeField(
        blank=True,
        null=True,
        help_text="When the post should go live. Defaults to creation time + 1 hour.",
    )
    community = models.ForeignKey(
        XCommunity,
        on_delete=models.PROTECT,
        related_name="posts",
        blank=True,
        null=True,
    )
    post = models.TextField(blank=True, help_text="Final copy that will be sent to X.")
    is_written = models.BooleanField(default=False)
    is_posted = models.BooleanField(default=False)
    is_in_review = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-scheduled_for", "-created_at"]
        verbose_name = "X Post"
        verbose_name_plural = "X Posts"

    def save(self, *args, **kwargs):
        if self.scheduled_for is None:
            self.scheduled_for = timezone.now() + timedelta(hours=1)
        super().save(*args, **kwargs)

    def __str__(self):
        base = self.post or self.prompt
        snippet = (base[:40] + "...") if len(base) > 43 else base
        return f"XPost(id={self.pk}, scheduled_for={self.scheduled_for}, text='{snippet}')"
