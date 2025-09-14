from django.urls import path
import views
from django.urls import include

app_name = "users_api"

urlpatterns = [
    path("register/", views.RegisterUserView.as_view(), name="register"),
    path("token/", views.LoginUserView.as_view(), name="token_obtain_pair"),
    path("token/refresh/", views.RefreshTokenView.as_view(), name="token_refresh"),
    path("token/validate/", views.VerifyTokenView.as_view(), name="token_validate"),
    path('password-reset/', views.view_reset_password, name="password-reset"),
    path('password-reset/token/', views.view_password_reset_token, name="password-reset_token"),
    path('password-reset/token/validate/', views.view_validate_password_reset_token, name="password-reset_token_validate"),
    path('verification/', views.view_verify, name="verification"),
    path('verification/token/', views.view_verification_token, name="verification_token"),
    path('credentials/', views.view_credentials, name="credentials"),
    path('edit/', views.view_edit_profile, name="edit"),
    path('unsubscribe-newsletter/', views.view_unsubscribe_newsletter, name="unsubscribe_newsletter"),
]