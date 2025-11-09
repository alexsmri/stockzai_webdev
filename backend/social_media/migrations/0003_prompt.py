from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("social_media", "0002_xcommunity_remove_xpost_community_id_and_more"),
    ]

    operations = [
        migrations.CreateModel(
            name="Prompt",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                (
                    "prompt_type",
                    models.CharField(
                        choices=[("x_post_master", "X Post Master")],
                        help_text="Identifier for this prompt’s usage.",
                        max_length=64,
                        unique=True,
                    ),
                ),
                ("text", models.TextField(help_text="Full prompt content used for generation.")),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
            ],
            options={
                "verbose_name": "Prompt",
                "verbose_name_plural": "Prompts",
                "ordering": ["prompt_type"],
            },
        ),
    ]
