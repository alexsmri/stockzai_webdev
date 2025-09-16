from django.shortcuts import render
from django.db import transaction
from django.views.decorators.csrf import csrf_exempt
from users.models import User, TokenVerification, TokenPasswordReset, UserConsents
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView, TokenVerifyView
from rest_framework import generics
from rest_framework.exceptions import ValidationError
from .serializers import UserSerializer, TokenLoginSerializer, TokenRefreshSerializer, TokenVerifySerializer
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import force_bytes
from stockzAI.response import api_json_response
from users.tokens import make_otp, password_reset_token
from rest_framework.decorators import permission_classes, api_view
import json
import logging

logger = logging.getLogger(__name__)
VERIFICATION_OTP_DIGITS = 6

class RegisterUserView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny]

    @transaction.atomic
    def perform_create(self, serializer):
        user = serializer.save()
        consents_data = self.request.data.get("consents") or {}
        if consents_data:
            UserConsents.objects.create(user=user, **consents_data)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)

        try:
            serializer.is_valid(raise_exception=True)
            self.perform_create(serializer)
            return api_json_response(msg=serializer.data, status=200)
        
        except ValidationError as e:
            error = ""
            for _, errs in e.detail.items():
                for err in errs:
                    error += f"{str(err)} "
            return api_json_response(error=error, status=200)

class LoginUserView(TokenObtainPairView):
    serializer_class = TokenLoginSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)

        try:
            serializer.is_valid(raise_exception=True)
        except Exception as e:
            return api_json_response(error="Credentials Invalid.", status=200)
        msg={
            "access": serializer.validated_data["access"],
            "refresh": serializer.validated_data["refresh"],
            }
        return api_json_response(msg=msg)
    
class RefreshTokenView(TokenRefreshView):
    serializer_class = TokenRefreshSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)

        try:
            serializer.is_valid(raise_exception=True)
        except Exception as e:
            return api_json_response(error="Credentials Invalid.", status=400)
        msg={
            "access": serializer.validated_data["access"],
            }
        return api_json_response(msg=msg)

class VerifyTokenView(TokenVerifyView):
    serializer_class = TokenVerifySerializer
    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)

        try:
            serializer.is_valid(raise_exception=True)
        except Exception as e:
            return api_json_response(error="Credentials Invalid.", status=400)
        msg="Credentials valid."
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
            token = make_otp(VERIFICATION_OTP_DIGITS)
            uid = urlsafe_base64_encode(force_bytes(user.pk))
            TokenVerification.objects.filter(user=user).delete()
            TokenVerification.objects.create(user=user, token=token, uid=uid)
            return api_json_response(msg={"uid": uid})
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
        logger.info(f"Token: {token} UID: {uid}")
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
        logger.exception(e)
        return api_json_response(error="Something went wrong", status=400)
    
    except Exception as e:
        return api_json_response(error="Something went wrong", status=400)
    
@api_view(["POST"])
@permission_classes([AllowAny])
def view_password_reset_token(request):
    try:
        body = json.loads(request.body)
        email = body.get("email")
        user = User.objects.get(email=email)
        if user:
            token = password_reset_token.make_token(user)
            uid = urlsafe_base64_encode(force_bytes(user.pk))
            TokenPasswordReset.objects.filter(user=user).delete()
            token_obj = TokenPasswordReset(user=user, token=token, uid=uid)
            token_obj.save()
            return api_json_response(msg=True)
    except Exception as e:
        logger.exception(e)
        return api_json_response(error="Something went wrong", status=400)

@api_view(["POST"])
@permission_classes([AllowAny])
def view_validate_password_reset_token(request):
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
        return api_json_response(msg=False, error="Something went wrong", status=200)
    
@api_view(["POST"])
@permission_classes([AllowAny])
def view_reset_password(request):
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
        return api_json_response(error="Something went wrong", status=400)

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def view_credentials(request):
    user = request.user
    msg = {
        "email": user.email,
        "username": user.username,
    }
    return api_json_response(msg=msg)

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def view_edit_profile(request):
    try:
        body = json.loads(request.body)
        user = request.user
        new_username = body.get("username")

        if User.objects.filter(username=new_username):
            return api_json_response(error="Username already taken")
        
        user.username = new_username
        user.save()
        return api_json_response(msg=True)
    except Exception as e:
        return api_json_response(error=str(e))
    
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def view_unsubscribe_newsletter(request):
    try:
        user = request.user
        consents = UserConsents.objects.get(user=user)
        consents.consents_newsletter = False
        consents.save()
        return api_json_response(msg=True)
    except Exception as e:
        return api_json_response(error=str(e))
    
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def view_consents(request):
    user = request.user
    try:
        consents = UserConsents.objects.get(user=user)
        if consents:
            msg = {
                "consents_newsletter": consents.consents_newsletter,
            }
    except UserConsents.DoesNotExist:
        msg = {}
    except Exception as e:
        return api_json_response(error="Something went wrong", status=400)
    return api_json_response(msg=msg)