from rest_framework import viewsets, permissions, views, response, status
from django.contrib.auth.models import User
from users.models import UserProfile
from companies.models import Company
from jobs.models import Job
from applications.models import Application
from .serializers import AdminUserSerializer, AdminCompanySerializer, AdminJobSerializer

class IsAdminUser(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and hasattr(request.user, 'profile') and request.user.profile.user_type == 'admin'

class AdminStatsView(views.APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        stats = {
            'total_users': User.objects.exclude(profile__user_type='admin').count(),
            'total_companies': Company.objects.count(),
            'total_jobs': Job.objects.count(),
            'total_applications': Application.objects.count(),
            'pending_jobs': Job.objects.filter(status='pending').count(),
            'pending_companies': Company.objects.filter(is_verified=False).count(),
            'inactive_users': User.objects.filter(is_active=False).count(),
        }
        return response.Response(stats)

class AdminUserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.exclude(profile__user_type='admin').order_by('-date_joined')
    serializer_class = AdminUserSerializer
    permission_classes = [IsAdminUser]

class AdminCompanyViewSet(viewsets.ModelViewSet):
    queryset = Company.objects.all().order_by('-created_at')
    serializer_class = AdminCompanySerializer
    permission_classes = [IsAdminUser]

    def perform_update(self, serializer):
        serializer.save()

class AdminJobViewSet(viewsets.ModelViewSet):
    queryset = Job.objects.all().order_by('-created_at')
    serializer_class = AdminJobSerializer
    permission_classes = [IsAdminUser]
