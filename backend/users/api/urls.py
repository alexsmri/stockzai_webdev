from django.urls import path
from .views import RegisterUserView, LoginUserView, view_password_reset_token, view_reset_password, view_verify, view_verification_token, view_validate_password_reset_token, view_credentials
from rest_framework_simplejwt.views import TokenRefreshView
from django.urls import include

app_name = "users_api"

urlpatterns = [
    path("register/", RegisterUserView.as_view(), name="register"),
    path("token/", LoginUserView.as_view(), name="token_obtain_pair"),
    path("token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path('password_reset/', view_reset_password, name="password_reset"),
    path('password_reset/token/', view_password_reset_token, name="password_reset_token"),
    path('password_reset/token/validate/', view_validate_password_reset_token, name="password_reset_token_validate"),
    path('verification/', view_verify, name="verification"),
    path('verification/token/', view_verification_token, name="verification_token"),
    path('credentials/', view_credentials, name="credentials"),
]