from django.shortcuts import render, get_list_or_404
from django.db import models
from .models import Company


def company_list(request):
    return render(request, 'company_page.html')


def company_page(request, symbol):
    company = get_list_or_404(Company, symbol=symbol)
    company = company[0]
    return render(request, 'company_page.html', {'company': company})
# Create your views here.
