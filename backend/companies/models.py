from django.db import models

class WinnerEntry(models.Model):
    date = models.DateField(auto_now_add=True)
    winners = models.JSONField(blank=False)