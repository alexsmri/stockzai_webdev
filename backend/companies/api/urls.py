from django.urls import path
from .views import CompanyPageView

urlpatterns = [
    path('<str:symbol>/', CompanyPageView.as_view(), name='company_page'),
]
