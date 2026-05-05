from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.contrib.auth.models import User
from .models import UserProfile, UserSkill, UserEducation, UserExperience


class UserProfileInline(admin.StackedInline):
    model = UserProfile
    can_delete = False
    verbose_name_plural = 'Profile'


class UserAdmin(BaseUserAdmin):
    inlines = (UserProfileInline,)


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'user_type', 'phone', 'is_verified', 'created_at']
    list_filter = ['user_type', 'is_verified', 'created_at']
    search_fields = ['user__username', 'user__email', 'phone']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(UserSkill)
class UserSkillAdmin(admin.ModelAdmin):
    list_display = ['name']
    search_fields = ['name']


@admin.register(UserEducation)
class UserEducationAdmin(admin.ModelAdmin):
    list_display = ['user', 'degree', 'institution', 'field_of_study', 'start_date']
    list_filter = ['start_date', 'is_current']
    search_fields = ['user__username', 'institution', 'degree', 'field_of_study']


@admin.register(UserExperience)
class UserExperienceAdmin(admin.ModelAdmin):
    list_display = ['user', 'position', 'company', 'start_date', 'is_current']
    list_filter = ['start_date', 'is_current']
    search_fields = ['user__username', 'company', 'position']


# Re-register UserAdmin
admin.site.unregister(User)
admin.site.register(User, UserAdmin)