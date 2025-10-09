from django.urls import path

from .views import (
    CompanyDistinctKPIValuesView,
    CompanyLeaderboardView,
    CompanyFreePageView,
    CompanyPageView,
    CompanySearchView,
    CompanyWinnersView,
    KPIView,
)

urlpatterns = [
    path('kpis/', KPIView.as_view(), name='kpis'),
    path('search/<str:query>/', CompanySearchView.as_view(), name='company_search'),
    path('winners/', CompanyWinnersView.as_view(), name='company_winners'),
    path('leaderboard/', CompanyLeaderboardView.as_view(), name='company_leaderboard'),
    path('distinct/', CompanyDistinctKPIValuesView.as_view(), name='company_distinct_kpi'),
    path('free/<str:symbol>/', CompanyFreePageView.as_view(), name='company_page_free'),
    path('<str:symbol>/', CompanyPageView.as_view(), name='company_page'),
]
