from django.shortcuts import render, redirect
from django.db import models
from .function.DBHandler import DBHandler
from django.http import Http404
import logging
from django.conf import settings
from django.contrib.auth.decorators import login_required

fmt = getattr(settings, 'LOG_FORMAT', None)
lvl = getattr(settings, 'LOG_LEVEL', logging.DEBUG)

logging.basicConfig(format=fmt, level=lvl)

db = DBHandler("companies")


def list_view(request):
    return render(request, 'page.html')

@login_required
def page_view(request, symbol):
    intel = db.retrieve_company_data(symbol)
    latest_entries = intel["latest_entries"]
    company_intel = intel["company_intel"]
    style_dict = {}
    for score in ["financial_score", "valuation_score"]:
        if score in latest_entries.keys():
            style_dict[score] = float(264 - latest_entries[score] * (234.667 / 10))
    logging.debug(str(style_dict))
    if not latest_entries:
        raise Http404("No data found for this symbol.")
    return render(request, 'page.html', {'company_intel': company_intel, 'latest_entries': latest_entries, 'style_dict': style_dict, "symbol": symbol})

def search_view(request):
    query = request.GET.get('q')
    results = []

    if query:
        results = db.search_company(query)
        logging.debug(results)
    return render(request, 'search.html', {"results": results, "query": query})
