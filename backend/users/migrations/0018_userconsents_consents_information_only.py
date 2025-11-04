from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("users", "0017_product_remove_user_first_name_remove_user_last_name_and_more"),
    ]

    operations = [
        migrations.AddField(
            model_name="userconsents",
            name="consents_information_only",
            field=models.BooleanField(default=False),
        ),
    ]

