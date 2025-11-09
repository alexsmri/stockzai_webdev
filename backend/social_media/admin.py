from django.contrib import admin

from .models import Prompt, XCommunity, XPost


@admin.register(Prompt)
class PromptAdmin(admin.ModelAdmin):
    list_display = ("id", "prompt_type", "updated_at")
    list_filter = ("prompt_type",)
    search_fields = ("text",)


@admin.register(XCommunity)
class XCommunityAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "community_id")
    search_fields = ("name", "community_id")


@admin.register(XPost)
class XPostAdmin(admin.ModelAdmin):
    list_display = ("id", "scheduled_for", "is_written", "is_posted", "community")
    list_filter = ("is_written", "is_posted")
    search_fields = ("prompt", "post", "community__name", "community__community_id")
    autocomplete_fields = ("community",)
    ordering = ("-scheduled_for",)
