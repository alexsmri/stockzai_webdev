from django.contrib import admin
from django.urls import path, include
from .views import error_404_view

app_name = "stockzAI"

urlpatterns = [
    path('admin/', admin.site.urls),
    path('companies/', include('companies.urls')),
    path('users/', include('users.urls')),
]

handler404 = "stockzAI.views.error_404_view"
