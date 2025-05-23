from django.urls import path
from django.conf import settings
from django.conf.urls.static import static
from . import views

app_name = "companies"

urlpatterns = [
    path('', views.list_view, name='list'),
    path('search/', views.search_view, name="search"),
    path('<str:symbol>/', views.page_view, name='page'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)