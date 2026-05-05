from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
from .views import (
    RegisterView, UserProfileViewSet, UserEducationViewSet, UserExperienceViewSet,
    CandidateProfileViewSet, AdminUserProfileView
)

router = DefaultRouter()
router.register(r'profile', UserProfileViewSet, basename='user-profile')
router.register(r'candidates', CandidateProfileViewSet, basename='candidate-list')
router.register(r'education', UserEducationViewSet, basename='user-education')
router.register(r'experience', UserExperienceViewSet, basename='user-experience')

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('admin-profile/<int:user_id>/', AdminUserProfileView.as_view(), name='admin-user-profile'),
    path('', include(router.urls)),
]
