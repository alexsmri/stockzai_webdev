from django.db import models


class Company(models.Model):
    symbol = models.CharField(max_length=20, primary_key=True, unique=True)
    name = models.CharField(max_length=256, null=True)
    sector = models.CharField(max_length=256, null=True)
    industry = models.CharField(max_length=256, null=True)
    employees = models.IntegerField(null=True)
    currency = models.CharField(max_length=256, null=True)
    country = models.CharField(max_length=256, null=True)
    financial_score = models.FloatField(null=True)
    valuation_score = models.FloatField(null=True)
    date_revised = models.DateField(auto_now_add=True, null=True)

    def __str__(self):
        return self.symbol

# Create your models here.
