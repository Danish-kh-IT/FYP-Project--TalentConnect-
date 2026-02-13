from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AdminStatsView, AdminUserViewSet, AdminCompanyViewSet, AdminJobViewSet

router = DefaultRouter()
router.register(r'users', AdminUserViewSet)
router.register(r'companies', AdminCompanyViewSet)
router.register(r'jobs', AdminJobViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('stats/', AdminStatsView.as_view(), name='admin-stats'),
]
