from django.shortcuts import render
from django.views.decorators.csrf import csrf_exempt
from users.models import User, TokenVerification, TokenPasswordReset
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework import generics
from .serializers import UserSerializer, TokenLoginSerializer
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import force_bytes
from stockzAI.response import api_json_response
from users.tokens import verification_token, password_reset_token
from rest_framework.decorators import permission_classes, api_view
import json
import traceback

class RegisterUserView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny]


class LoginUserView(TokenObtainPairView):
    serializer_class = TokenLoginSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)

        try:
            serializer.is_valid(raise_exception=True)
        except Exception as e:
            return api_json_response(error="Credentials Invalid.", status=400)
        msg={
            "access": serializer.validated_data["access"],
            "refresh": serializer.validated_data["refresh"],
            }
        return api_json_response(msg=msg)
    

@csrf_exempt
def view_verification_token(request):
    if request.method != "POST":
        return api_json_response(error="Only POST requests allowed", status=400)
    try:
        body = json.loads(request.body)
        email = body.get('email')
        user = User.objects.get(email=email)
        if user:
            token = verification_token.make_token(user)
            uid = urlsafe_base64_encode(force_bytes(user.pk))
            TokenVerification.objects.filter(user=user).delete()
            TokenVerification.objects.create(user=user, token=token, uid=uid)
            return api_json_response(msg=True)
    except Exception as e:
        return api_json_response(error="Something went wrong", status=400)

@csrf_exempt
def view_verify(request):
    if request.method != "POST":
        return api_json_response(error="Only POST requests allowed", status=400)
    try:
        body = json.loads(request.body)
        token = body.get("token")
        uid = body.get("uid")
        token_obj = TokenVerification.objects.get(token=token, uid=uid)
        user = token_obj.user
        if token_obj:
            if token_obj.is_expired():
                return api_json_response(error="Token Invalid.", status=400)
            if token_obj.is_used:
                return api_json_response(error="Token Invalid.", status=400)
            
            token_obj.is_used = True
            token_obj.save()

            user.is_active = True
            user.save()

            return api_json_response(msg=True)
    
    except Exception as e:
        print(e)
        return api_json_response(error="Something went wrong", status=400)
    
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def view_password_reset_token(request):
    if request.method != "POST":
        return api_json_response(error="Only POST requests allowed", status=400)
    try:
        body = json.loads(request.body)
        email = body.get("email")
        user = User.objects.get(email=email)
        if user:
            token = password_reset_token.make_token(user)
            uid = urlsafe_base64_encode(force_bytes(user.pk))
            print("A")
            TokenPasswordReset.objects.filter(user=user).delete()
            print("B")
            token_obj = TokenPasswordReset(user=user, token=token, uid=uid)
            print("token_obj.uid type:", type(token_obj.uid))
            token_obj.save()
            return api_json_response(msg=True)
    except Exception as e:
        traceback.print_exc()
        return api_json_response(error="Something went wrong", status=400)

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def view_validate_password_reset_token(request):
    if request.method != "POST":
        return api_json_response(error="Only POST requests allowed", status=400)
    try:
        body = json.loads(request.body)
        token = body.get("token")
        uid = body.get("uid")
        token_obj = TokenPasswordReset.objects.get(token=token, uid=uid)
        
        if token_obj:
            
            if token_obj.is_expired():
                return api_json_response(msg=False)
            if token_obj.is_used:
                return api_json_response(msg=False)
            
            return api_json_response(msg=True)
        
    except Exception as e:
        traceback.print_exc()
        return api_json_response(error="Something went wrong", status=400)
    
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def view_reset_password(request):
    if request.method != "POST":
        return api_json_response(error="Only POST requests allowed", status=400)
    try:
        body = json.loads(request.body)
        token = body.get("token")
        uid = body.get("uid")
        password = body.get("password")
        token_obj = TokenPasswordReset.objects.get(token=token, uid=uid)
        user = token_obj.user
        if token_obj:
            if token_obj.is_expired():
                return api_json_response(msg=False)
            if token_obj.is_used:
                return api_json_response(msg=False)
            
            token_obj.is_used = True
            token_obj.save()

            user.set_password(password)
            user.save()

            return api_json_response(msg=True)
    
    except Exception as e:
        traceback.print_exc()
        return api_json_response(error="Something went wrong", status=400)

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def view_credentials(request):
    if request.method != "GET":
        return api_json_response(error="Only GET requests allowed", status=400)
    
    user = request.user
    msg = {
        "uid": user.pk,
        "email": user.email,
        "username": user.username,
        "is_active": user.is_active,
        "is_staff": user.is_staff,
        "is_superuser": user.is_superuser
    }
    return api_json_response(msg=msg)
