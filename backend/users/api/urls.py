from django.urls import path
from .views import RegisterUserView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from django.urls import include

app_name = "users_api"

urlpatterns = [
    path("register/", RegisterUserView.as_view(), name="register"),
    path("token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path('password_reset/', include('django_rest_passwordreset.urls'), name="password_reset")
]