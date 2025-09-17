from django.db import models
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin
from django.utils.translation import gettext_lazy as _
from django.utils import timezone
from datetime import timedelta

from .managers import UserManager


class User(AbstractBaseUser, PermissionsMixin):
    username = models.CharField(_('username'), max_length=30, unique=True)
    email = models.EmailField(_('email address'), unique=True)
    first_name = models.CharField(max_length=30, blank=True)
    last_name = models.CharField(max_length=30, blank=True)
    phone = models.CharField(max_length=30, blank=True)

    is_staff = models.BooleanField(default=False)
    is_superuser = models.BooleanField(default=False)
    is_active = models.BooleanField(default=False)

    date_joined = models.DateField(default=timezone.now)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    objects = UserManager()

    def __str__(self):
        return self.username

    class Meta:
        permissions = [
            ('is_og', 'Eligible for OG treatment'),
            ('is_paid', 'Owns a subscription'),
        ]


class TokenPasswordReset(models.Model):
    uid = models.CharField(max_length=256, editable=False, unique=True)
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='password_reset_token')
    token = models.CharField(max_length=64, editable=False)
    created_at = models.DateTimeField(auto_now_add=True)
    is_used = models.BooleanField(default=False)

    def is_expired(self):
        return self.created_at < timezone.now() - timedelta(hours=24)


class TokenVerification(models.Model):
    uid = models.CharField(max_length=256, unique=True, editable=False)
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='verification_token')
    token = models.CharField(max_length=6, editable=False)
    created_at = models.DateTimeField(auto_now_add=True)
    is_used = models.BooleanField(default=False)

    def is_expired(self):
        return self.created_at < timezone.now() - timedelta(hours=24)


class TokenNewsletter(models.Model):
    uid = models.CharField(max_length=256, unique=True, editable=False)
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='newsletter_token')
    token = models.CharField(max_length=6, editable=False)
    created_at = models.DateTimeField(auto_now_add=True)
    is_used = models.BooleanField(default=False)

    def is_expired(self):
        return self.created_at < timezone.now() - timedelta(hours=24)


class UserConsents(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='consents')
    consents_newsletter = models.BooleanField(default=False)
    given_at = models.DateTimeField(auto_now_add=True)

class TrackingEvent(models.Model):
    EVENT_NEWSLETTER_UNSUB = 'newsletter_unsubscribe'
    EVENT_SEARCH_QUERY = 'search_query'
    EVENT_TICKER_VIEW = 'ticker_view'

    EVENT_CHOICES = [
        (EVENT_NEWSLETTER_UNSUB, 'Newsletter unsubscribe'),
        (EVENT_SEARCH_QUERY, 'Search query'),
        (EVENT_TICKER_VIEW, 'Ticker view'),
    ]

    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='tracking_events')
    event_type = models.CharField(max_length=64, choices=EVENT_CHOICES)
    payload = models.JSONField(default=dict, blank=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        indexes = [
            models.Index(fields=['event_type', 'created_at']),
            models.Index(fields=['created_at']),
        ]
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.event_type} @ {self.created_at:%Y-%m-%d %H:%M:%S}"
