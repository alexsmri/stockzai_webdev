from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0020_remove_subscription_provider_plan_id_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='product',
            name='stripe_price_id',
            field=models.CharField(blank=True, max_length=128),
        ),
        migrations.AddField(
            model_name='product',
            name='stripe_product_id',
            field=models.CharField(blank=True, max_length=128, unique=True),
        ),
        migrations.AddField(
            model_name='user',
            name='stripe_customer_id',
            field=models.CharField(blank=True, max_length=128, verbose_name='stripe_customer_id'),
        ),
    ]
