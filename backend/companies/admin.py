from django.contrib import admin

from .models import DBSnapshots


@admin.register(DBSnapshots)
class DBSnapshotAdmin(admin.ModelAdmin):
    list_display = ("type", "date")
    search_fields = ("type",)
    ordering = ("type",)
