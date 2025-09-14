from django.urls import path
from .views import RegisterUserView, LoginUserView, RefreshTokenView, VerifyTokenView, view_credentials, view_edit_profile, view_password_reset_token, view_reset_password, view_unsubscribe_newsletter, view_validate_password_reset_token, view_verification_token, view_verify
from django.urls import include

app_name = "users_api"

urlpatterns = [
    path("register/", RegisterUserView.as_view(), name="register"),
    path("token/", LoginUserView.as_view(), name="token_obtain_pair"),
    path("token/refresh/", RefreshTokenView.as_view(), name="token_refresh"),
    path("token/validate/", VerifyTokenView.as_view(), name="token_validate"),
    path('password-reset/', view_reset_password, name="password-reset"),
    path('password-reset/token/', view_password_reset_token, name="password-reset_token"),
    path('password-reset/token/validate/', view_validate_password_reset_token, name="password-reset_token_validate"),
    path('verification/', view_verify, name="verification"),
    path('verification/token/', view_verification_token, name="verification_token"),
    path('credentials/', view_credentials, name="credentials"),
    path('edit/', view_edit_profile, name="edit"),
    path('unsubscribe-newsletter/', view_unsubscribe_newsletter, name="unsubscribe_newsletter"),
]