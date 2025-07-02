from django.contrib import admin
from django.urls import path, include
from .views import view_health

app_name = "stockzAI"

urlpatterns = [
    path('admin/', admin.site.urls),
    path('companies/', include('companies.urls')),
    path('users/', include('users.urls')),
    path('api/users/', include('users.api.urls')),
    path('api/companies/', include('companies.api.urls')),
    path('api-auth/', include('rest_framework.urls', namespace='rest_framework')),
    path('health/', view_health, name="healthcheck"),
]
