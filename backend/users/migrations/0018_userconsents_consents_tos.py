from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("users", "0017_product_subscription_pricing_purchase"),
    ]

    operations = [
        migrations.AddField(
            model_name="userconsents",
            name="consents_tos",
            field=models.BooleanField(default=True),
            preserve_default=False,
        ),
    ]
