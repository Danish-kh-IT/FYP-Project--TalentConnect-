"""
URL configuration for nokri_clone project.
"""
from django.contrib import admin
from django.urls import include, path
from django.conf import settings
from django.conf.urls.static import static

from django.http import JsonResponse

def api_root(request):
    return JsonResponse({
        "message": "Welcome to TalentConnect API",
        "documentation": "/api/...",
        "status": "online"
    })

urlpatterns = [
    path('', api_root),
    path('api/users/', include('users.api_urls')),
    path('api/companies/', include('companies.api_urls')),
    path('api/jobs/', include('jobs.api_urls')),
    path('api/applications/', include('applications.api_urls')),
    path('api/chat/', include('chat.api_urls')),
    path('api/interviews/', include('interviews.api_urls')),
    path('api/admin-panel/', include('admin_api.urls')),

    path('admin/', admin.site.urls),
]

# Serve media files during development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
