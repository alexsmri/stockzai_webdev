from django.db import models
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin
from django.utils.translation import gettext_lazy as _
from django.utils import timezone

from .managers import UserManager

class User(AbstractBaseUser, PermissionsMixin):
    username = models.CharField(_("username"), max_length=30, unique=True)
    email = models.EmailField(_("email address"), unique=True)
    first_name = models.CharField(max_length=30, blank=True)
    last_name = models.CharField(max_length=30, blank=True)
    phone = models.CharField(max_length=30, blank=True)
    
    is_staff = models.BooleanField(default=False)
    is_superuser = models.BooleanField(default=False)
    is_active = models.BooleanField(default=False)
    
    date_joined = models.DateField(default=timezone.now)

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["username"]

    objects = UserManager()

    def __str__(self):
        return self.username
    
    class Meta:
        permissions = [
            ("is_og", "Eligible for OG treatment"),
            ("is_paid", "Owns a subscription"),
        ]

