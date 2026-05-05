from django.contrib import admin
from .models import Application

@admin.register(Application)
class ApplicationAdmin(admin.ModelAdmin):
    list_display = ['applicant', 'job', 'status', 'applied_at']
    list_filter = ['status', 'applied_at', 'job__company']
    search_fields = ['applicant__username', 'job__title', 'job__company__name']
    readonly_fields = ['applied_at', 'updated_at']
    date_hierarchy = 'applied_at'
