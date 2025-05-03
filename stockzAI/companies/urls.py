from django.urls import path
from . import views

urlpatterns = [
    path('', views.company_list, name='company_list'),
    path('<str:symbol>', views.company_page, name='company_page')
]