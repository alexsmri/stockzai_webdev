from django.db import models


class DBSnapshots(models.Model):
    class SnapshotType(models.TextChoices):
        COMPANY_WINNERS = ("company_winners", "Company Winners")
        SECTOR_LEADERBOARD = ("sector_leaderboard", "Sector Leaderboard")

    type = models.CharField(max_length=64, choices=SnapshotType.choices, unique=True)
    date = models.DateTimeField(auto_now=True)
    value = models.JSONField(blank=True, null=True)
    value2 = models.JSONField(blank=True, null=True)

    class Meta:
        verbose_name = "DB Snapshot"
        verbose_name_plural = "DB Snapshots"
        ordering = ["type"]

    def __str__(self) -> str:
        return f"{self.type}"
