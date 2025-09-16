from django.dispatch import receiver
from django.db.models.signals import post_save
from django.template.loader import render_to_string
from django.core.mail import EmailMultiAlternatives
from django.utils.html import strip_tags
from django.conf import settings

from .models import TokenPasswordReset, TokenVerification

@receiver(post_save, sender=TokenPasswordReset)
def password_reset_token_created(sender, instance, created, **kwargs):
    if created:
        user_email = instance.user.email
        base_url = settings.FRONTEND_URL
        uid = instance.uid
        token = instance.token
        link = f"{base_url}users/password-reset/?uid={uid}&token={token}"
        
        context = {
            'reset_link': link
        }

        html_message = render_to_string("email_pwreset.html", context=context)
        plain_message = strip_tags(html_message)

        msg = EmailMultiAlternatives(
            subject = "Reset your password - Stockz.ai",
            body = plain_message,
            from_email = "alex@stockz.ai",
            to=[user_email]
        )

        msg.attach_alternative(html_message, "text/html")
        msg.send()

@receiver(post_save, sender=TokenVerification)
def verification_token_created(sender, instance, created, **kwargs):
    if created:
        user_email = instance.user.email
        user_name = instance.user.username
        base_url = settings.FRONTEND_URL
        uid = instance.uid
        token = instance.token

        link = f"{base_url}users/verification/?uid={uid}"
        context = {
            'username': user_name,
            'verification_link': link,
            'verification_code': token
        }
        

        html_message = render_to_string("email_verification.html", context=context)
        plain_message = strip_tags(html_message)

        msg = EmailMultiAlternatives(
            subject = "Verify your account - stockz.ai",
            body = plain_message,
            from_email = "alex@stockz.ai",
            to=[user_email]
        )

        msg.attach_alternative(html_message, "text/html")
        msg.send()