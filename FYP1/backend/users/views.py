from django.shortcuts import render, get_object_or_404, redirect
from django.contrib.auth import login, authenticate
from django.contrib.auth.decorators import login_required
from django.contrib.auth.views import LoginView
from rest_framework import viewsets, permissions, status, generics
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAdminUser, IsAuthenticated
from django.contrib.auth.models import User
from .models import UserProfile, UserSkill, UserEducation, UserExperience
from .serializers import (
    UserSerializer, UserProfileSerializer, RegistrationSerializer,
    UserSkillSerializer, UserEducationSerializer, UserExperienceSerializer
)

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (permissions.AllowAny,)
    serializer_class = RegistrationSerializer

class CandidateProfileViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = UserProfile.objects.filter(user_type='candidate')
    serializer_class = UserProfileSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

class UserProfileViewSet(viewsets.ModelViewSet):
    queryset = UserProfile.objects.all()
    serializer_class = UserProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Users can only see/edit their own profile in this viewset
        return self.queryset.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class UserSkillViewSet(viewsets.ModelViewSet):
    queryset = UserSkill.objects.all()
    serializer_class = UserSkillSerializer
    permission_classes = [permissions.IsAuthenticated]

class UserEducationViewSet(viewsets.ModelViewSet):
    queryset = UserEducation.objects.all()
    serializer_class = UserEducationSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return self.queryset.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class UserExperienceViewSet(viewsets.ModelViewSet):
    queryset = UserExperience.objects.all()
    serializer_class = UserExperienceSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return self.queryset.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
# --- Template-based Views Removed ---

from rest_framework.permissions import BasePermission

class IsAppAdmin(BasePermission):
    """Custom permission: allow access if user's UserProfile has user_type='admin'."""
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        try:
            profile = UserProfile.objects.get(user=request.user)
            return profile.user_type == 'admin'
        except UserProfile.DoesNotExist:
            return request.user.is_staff or request.user.is_superuser

class AdminUserProfileView(APIView):
    """Allow admin users to view any user's profile by user ID."""
    permission_classes = [IsAuthenticated, IsAppAdmin]

    def get(self, request, user_id):
        user = get_object_or_404(User, pk=user_id)
        try:
            profile = UserProfile.objects.get(user=user)
            serializer = UserProfileSerializer(profile)
            return Response(serializer.data)
        except UserProfile.DoesNotExist:
            # Return basic user info in a compatible format
            return Response({
                'id': None,
                'user': {
                    'id': user.id,
                    'username': user.username,
                    'email': user.email,
                    'first_name': user.first_name,
                    'last_name': user.last_name,
                },
                'user_type': 'admin',
                'bio': None,
                'location': None,
                'phone': None,
                'linkedin_url': None,
                'github_url': None,
                'portfolio_url': None,
                'skills_list': [],
                'profile_picture': None,
                'headline': None,
                'resume': None,
            })





