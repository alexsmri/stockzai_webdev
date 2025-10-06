from django.urls import path

from .views import (
    CompanyLeaderboardView,
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
    path('<str:symbol>/', CompanyPageView.as_view(), name='company_page'),
]
