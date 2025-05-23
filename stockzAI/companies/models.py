from django.db import models

class KPI(models.Model):
    KPI_ROLES = [
        ('income_statement', "Income Statement"),
        ('balance_sheet', "Balance Sheet"),
        ('cashflow_statement', "Cash Flow Statement"),
        ('basics', "Basic Information"),
        ('swot', "SWOT Analysis"),
        ('ratios', "Financial Ratios"),
        ('valuation', "Valuation Ratios"),
        ('dividends', "Dividends"),
        ('scores', "Scores"),
        ('business', 'Business'),
        ('news', 'News')
    ]
    id = models.IntegerField(primary_key=True, unique=True)
    name = models.CharField(max_length=256, unique=True)
    role = models.CharField(max_length=256, choices=KPI_ROLES)
    scoring = models.CharField(max_length=2, null=True)

    def __str__(self):
        return self.name

# Create your models here.
