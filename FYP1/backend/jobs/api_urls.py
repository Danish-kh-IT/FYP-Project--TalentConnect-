from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    JobViewSet, CategoryViewSet, LocationViewSet, 
    JobTypeViewSet, SavedJobViewSet
)

router = DefaultRouter()
router.register(r'listings', JobViewSet)
router.register(r'categories', CategoryViewSet)
router.register(r'locations', LocationViewSet)
router.register(r'job-types', JobTypeViewSet)
router.register(r'saved', SavedJobViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
