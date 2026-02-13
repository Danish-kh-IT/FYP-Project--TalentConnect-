from django.contrib import admin
from .models import Industry, CompanySize, Company


@admin.register(Industry)
class IndustryAdmin(admin.ModelAdmin):
    list_display = ['name']
    search_fields = ['name']


@admin.register(CompanySize)
class CompanySizeAdmin(admin.ModelAdmin):
    list_display = ['size_range', 'description']
    search_fields = ['size_range']

@admin.register(Company)
class CompanyAdmin(admin.ModelAdmin):
    list_display = ['name', 'industry', 'size', 'user', 'is_verified', 'created_at']
    list_filter = ['industry', 'size', 'is_verified', 'created_at']
    search_fields = ['name', 'industry', 'user__username']
    readonly_fields = ['created_at', 'updated_at']