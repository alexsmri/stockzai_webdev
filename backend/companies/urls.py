from django.contrib import admin
from django.urls import path, include
from .views import test_tasks

app_name = "stockzAI"

urlpatterns = [
    path('test_tasks/', test_tasks, name="testtask"),
]
