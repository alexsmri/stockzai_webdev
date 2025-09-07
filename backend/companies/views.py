from django.shortcuts import render
from django.http import HttpResponse
from .tasks import fetch_company_winners

def test_tasks(request):
    fetch_company_winners.delay()
    return HttpResponse("Task started!")