from django.urls import path
from .views import (
    RegisterUserView,
    LoginUserView,
    RefreshTokenView,
    VerifyTokenView,
    view_check_new_user,
    view_credentials,
    view_consents,
    view_edit_profile,
    view_access,
    view_password_reset_token,
    view_reset_password,
    view_subscribe_newsletter_token,
    view_subscribe_newsletter_verify,
    view_unsubscribe_newsletter,
    view_validate_password_reset_token,
    view_verification_token,
    view_verify,
    view_get_subscriptions,
)
from ..stripe import stripe_webhook, view_cancel_plan, view_resume_plan

app_name = "users_api"

urlpatterns = [
    path("register/", RegisterUserView.as_view(), name="register"),
    path("register/check/", view_check_new_user, name="check_user"),
    path("token/", LoginUserView.as_view(), name="token_obtain_pair"),
    path("token/refresh/", RefreshTokenView.as_view(), name="token_refresh"),
    path("token/validate/", VerifyTokenView.as_view(), name="token_validate"),
    path("password-reset/", view_reset_password, name="password-reset"),
    path("password-reset/token/", view_password_reset_token, name="password-reset_token"),
    path(
        "password-reset/token/validate/",
        view_validate_password_reset_token,
        name="password-reset_token_validate",
    ),
    path("verification/", view_verify, name="verification"),
    path("verification/token/", view_verification_token, name="verification_token"),
    path("credentials/", view_credentials, name="credentials"),
    path("consents/", view_consents, name="consents"),
    path("access/", view_access, name="access"),
    path("edit/", view_edit_profile, name="edit"),
    path("unsubscribe-newsletter/", view_unsubscribe_newsletter, name="unsubscribe_newsletter"),
    path(
        "subscribe-newsletter/token/",
        view_subscribe_newsletter_token,
        name="subscribe_newsletter_token",
    ),
    path(
        "subscribe-newsletter/verify/",
        view_subscribe_newsletter_verify,
        name="subscribe_newsletter_verify",
    ),
    path("subscriptions/", view_get_subscriptions, name="subscriptions"),
    path("subscriptions/cancel/", view_cancel_plan, name="subscriptions_cancel"),
    path("subscriptions/resume/", view_resume_plan, name="subscriptions_resume"),
    path("payments/webhook/", stripe_webhook, name="stripe_webhook"),
]
