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

    def _entitled_products(self):
        """Collect active products user currently has access to via subscriptions or purchases."""
        products = {}

        try:
            subscription = self.subscription
        except Subscription.DoesNotExist:
            subscription = None
        if subscription and subscription.has_valid_access():
            products[subscription.product_id] = subscription.product

        for purchase in self.purchases.select_related('product').all():
            product = purchase.product
            if product and product.is_active:
                products[product.pk] = product

        return list(products.values())

    def has_permission(self, permission_code: str) -> bool:
        if not permission_code:
            return False

        for product in self._entitled_products():
            permissions = product.permissions or []
            if permission_code in permissions:
                return True
        return False

    def has_product(self, product_lookup) -> bool:
        if product_lookup is None:
            return False

        for product in self._entitled_products():
            if isinstance(product_lookup, Product):
                if product.pk == product_lookup.pk:
                    return True
            elif isinstance(product_lookup, int):
                if product.pk == product_lookup:
                    return True
            else:
                if str(product_lookup) == product.name:
                    return True
        return False


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

class Permission(models.Model):
    name = models.CharField(max_length=128, unique=True)
    description = models.TextField(blank=True)

    def __str__(self):
        return self.name
    
class Product(models.Model):
    name = models.CharField(max_length=128, unique=True)
    description = models.TextField(blank=True)
    #TODO: permissions = models.Field(default=list, blank=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.name


class Pricing(models.Model):
    INTERVAL_MONTHLY = 'monthly'
    INTERVAL_QUARTERLY = 'quarterly'
    INTERVAL_YEARLY = 'yearly'
    INTERVAL_ONETIME = 'onetime'

    INTERVAL_CHOICES = [
        (INTERVAL_MONTHLY, 'Monthly'),
        (INTERVAL_QUARTERLY, 'Quarterly'),
        (INTERVAL_YEARLY, 'Yearly'),
        (INTERVAL_ONETIME, 'One-time'),
    ]

    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='pricings')
    name = models.CharField(max_length=128)
    description = models.TextField(blank=True)
    interval = models.CharField(max_length=16, choices=INTERVAL_CHOICES)
    price_per_interval = models.DecimalField(max_digits=10, decimal_places=2)
    is_active = models.BooleanField(default=True)

    class Meta:
        unique_together = ('product', 'name', 'interval')

    def __str__(self):
        return f"{self.product.name} - {self.name} ({self.interval})"


class Subscription(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='subscription')
    product = models.ForeignKey(Product, on_delete=models.PROTECT, related_name='subscriptions')
    is_active = models.BooleanField(default=True)
    started_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField(null=True, blank=True)
    cancel_at_period_end = models.BooleanField(default=False)
    provider = models.CharField(max_length=64, blank=True)
    provider_subscription_id = models.CharField(max_length=128, blank=True)
    provider_plan_id = models.CharField(max_length=128, blank=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Subscription<{self.user_id} -> {self.product_id}>"

    def has_valid_access(self) -> bool:
        if not self.is_active:
            return False
        if not self.product.is_active:
            return False
        if self.expires_at and self.expires_at <= timezone.now():
            return False
        return True


class Purchase(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='purchases')
    product = models.ForeignKey(Product, on_delete=models.PROTECT, related_name='purchases')
    provider = models.CharField(max_length=64, blank=True)
    provider_transaction_id = models.CharField(max_length=128, blank=True)
    purchased_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'product')

    def __str__(self):
        return f"Purchase<{self.user_id} -> {self.product_id}>"

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
