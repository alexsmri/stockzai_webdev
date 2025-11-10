from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("social_media", "0003_prompt"),
    ]

    operations = [
        migrations.AddField(
            model_name="xpost",
            name="is_in_review",
            field=models.BooleanField(default=False),
        ),
    ]

