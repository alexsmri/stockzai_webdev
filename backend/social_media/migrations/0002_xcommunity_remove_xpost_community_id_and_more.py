from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ("social_media", "0001_initial"),
    ]

    operations = [
        migrations.CreateModel(
            name="XCommunity",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("name", models.CharField(blank=True, max_length=64, null=True)),
                (
                    "community_id",
                    models.CharField(blank=True, help_text="X Community identifier", max_length=255, null=True),
                ),
            ],
            options={
                "verbose_name": "X Community",
                "verbose_name_plural": "X Communities",
                "ordering": ["name", "community_id"],
            },
        ),
        migrations.RemoveField(
            model_name="xpost",
            name="community_id",
        ),
        migrations.AddField(
            model_name="xpost",
            name="community",
            field=models.ForeignKey(
                blank=True,
                null=True,
                on_delete=django.db.models.deletion.PROTECT,
                related_name="posts",
                to="social_media.xcommunity",
            ),
        ),
    ]
