from django.shortcuts import render
from django.views.decorators.csrf import csrf_exempt
from users.models import User, TokenVerification, TokenPasswordReset
from rest_framework import generics
from .serializers import UserSerializer
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import force_bytes
from django.http import JsonResponse
from users.tokens import VerificationTokenGenerator, PasswordResetTokenGenerator
import json

class RegisterUserView(generics.CreateAPIView):
    """
    API view to create a new user.
    """
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny]  # Allow any user to create an account

@csrf_exempt
def view_verification_token(request):
    if request.method != "POST":
        return JsonResponse({"error": "Only POST requests allowed"}, status=400)
    try:
        body = json.loads(request.body)
        email = body.get('email')
        user = User.objects.get(email=email)
        if user:
            token = VerificationTokenGenerator().make_token(user)
            uid = urlsafe_base64_encode(force_bytes(user.pk))
            TokenVerification.objects.create(user=user, token=token, uid=uid)
            return JsonResponse({"msg": "Token created and saved."})
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=400)
'''
@csrf_exempt
def view_validate_verification_token(request):
    if request.method != "GET":
        return JsonResponse({"error": "Only GET requests allowed"}, status=400)
    try:
        token = request.GET.get("token")
        uid = request.GET.get("uid")
        email = request.GET.get("email")
        token_obj = TokenVerification.objects.get(token=token, uid=uid)
        user = token_obj.user
        token_obj = token_obj if user.email == email else None
        
        if token_obj:
            
            if token_obj.is_expired():
                return JsonResponse({"msg": False}, status=200)
            if token_obj.is_used:
                return JsonResponse({"msg": False}, status=200)
            
            return JsonResponse({"msg": True}, status=200)
        
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=400)
'''
@csrf_exempt
def view_verify(request):
    if request.method != "POST":
        return JsonResponse({"error": "Only POST requests allowed"}, status=400)
    try:
        body = json.loads(request.body)
        token = body.get("token")
        uid = body.get("uid")
        email = body.get("email")
        print(token, uid, email)
        token_obj = TokenVerification.objects.get(token=token, uid=uid)
        user = token_obj.user
        token_obj = token_obj if user.email == email else None
        if token_obj:
            if token_obj.is_expired():
                return JsonResponse({"error": "Token expired."}, status=400)
            if token_obj.is_used:
                return JsonResponse({"error": "Token already in use."}, status=400)
            
            token_obj.is_used = True
            token_obj.save()

            user.is_active = True
            user.save()

            return JsonResponse({"msg": "User Verification successful!"}, status=200)
    
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=400)
    
@csrf_exempt
def view_password_reset_token(request):
    if request.method != "POST":
        return JsonResponse({"error": "Only POST requests allowed"}, status=400)
    try:
        email = request.POST.get("email")
        user = User.objects.get(email=email)
        if user:
            token = PasswordResetTokenGenerator().make_token(user)
            uid = urlsafe_base64_encode(force_bytes(user.pk))
            TokenPasswordReset.objects.create(user=user, token=token, uid=uid)
            return JsonResponse({"msg": "Token created and saved."})
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=400)

@csrf_exempt
def view_validate_password_reset_token(request):
    if request.method != "GET":
        return JsonResponse({"error": "Only GET requests allowed"}, status=400)
    try:
        token = request.GET.get("token")
        uid = request.GET.get("uid")
        email = request.GET.get("email")
        token_obj = TokenPasswordReset.objects.get(token=token, uid=uid)
        user = token_obj.user
        token_obj = token_obj if user.email == email else None
        
        if token_obj:
            
            if token_obj.is_expired():
                return JsonResponse({"msg": False}, status=200)
            if token_obj.is_used:
                return JsonResponse({"msg": False}, status=200)
            
            return JsonResponse({"msg": True}, status=200)
        
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=400)
    
@csrf_exempt
def view_reset_password(request):
    if request.method != "POST":
        return JsonResponse({"error": "Only POST requests allowed"}, status=400)
    try:
        token = request.POST.get("token")
        uid = request.POST.get("uid")
        email = request.POST.get("email")
        password = request.POST.get("password")
        token_obj = TokenPasswordReset.objects.get(token=token, uid=uid)
        user = token_obj.user
        token_obj = token_obj if user.email == email else None
        if token_obj:
            if token_obj.is_expired():
                return JsonResponse({"error": "Token expired."}, status=400)
            if token_obj.is_used:
                return JsonResponse({"error": "Token already in use."}, status=400)
            
            token_obj.is_used = True
            token_obj.save()

            user.set_password(password)
            user.save()

            return JsonResponse({"msg": "Password Reset successful!"}, status=200)
    
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=400)

