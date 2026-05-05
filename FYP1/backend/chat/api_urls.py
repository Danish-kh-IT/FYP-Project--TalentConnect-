from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ChatThreadViewSet, MessageViewSet

router = DefaultRouter()
router.register(r'threads', ChatThreadViewSet)
router.register(r'messages', MessageViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
