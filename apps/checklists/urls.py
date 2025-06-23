from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ChecklistTemplateViewSet, ChecklistViewSet, ChecklistFieldViewSet

router = DefaultRouter()
router.register(r'templates', ChecklistTemplateViewSet, basename='checklist-template')
router.register(r'checklists', ChecklistViewSet, basename='checklist')
router.register(r'fields', ChecklistFieldViewSet, basename='checklist-field')

urlpatterns = [
    path('', include(router.urls)),
] 