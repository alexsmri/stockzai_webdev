from django.shortcuts import render
from users.models import User
from rest_framework import generics
from .serializers import UserSerializer
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.utils.http import urlsafe_base64_decode
from django.contrib.auth.tokens import default_token_generator
from django.http import JsonResponse

class RegisterUserView(generics.CreateAPIView):
    """
    API view to create a new user.
    """
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny]  # Allow any user to create an account

def verify_email(request, uidb64, token):
    try:
        uid = urlsafe_base64_decode(uidb64).decode()
        user = User.objects.get(pk=uid)

        if default_token_generator.check_token(user, token):
            user.is_active = True
            user.save()
            return JsonResponse({"msg": "Email verification successfull"})
        else:
            return JsonResponse({"error": "Invalid token"}, status=400)
        
    except Exception:
        return JsonResponse({"error": "Something went wrong"}, status=400)