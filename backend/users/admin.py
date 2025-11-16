from django import forms
from django.contrib import admin
from .models import (
    Email,
    Pricing,
    Product,
    Purchase,
    Subscription,
    TokenNewsletter,
    TokenPasswordReset,
    TokenVerification,
    TrackingEvent,
    User,
    UserConsents,
    UserStatus,
)


class SubscriptionAdminForm(forms.ModelForm):
    class Meta:
        model = Subscription
        fields = "__all__"

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        product = self.instance.product if self.instance.pk else None

        product_initial = self.initial.get("product")
        if product_initial and isinstance(product_initial, Product):
            product = product_initial

        product_id = self.data.get("product") or (
            product_initial.pk if isinstance(product_initial, Product) else product_initial
        )
        if product_id and not isinstance(product, Product):
            try:
                product = Product.objects.get(pk=product_id)
            except (Product.DoesNotExist, ValueError, TypeError):
                product = None

        if product:
            self.fields["pricing"].queryset = Pricing.objects.filter(product=product)
        else:
            self.fields["pricing"].queryset = Pricing.objects.all()
        self.fields["pricing"].required = False
        self.fields["pricing"].help_text = (
            "Select a price that belongs to the chosen product. The list narrows once a product is selected."
        )


@admin.register(Subscription)
class SubscriptionAdmin(admin.ModelAdmin):
    form = SubscriptionAdminForm
    list_display = (
        "user",
        "product",
        "pricing",
        "is_active",
        "provider",
        "provider_subscription_id",
        "cancel_at_period_end",
    )
    list_filter = ("is_active", "cancel_at_period_end", "provider", "product")
    search_fields = ("user__email", "provider_subscription_id", "pricing__stripe_price_id")


@admin.register(Pricing)
class PricingAdmin(admin.ModelAdmin):
    list_display = ("name", "product", "stripe_price_id", "interval", "interval_count", "unit_amount", "currency", "is_active")
    list_filter = ("product", "interval", "is_active")
    search_fields = ("name", "stripe_price_id")


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ("verbose_name", "stripe_product_id", "is_active")
    search_fields = ("name", "verbose_name", "stripe_product_id", "paddle_id")
    list_filter = ("is_active",)


admin.site.register(User)
admin.site.register(TokenPasswordReset)
admin.site.register(TokenVerification)
admin.site.register(TokenNewsletter)
admin.site.register(UserConsents)
admin.site.register(UserStatus)
admin.site.register(Email)
admin.site.register(TrackingEvent)
admin.site.register(Purchase)

