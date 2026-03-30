from django.shortcuts import render, get_object_or_404, redirect
from rest_framework import viewsets, permissions, filters, status
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from .models import Job, Category, Location, JobType, SavedJob
from .serializers import (
    JobSerializer, CategorySerializer, LocationSerializer, 
    JobTypeSerializer, SavedJobSerializer
)

class JobViewSet(viewsets.ModelViewSet):
    queryset = Job.objects.all()
    serializer_class = JobSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category', 'job_type', 'is_remote', 'status', 'experience_level', 'salary_min', 'salary_max']
    search_fields = ['title', 'description', 'company__name']
    ordering_fields = ['created_at', 'salary_min']

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        # Increment views_count
        instance.views_count += 1
        instance.save(update_fields=['views_count'])
        serializer = self.get_serializer(instance)
        return Response(serializer.data)

    def perform_create(self, serializer):
        try:
            company = self.request.user.company_profile
            # Temporarily allowing posting without verification for development
            # if not company.is_verified:
            #     from rest_framework.exceptions import PermissionDenied
            #     raise PermissionDenied("Your company profile is pending admin verification.")
            serializer.save(company=company)
        except AttributeError:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied("You must complete your company registration before posting a job.")
        except Exception as e:
            from rest_framework.exceptions import APIException
            raise APIException(str(e))

class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer

class LocationViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Location.objects.all()
    serializer_class = LocationSerializer

class JobTypeViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = JobType.objects.all()
    serializer_class = JobTypeSerializer

class SavedJobViewSet(viewsets.ModelViewSet):
    queryset = SavedJob.objects.all()
    serializer_class = SavedJobSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return self.queryset.filter(user=self.request.user)
        
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
# --- Template-based Views Removed ---
