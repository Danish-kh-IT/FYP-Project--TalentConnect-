from django.contrib import admin
from .models import ChatThread, Message


@admin.register(ChatThread)
class ChatThreadAdmin(admin.ModelAdmin):
    list_display = ("id", "participant_usernames", "created_at", "updated_at")
    search_fields = ("participants__username",)
    filter_horizontal = ("participants",)

    @staticmethod
    def participant_usernames(obj: ChatThread) -> str:
        return ", ".join(obj.participants.values_list("username", flat=True))


@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ("id", "thread", "sender", "receiver", "short_content", "created_at", "is_read")
    list_filter = ("is_read", "created_at")
    search_fields = ("sender__username", "receiver__username", "content")
    autocomplete_fields = ("thread", "sender", "receiver")

    @staticmethod
    def short_content(obj: Message) -> str:
        return obj.content[:50]
