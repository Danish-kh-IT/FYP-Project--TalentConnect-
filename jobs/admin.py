from django.contrib import admin
from .models import (
    Category, Location, JobType, Job, 
    SavedJob
)


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'icon']
    search_fields = ['name']
    prepopulated_fields = {'name': ('name',)}


@admin.register(Location)
class LocationAdmin(admin.ModelAdmin):
    list_display = ['city', 'state', 'country']
    list_filter = ['country', 'state']
    search_fields = ['city', 'state', 'country']
    ordering = ['country', 'state', 'city']


@admin.register(JobType)
class JobTypeAdmin(admin.ModelAdmin):
    list_display = ['name']


@admin.register(Job)
class JobAdmin(admin.ModelAdmin):
    list_display = [
        'title', 'company', 'category', 'location', 
        'job_type', 'is_featured', 'status', 'created_at'
    ]
    list_filter = [
        'is_featured', 'status', 'job_type', 'category', 
        'location__country', 'created_at'
    ]
    search_fields = ['title', 'company__name', 'description']
    readonly_fields = ['created_at', 'updated_at', 'posted_at']
    date_hierarchy = 'created_at'
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('title', 'description', 'company', 'category', 'location')
        }),
        ('Job Details', {
            'fields': ('job_type', 'requirements', 'responsibilities', 'benefits')
        }),
        ('Compensation', {
            'fields': ('salary_min', 'salary_max', 'currency')
        }),
        ('Requirements', {
            'fields': ('experience_level', 'education_level', 'is_remote')
        }),
        ('Status & Features', {
            'fields': ('status', 'is_active', 'is_featured', 'application_deadline')
        }),
        ('Application', {
            'fields': ('application_email', 'application_url')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at', 'posted_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(SavedJob)
class SavedJobAdmin(admin.ModelAdmin):
    list_display = ['user', 'job', 'saved_at']
    list_filter = ['saved_at', 'job__company']
    search_fields = ['user__username', 'job__title']
    readonly_fields = ['saved_at']