from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CompanyViewSet, IndustryViewSet, CompanySizeViewSet

router = DefaultRouter()
router.register(r'', CompanyViewSet, basename='company')
router.register(r'industries', IndustryViewSet, basename='industry')
router.register(r'sizes', CompanySizeViewSet, basename='company-size')

urlpatterns = [
    path('', include(router.urls)),
]
