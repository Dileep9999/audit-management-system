from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    AuditViewSet, CustomAuditTypeViewSet, AuditTaskViewSet,
    TeamViewSet, TeamListCreateView, TeamDetailView,
    TeamMemberListCreateView, TeamMemberDetailView
)

router = DefaultRouter()
router.register('audits', AuditViewSet, basename='audit')
router.register('audit-types', CustomAuditTypeViewSet, basename='audit-type')
router.register('audit-tasks', AuditTaskViewSet, basename='audit-task')
router.register('teams', TeamViewSet, basename='team')

urlpatterns = [
    path('', include(router.urls)),
    
    # Additional team endpoints (alternative to ViewSet if needed)
    path('teams-list/', TeamListCreateView.as_view(), name='team-list-create'),
    path('teams-detail/<int:pk>/', TeamDetailView.as_view(), name='team-detail'),
    
    # Team member management endpoints
    path('teams/<int:team_pk>/members/', TeamMemberListCreateView.as_view(), name='team-member-list-create'),
    path('teams/<int:team_pk>/members/<int:pk>/', TeamMemberDetailView.as_view(), name='team-member-detail'),
] 