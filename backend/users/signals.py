from django.dispatch import receiver
from django.db.models.signals import post_save
from django.template.loader import render_to_string
from django.core.mail import EmailMultiAlternatives
from django.utils.html import strip_tags
from django.conf import settings

from .models import TokenPasswordReset, TokenVerification, TokenNewsletter

# Email delivery now happens via Celery tasks invoked during token creation helpers.
# Signals are kept as no-ops to avoid duplicate sends or attribute errors on hashed tokens.


@receiver(post_save, sender=TokenPasswordReset)
def password_reset_token_created(sender, instance, created, **kwargs):
    return


@receiver(post_save, sender=TokenVerification)
def verification_token_created(sender, instance, created, **kwargs):
    return


@receiver(post_save, sender=TokenNewsletter)
def newsletter_token_created(sender, instance, created, **kwargs):
    return
