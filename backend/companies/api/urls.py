from django.urls import path
from .views import CompanyPageView, KPIView, CompanySearchView

urlpatterns = [
    path('kpis/', KPIView.as_view(), name="kpis"),
    path('search/<str:query>/', CompanySearchView.as_view(), name="company_search"),
    path('<str:symbol>/', CompanyPageView.as_view(), name='company_page'),
]
