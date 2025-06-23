from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AuditViewSet, CustomAuditTypeViewSet

router = DefaultRouter()
router.register('audits', AuditViewSet, basename='audit')
router.register('audit-types', CustomAuditTypeViewSet, basename='audit-type')

urlpatterns = [
    path('', include(router.urls)),
] 