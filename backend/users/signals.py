from django.dispatch import receiver
from django.db.models.signals import post_save
from django.template.loader import render_to_string
from django.core.mail import EmailMultiAlternatives
from django.utils.html import strip_tags
from django.conf import settings

from .models import TokenPasswordReset

@receiver(post_save, sender=TokenPasswordReset)
def password_reset_token_created(sender, instance, created, **kwargs):
    if created:
        base_url = settings.FRONTEND_URL
        token = "?token={}".format(reset_password_token.key)
        link = f"{base_url}/password_reset/{token}"

        print(token)
        print(link)

        user_email = TokenPasswordReset.user.email
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