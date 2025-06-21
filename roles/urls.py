from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PermissionViewSet, RoleViewSet, UserRoleViewSet, TestAPIView

router = DefaultRouter()
router.register(r'permissions', PermissionViewSet)
router.register(r'roles', RoleViewSet)
router.register(r'user-roles', UserRoleViewSet)

urlpatterns = [
    path('test/', TestAPIView.as_view(), name='test-api'),
    path('', include(router.urls)),
] 