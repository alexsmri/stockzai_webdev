from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = []

    operations = [
        migrations.CreateModel(
            name="XPost",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("prompt", models.TextField(help_text="Raw instruction used to craft an X post.")),
                (
                    "scheduled_for",
                    models.DateTimeField(
                        blank=True,
                        help_text="When the post should go live. Defaults to creation time + 1 hour.",
                        null=True,
                    ),
                ),
                (
                    "community_id",
                    models.CharField(
                        blank=True,
                        help_text="Optional X Community identifier to target.",
                        max_length=255,
                        null=True,
                    ),
                ),
                ("post", models.TextField(blank=True, help_text="Final copy that will be sent to X.")),
                ("is_written", models.BooleanField(default=False)),
                ("is_posted", models.BooleanField(default=False)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
            ],
            options={
                "ordering": ["-scheduled_for", "-created_at"],
                "verbose_name": "X Post",
                "verbose_name_plural": "X Posts",
            },
        ),
    ]
