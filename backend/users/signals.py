from django.dispatch import receiver
from django.db.models.signals import post_save
from django.template.loader import render_to_string
from django.core.mail import EmailMultiAlternatives
from django.utils.html import strip_tags
from django.conf import settings
from urllib.parse import urlencode
from base64 import b64encode

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
            'link': link,
            'email_adress': user_email
        }

        html_message = render_to_string("email_pwreset.html", context=context)
        plain_message = strip_tags(html_message)

        msg = EmailMultiAlternatives(
            subject = "Reqest for resetting password for {title}".format(title=user_email),
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
        base_url = settings.FRONTEND_URL
        uid = instance.uid
        token = instance.token

        link = f"{base_url}users/verification/?uid={uid}&token={token}"
        context = {
            'link': link,
            'email_adress': user_email
        }
        print("Email context:", context)
        print(f"Sending link: {link}")
        

        html_message = render_to_string("email_verification.html", context=context)
        print("Email HTML:", html_message)
        print("Email context:", context)
        plain_message = strip_tags(html_message)

        msg = EmailMultiAlternatives(
            subject = "Verify your Account",
            body = plain_message,
            from_email = "alex@stockz.ai",
            to=[user_email]
        )

        msg.attach_alternative(html_message, "text/html")
        msg.send()