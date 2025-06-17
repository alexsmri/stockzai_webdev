from django.urls import path
from .views import RegisterUserView, view_password_reset_token, view_reset_password, view_verify, view_verification_token, view_validate_verification_token, view_validate_password_reset_token
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from django.urls import include

app_name = "users_api"

urlpatterns = [
    path("register/", RegisterUserView.as_view(), name="register"),
    path("token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path('password_reset/', view_reset_password, name="password_reset"),
    path('password_reset/token', view_validate_password_reset_token, name="password_reset_token"),
    path('password_reset/token/validate', view_validate_password_reset_token, name="password_reset_token_validate"),
    path('verification/', view_verify, name="verification"),
    path('verification/token', view_verification_token, name="verification_token"),
    path('verification/token/validate', view_validate_verification_token, name="verification_token_validate"),
]