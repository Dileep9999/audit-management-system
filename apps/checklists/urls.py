from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    ChecklistTemplateViewSet, ChecklistViewSet, ChecklistFieldViewSet,
    ChecklistAttachmentDownloadView
)

app_name = 'checklists'

# Create router and register viewsets
router = DefaultRouter()
router.register(r'templates', ChecklistTemplateViewSet, basename='template')
router.register(r'checklists', ChecklistViewSet, basename='checklist')
router.register(r'fields', ChecklistFieldViewSet, basename='field')
router.register(r'attachments', ChecklistAttachmentDownloadView, basename='attachment')

# URL patterns
urlpatterns = [
    # API routes from router
    path('api/', include(router.urls)),
    
    # Additional custom endpoints
    path('api/templates/<int:pk>/freeze/', 
         ChecklistTemplateViewSet.as_view({'post': 'freeze'}), 
         name='template-freeze'),
    
    path('api/templates/<int:pk>/unfreeze/', 
         ChecklistTemplateViewSet.as_view({'post': 'unfreeze'}), 
         name='template-unfreeze'),
    
    path('api/templates/<int:pk>/duplicate/', 
         ChecklistTemplateViewSet.as_view({'post': 'duplicate'}), 
         name='template-duplicate'),
    
    path('api/templates/<int:pk>/usage-stats/', 
         ChecklistTemplateViewSet.as_view({'get': 'usage_stats'}), 
         name='template-usage-stats'),
    
    path('api/templates/<int:pk>/add-fields/', 
         ChecklistTemplateViewSet.as_view({'post': 'add_fields'}), 
         name='template-add-fields'),
    
    path('api/templates/field-types/', 
         ChecklistTemplateViewSet.as_view({'get': 'field_types'}), 
         name='template-field-types'),
    
    path('api/templates/categories/', 
         ChecklistTemplateViewSet.as_view({'get': 'categories'}), 
         name='template-categories'),
    
    path('api/templates/popular/', 
         ChecklistTemplateViewSet.as_view({'get': 'popular'}), 
         name='template-popular'),
    
    # Checklist specific endpoints
    path('api/checklists/<int:pk>/responses/', 
         ChecklistViewSet.as_view({'get': 'responses', 'post': 'responses'}), 
         name='checklist-responses'),
    
    path('api/checklists/<int:pk>/submit-response/', 
         ChecklistViewSet.as_view({'post': 'submit_response'}), 
         name='checklist-submit-response'),
    
    path('api/checklists/<int:pk>/update-responses/', 
         ChecklistViewSet.as_view({'post': 'update_responses'}), 
         name='checklist-update-responses'),
    
    path('api/checklists/<int:pk>/change-status/', 
         ChecklistViewSet.as_view({'post': 'change_status'}), 
         name='checklist-change-status'),
    
    path('api/checklists/<int:pk>/progress/', 
         ChecklistViewSet.as_view({'get': 'progress'}), 
         name='checklist-progress'),
    
    path('api/checklists/<int:pk>/comments/', 
         ChecklistViewSet.as_view({'get': 'comments', 'post': 'comments'}), 
         name='checklist-comments'),
    
    path('api/checklists/<int:pk>/attachments/', 
         ChecklistViewSet.as_view({'get': 'attachments', 'post': 'attachments'}), 
         name='checklist-attachments'),
    
    path('api/checklists/<int:pk>/duplicate/', 
         ChecklistViewSet.as_view({'post': 'duplicate'}), 
         name='checklist-duplicate'),
    
    path('api/checklists/<int:pk>/export/', 
         ChecklistViewSet.as_view({'get': 'export'}), 
         name='checklist-export'),
    
    path('api/checklists/my-checklists/', 
         ChecklistViewSet.as_view({'get': 'my_checklists'}), 
         name='my-checklists'),
    
    path('api/checklists/dashboard-stats/', 
         ChecklistViewSet.as_view({'get': 'dashboard_stats'}), 
         name='dashboard-stats'),
    
    # Field management endpoints
    path('api/fields/reorder/', 
         ChecklistFieldViewSet.as_view({'post': 'reorder'}), 
         name='field-reorder'),
    
    path('api/fields/<int:pk>/duplicate/', 
         ChecklistFieldViewSet.as_view({'post': 'duplicate'}), 
         name='field-duplicate'),
    
    # File download endpoint
    path('api/attachments/<int:pk>/download/', 
         ChecklistAttachmentDownloadView.as_view({'get': 'retrieve'}), 
         name='attachment-download'),
] 