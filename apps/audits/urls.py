from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AuditViewSet, CustomAuditTypeViewSet, AuditTaskViewSet

router = DefaultRouter()
router.register('audits', AuditViewSet, basename='audit')
router.register('audit-types', CustomAuditTypeViewSet, basename='audit-type')
router.register('audit-tasks', AuditTaskViewSet, basename='audit-task')

urlpatterns = [
    path('', include(router.urls)),
] 