from django.contrib.auth import get_user_model
from rest_framework import serializers
from django.utils.http import urlsafe_base64_encode
from django.utils.encoding import force_bytes
from django.conf import settings

from django.template.loader import render_to_string
from django.core.mail import EmailMultiAlternatives
from django.utils.html import strip_tags
from ..tokens import verification_token

User = get_user_model()
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "email", "username", "password", "first_name", "last_name", "phone"]
        extra_kwargs = {"id": {"read_only": True},
                        "password": {"write_only": True}}

    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        user.is_active = False
        user.save()
        
        base_url = settings.FRONTEND_URL
        uid = urlsafe_base64_encode(force_bytes(user.pk))
        token = verification_token.make_token(user)

        link = f"{base_url}/?uid={uid}/?token={token}"
        context = {
            'link': link,
            'email_adress': user.email,
        }

        html_message = render_to_string("email_verification.html", context=context)
        plain_message = strip_tags(html_message)

        msg = EmailMultiAlternatives(
            subject = "Verify your registration",
            body = plain_message,
            from_email = "alex@stockz.ai",
            to=[user.email]
        )

        msg.attach_alternative(html_message, "text/html")
        try:
            msg.send()
        except Exception as e:
            print("Email sending failed", e)
        return user