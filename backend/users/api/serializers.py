from django.contrib.auth import get_user_model
from rest_framework import serializers
from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import force_bytes
from django.conf import settings
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer, TokenVerifySerializer as JWTVerifySerializer, TokenRefreshSerializer as JWTRefreshSerializer
from users.models import UserStatus

User = get_user_model()
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "email", "username", "password"]
        extra_kwargs = {
            "id": {"read_only": True},
            "password": {"write_only": True},
            "username": {"required": True, "allow_blank": False},
        }

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Email is already in use.")
        return value

    def validate_username(self, value):
        username = (value or "").strip()
        if not username:
            raise serializers.ValidationError("Username is required.")
        if User.objects.filter(username__iexact=username).exists():
            raise serializers.ValidationError("Username is already taken.")
        return username
    
    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        user.is_active = False
        user.save()
        return user

class UserStatusSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserStatus
        fields = ["completed_onboarding"]

class TokenLoginSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)

        user = self.user
        data.update({
            "msg": "Login successful",
            "user": {
                "uid": user.pk,
                "email": user.email,
                "username": user.username,
            }
        })

        return data

class TokenRefreshSerializer(JWTRefreshSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)

        data.update({
            "msg": "Token Refreshed",
        })
        return data

class TokenVerifySerializer(JWTVerifySerializer):
    def validate(self, attrs):
        super().validate(attrs)
        return {"msg": "Token Verified."}
