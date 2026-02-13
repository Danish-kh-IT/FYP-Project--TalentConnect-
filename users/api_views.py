from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.contrib.auth.models import User

from .models import UserProfile, UserEducation, UserExperience
from .serializers import (
    UserProfileSerializer, UserProfileCreateSerializer,
    UserEducationSerializer, UserExperienceSerializer
)


class UserProfileViewSet(viewsets.ModelViewSet):
    queryset = UserProfile.objects.select_related('user').prefetch_related(
        'educations', 'experiences'
    )
    permission_classes = [IsAuthenticated]
    
    def get_serializer_class(self):
        if self.action == 'create':
            return UserProfileCreateSerializer
        return UserProfileSerializer
    
    def get_queryset(self):
        user = self.request.user
        # Users can see their own profile and public profiles
        if self.action == 'list':
            return UserProfile.objects.filter(user__is_active=True)
        return UserProfile.objects.all()
    
    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def me(self, request):
        """Get current user's profile"""
        try:
            profile = request.user.profile
            serializer = self.get_serializer(profile)
            return Response(serializer.data)
        except UserProfile.DoesNotExist:
            return Response(
                {'error': 'Profile not found'},
                status=status.HTTP_404_NOT_FOUND
            )
    
    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def candidates(self, request):
        """Get all candidate profiles"""
        candidates = UserProfile.objects.filter(
            user_type='candidate',
            user__is_active=True
        )
        serializer = self.get_serializer(candidates, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def employers(self, request):
        """Get all employer profiles"""
        employers = UserProfile.objects.filter(
            user_type='employer',
            user__is_active=True
        )
        serializer = self.get_serializer(employers, many=True)
        return Response(serializer.data)


class UserEducationViewSet(viewsets.ModelViewSet):
    serializer_class = UserEducationSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return UserEducation.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class UserExperienceViewSet(viewsets.ModelViewSet):
    serializer_class = UserExperienceSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return UserExperience.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

