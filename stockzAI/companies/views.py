from django.shortcuts import render, get_list_or_404
from django.db import models
from .models import Company
from .DBHandler import DBHandler

db = DBHandler("companies")


def company_list(request):
    return render(request, 'company_page.html')


def company_page(request, symbol):
    intel = db.retrieve_company_data(symbol)
    latest_entries = intel["latest_entries"]
    company_intel = intel["company_intel"]
    dasharrays = {}
    for score in ["financial_score", "valuation_score"]:
        if score in latest_entries.keys():
            dasharrays[score] = latest_entries[score] / 10 * 264

    return render(request, 'company_page.html', {'company_intel': company_intel, 'latest_entries': latest_entries, 'dasharrays': dasharrays, "symbol": symbol})
# Create your views here.
