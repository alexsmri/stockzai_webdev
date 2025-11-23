from celery import shared_task
from django.template.loader import render_to_string
from django.core.mail import EmailMultiAlternatives
from django.utils.html import strip_tags
from django.conf import settings


@shared_task
def send_verification_email(email: str, username: str | None, uid: str, token: str):
    base_url = settings.FRONTEND_URL
    link = f"{base_url}users/verification/?uid={uid}&email={email}&username={username or ''}"

    context = {
        "username": username,
        "verification_link": link,
        "verification_code": token,
    }

    html_message = render_to_string("email_verification.html", context=context)
    plain_message = strip_tags(html_message)

    msg = EmailMultiAlternatives(
        subject="Verify your account - stockz.ai",
        body=plain_message,
        from_email="alex@stockz.ai",
        to=[email],
    )
    msg.attach_alternative(html_message, "text/html")
    msg.send()


@shared_task
def send_newsletter_email(email: str, username: str | None, uid: str, token: str):
    base_url = settings.FRONTEND_URL
    link = f"{base_url}users/subscribe-newsletter/verify?uid={uid}&email={email}"

    context = {
        "username": username,
        "subscription_link": link,
        "verification_code": token,
    }

    html_message = render_to_string("email_newsletter.html", context=context)
    plain_message = strip_tags(html_message)

    msg = EmailMultiAlternatives(
        subject="Confirm your newsletter subscription - stockz.ai",
        body=plain_message,
        from_email="alex@stockz.ai",
        to=[email],
    )
    msg.attach_alternative(html_message, "text/html")
    msg.send()

@shared_task
def send_password_reset_email(email: str, username: str | None, uid: str, token: str):
    base_url = settings.FRONTEND_URL
    link = f"{base_url}users/password-reset/?uid={uid}&token={token}"

    context = {
        'username': username,
        'reset_link': link,
    }

    html_message = render_to_string('email_pwreset.html', context=context)
    plain_message = strip_tags(html_message)

    msg = EmailMultiAlternatives(
        subject='Reset your password - Stockz.ai',
        body=plain_message,
        from_email='alex@stockz.ai',
        to=[email],
    )

    msg.attach_alternative(html_message, 'text/html')
    msg.send()
