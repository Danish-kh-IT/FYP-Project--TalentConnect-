from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly
from django.db.models import Q

try:
    from django_filters.rest_framework import DjangoFilterBackend
    HAS_DJANGO_FILTERS = True
except ImportError:
    HAS_DJANGO_FILTERS = False

from .models import Job, Category, Location, JobType, Company, JobApplication, SavedJob
from .serializers import (
    JobSerializer, CategorySerializer, LocationSerializer,
    JobTypeSerializer, CompanySerializer, JobApplicationSerializer,
    SavedJobSerializer
)
from users.models import UserProfile


class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'description']
    ordering_fields = ['name']


class LocationViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Location.objects.all()
    serializer_class = LocationSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['country', 'state', 'city']
    ordering_fields = ['country', 'state', 'city']


class JobTypeViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = JobType.objects.all()
    serializer_class = JobTypeSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ['name']


class CompanyViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Company.objects.all()
    serializer_class = CompanySerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'description', 'industry']
    ordering_fields = ['name', 'created_at']


class JobViewSet(viewsets.ModelViewSet):
    queryset = Job.objects.filter(is_active=True).select_related(
        'company', 'category', 'location', 'job_type'
    )
    serializer_class = JobSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    if HAS_DJANGO_FILTERS:
        filter_backends.insert(0, DjangoFilterBackend)
        filterset_fields = ['category', 'location', 'job_type', 'is_featured', 'is_remote']
    search_fields = ['title', 'description', 'company__name']
    ordering_fields = ['created_at', 'updated_at', 'salary_min', 'salary_max']
    ordering = ['-created_at']
    
    def get_queryset(self):
        queryset = super().get_queryset()
        search = self.request.query_params.get('search', None)
        location = self.request.query_params.get('location', None)
        category = self.request.query_params.get('category', None)
        
        if search:
            queryset = queryset.filter(
                Q(title__icontains=search) |
                Q(description__icontains=search) |
                Q(company__name__icontains=search)
            )
        
        if location:
            queryset = queryset.filter(location__city__icontains=location)
        
        if category:
            queryset = queryset.filter(category__name__icontains=category)
        
        return queryset
    
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def apply(self, request, pk=None):
        """Apply for a job"""
        job = self.get_object()
        user = request.user
        
        # Check if user is a candidate
        try:
            if user.profile.user_type != 'candidate':
                return Response(
                    {'error': 'Only candidates can apply for jobs'},
                    status=status.HTTP_403_FORBIDDEN
                )
        except UserProfile.DoesNotExist:
            return Response(
                {'error': 'User profile not found'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check if already applied
        if JobApplication.objects.filter(job=job, applicant=user).exists():
            return Response(
                {'error': 'You have already applied for this job'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        serializer = JobApplicationSerializer(data={
            'job_id': job.id,
            'resume': request.data.get('resume'),
            'cover_letter': request.data.get('cover_letter', ''),
        })
        
        if serializer.is_valid():
            serializer.save(applicant=user)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['post', 'delete'], permission_classes=[IsAuthenticated])
    def save(self, request, pk=None):
        """Save or unsave a job"""
        job = self.get_object()
        user = request.user
        
        if request.method == 'POST':
            saved_job, created = SavedJob.objects.get_or_create(job=job, user=user)
            if created:
                serializer = SavedJobSerializer(saved_job)
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            return Response({'message': 'Job already saved'}, status=status.HTTP_200_OK)
        
        elif request.method == 'DELETE':
            SavedJob.objects.filter(job=job, user=user).delete()
            return Response({'message': 'Job unsaved'}, status=status.HTTP_200_OK)


class JobApplicationViewSet(viewsets.ModelViewSet):
    serializer_class = JobApplicationSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        # Candidates see their own applications
        # Employers see applications for their jobs
        try:
            if user.profile.user_type == 'candidate':
                return JobApplication.objects.filter(applicant=user)
            elif user.profile.user_type == 'employer':
                return JobApplication.objects.filter(job__company__user=user)
        except UserProfile.DoesNotExist:
            return JobApplication.objects.none()
        return JobApplication.objects.none()
    
    def perform_create(self, serializer):
        serializer.save(applicant=self.request.user)


class SavedJobViewSet(viewsets.ModelViewSet):
    serializer_class = SavedJobSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return SavedJob.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

