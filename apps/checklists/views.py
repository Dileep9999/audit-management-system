from django.shortcuts import render
from rest_framework import viewsets, permissions, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.utils.translation import gettext_lazy as _
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q, Count, Avg, F
from django.utils import timezone
from django.core.files.storage import default_storage
from django.http import HttpResponse, Http404
import mimetypes
import os

from .models import (
    ChecklistTemplate, ChecklistField, Checklist, ChecklistResponse,
    ChecklistComment, ChecklistAttachment, FieldType
)
from .serializers import (
    ChecklistTemplateCreateSerializer, ChecklistTemplateDetailSerializer,
    ChecklistTemplateListSerializer, ChecklistFieldSerializer, 
    ChecklistCreateSerializer, ChecklistDetailSerializer, ChecklistListSerializer,
    ChecklistUpdateSerializer, ChecklistResponseSerializer, ChecklistCommentSerializer,
    ChecklistAttachmentSerializer, UserSimpleSerializer, FieldTypeChoicesSerializer,
    ChecklistTemplateFieldsAddSerializer
)


class ChecklistTemplateViewSet(viewsets.ModelViewSet):
    """ViewSet for checklist templates"""
    queryset = ChecklistTemplate.objects.filter(is_deleted=False)
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category', 'is_active', 'is_frozen', 'created_by']
    search_fields = ['name', 'description', 'category']
    ordering_fields = ['name', 'created_at', 'updated_at', 'usage_count']
    ordering = ['-created_at']
    
    def get_serializer_class(self):
        if self.action in ['create', 'update', 'partial_update']:
            return ChecklistTemplateCreateSerializer
        elif self.action == 'list':
            return ChecklistTemplateListSerializer
        return ChecklistTemplateDetailSerializer
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Filter by user's own templates or public ones
        if not self.request.user.is_staff:
            queryset = queryset.filter(
                Q(created_by=self.request.user) | Q(is_active=True)
            )
        
        return queryset.select_related('created_by', 'frozen_by').prefetch_related('fields')
    
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)
    
    def perform_update(self, serializer):
        template = self.get_object()
        
        # Check if user can edit
        if template.is_frozen:
            return Response(
                {'error': _('Cannot update frozen template')},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if template.created_by != self.request.user and not self.request.user.is_staff:
            return Response(
                {'error': _('You do not have permission to edit this template')},
                status=status.HTTP_403_FORBIDDEN
            )
        
        serializer.save()
    
    @action(detail=True, methods=['post'])
    def freeze(self, request, pk=None):
        """Freeze a template to prevent modifications"""
        template = self.get_object()
        
        if template.is_frozen:
            return Response(
                {'error': _('Template is already frozen')},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if template.created_by != request.user and not request.user.is_staff:
            return Response(
                {'error': _('You do not have permission to freeze this template')},
                status=status.HTTP_403_FORBIDDEN
            )
        
        template.freeze(request.user)
        
        return Response({
            'message': _('Template frozen successfully'),
            'template': ChecklistTemplateDetailSerializer(template, context={'request': request}).data
        })
    
    @action(detail=True, methods=['post'])
    def unfreeze(self, request, pk=None):
        """Unfreeze a template to allow modifications"""
        template = self.get_object()
        
        if not template.is_frozen:
            return Response(
                {'error': _('Template is not frozen')},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if not request.user.is_staff:
            return Response(
                {'error': _('Only staff can unfreeze templates')},
                status=status.HTTP_403_FORBIDDEN
            )
        
        template.unfreeze()
        
        return Response({
            'message': _('Template unfrozen successfully'),
            'template': ChecklistTemplateDetailSerializer(template, context={'request': request}).data
        })
    
    @action(detail=True, methods=['post'])
    def duplicate(self, request, pk=None):
        """Create a copy of an existing template"""
        original_template = self.get_object()
        
        # Create new template
        new_template = ChecklistTemplate.objects.create(
            name=f"Copy of {original_template.name}",
            description=original_template.description,
            category=original_template.category,
            created_by=request.user
        )
        
        # Copy fields
        for field in original_template.fields.all():
            ChecklistField.objects.create(
                template=new_template,
                label=field.label,
                field_type=field.field_type,
                help_text=field.help_text,
                placeholder=field.placeholder,
                is_required=field.is_required,
                is_readonly=field.is_readonly,
                default_value=field.default_value,
                options=field.options,
                min_length=field.min_length,
                max_length=field.max_length,
                min_value=field.min_value,
                max_value=field.max_value,
                order=field.order,
                css_class=field.css_class,
                conditional_logic=field.conditional_logic
            )
        
        return Response({
            'message': _('Template duplicated successfully'),
            'template': ChecklistTemplateDetailSerializer(new_template, context={'request': request}).data
        }, status=status.HTTP_201_CREATED)
    
    @action(detail=True, methods=['get'])
    def usage_stats(self, request, pk=None):
        """Get usage statistics for a template"""
        template = self.get_object()
        
        checklists = template.checklists.filter(is_deleted=False)
        
        stats = {
            'total_usage': template.usage_count,
            'active_checklists': checklists.count(),
            'completed_checklists': checklists.filter(status='completed').count(),
            'in_progress_checklists': checklists.filter(status='in_progress').count(),
            'average_completion_time': None,
            'completion_rate': 0,
            'recent_usage': checklists.order_by('-created_at')[:5].values(
                'id', 'name', 'status', 'created_at', 'created_by__username'
            )
        }
        
        completed = checklists.filter(status='completed', completed_at__isnull=False)
        if completed.exists():
            # Calculate average completion time
            avg_time = completed.aggregate(
                avg_duration=Avg(F('completed_at') - F('created_at'))
            )['avg_duration']
            if avg_time:
                stats['average_completion_time'] = avg_time.total_seconds() / 3600  # hours
                
            # Calculate completion rate
            total_started = checklists.exclude(status='draft').count()
            if total_started > 0:
                stats['completion_rate'] = (completed.count() / total_started) * 100
        
        return Response(stats)
    
    @action(detail=True, methods=['post'])
    def add_fields(self, request, pk=None):
        """Add new fields to existing template"""
        template = self.get_object()
        
        if template.is_frozen:
            return Response(
                {'error': _('Cannot modify frozen template')},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        serializer = ChecklistTemplateFieldsAddSerializer(
            data=request.data,
            context={'template': template}
        )
        
        if serializer.is_valid():
            fields = serializer.save()
            return Response({
                'message': _('Fields added successfully'),
                'fields': ChecklistFieldSerializer(fields, many=True).data
            }, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['get'])
    def field_types(self, request):
        """Get available field types"""
        field_types = [
            {'value': choice[0], 'label': choice[1]}
            for choice in FieldType.choices
        ]
        return Response(field_types)
    
    @action(detail=False, methods=['get'])
    def categories(self, request):
        """Get all available categories"""
        categories = ChecklistTemplate.objects.filter(
            is_deleted=False
        ).values_list('category', flat=True).distinct().exclude(category='')
        
        return Response(list(categories))
    
    @action(detail=False, methods=['get'])
    def popular(self, request):
        """Get most popular templates"""
        templates = self.get_queryset().filter(
            is_active=True
        ).order_by('-usage_count')[:10]
        
        serializer = ChecklistTemplateListSerializer(
            templates, many=True, context={'request': request}
        )
        return Response(serializer.data)


class ChecklistViewSet(viewsets.ModelViewSet):
    """ViewSet for checklists"""
    queryset = Checklist.objects.filter(is_deleted=False)
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['status', 'priority', 'assigned_to', 'created_by', 'template']
    search_fields = ['name', 'description']
    ordering_fields = ['name', 'created_at', 'updated_at', 'due_date', 'completion_percentage']
    ordering = ['-created_at']
    
    def get_serializer_class(self):
        if self.action == 'create':
            return ChecklistCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return ChecklistUpdateSerializer
        elif self.action == 'list':
            return ChecklistListSerializer
        return ChecklistDetailSerializer
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Filter by user access
        if not self.request.user.is_staff:
            queryset = queryset.filter(
                Q(assigned_to=self.request.user) | 
                Q(created_by=self.request.user) |
                Q(template__created_by=self.request.user)
            )
        
        return queryset.select_related(
            'template', 'assigned_to', 'created_by'
        ).prefetch_related('responses', 'responses__field')
    
    def perform_create(self, serializer):
        checklist = serializer.save(created_by=self.request.user)
        # Increment template usage
        checklist.template.increment_usage()
    
    @action(detail=True, methods=['get', 'post'])
    def responses(self, request, pk=None):
        """Get or create responses for checklist"""
        checklist = self.get_object()
        
        if request.method == 'GET':
            responses = checklist.responses.all().select_related('field', 'responded_by')
            serializer = ChecklistResponseSerializer(responses, many=True)
            return Response(serializer.data)
        
        elif request.method == 'POST':
            # Create multiple responses
            responses_data = request.data.get('responses', [])
            created_responses = []
            
            for response_data in responses_data:
                response_data['checklist'] = checklist.id
                serializer = ChecklistResponseSerializer(
                    data=response_data,
                    context={'request': request, 'checklist': checklist}
                )
                
                if serializer.is_valid():
                    response = serializer.save(
                        checklist=checklist,
                        responded_by=request.user
                    )
                    created_responses.append(response)
                else:
                    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
            # Update checklist progress
            checklist.update_progress()
            
            return Response({
                'message': _('Responses saved successfully'),
                'responses': ChecklistResponseSerializer(created_responses, many=True).data,
                'checklist': ChecklistDetailSerializer(checklist, context={'request': request}).data
            }, status=status.HTTP_201_CREATED)
    
    @action(detail=True, methods=['post'])
    def submit_response(self, request, pk=None):
        """Submit a single response"""
        checklist = self.get_object()
        
        # Check if user can respond
        if checklist.assigned_to != request.user and checklist.created_by != request.user:
            if not request.user.is_staff:
                return Response(
                    {'error': _('You do not have permission to respond to this checklist')},
                    status=status.HTTP_403_FORBIDDEN
                )
        
        field_id = request.data.get('field_id')
        if not field_id:
            return Response(
                {'error': _('field_id is required')},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Get or create response
        response, created = ChecklistResponse.objects.get_or_create(
            checklist=checklist,
            field_id=field_id,
            defaults={
                'responded_by': request.user,
                'value': request.data.get('value', {}),
                'is_completed': request.data.get('is_completed', False),
                'comments': request.data.get('comments', ''),
                'internal_notes': request.data.get('internal_notes', '')
            }
        )
        
        if not created:
            # Update existing response
            response.value = request.data.get('value', response.value)
            response.is_completed = request.data.get('is_completed', response.is_completed)
            response.comments = request.data.get('comments', response.comments)
            response.internal_notes = request.data.get('internal_notes', response.internal_notes)
            response.responded_by = request.user
            if request.data.get('is_completed'):
                response.responded_at = timezone.now()
            response.save()
        
        # Update checklist progress
        checklist.update_progress()
        
        return Response({
            'message': _('Response submitted successfully'),
            'response': ChecklistResponseSerializer(response).data,
            'progress': checklist.get_progress_percentage()
        })
    
    @action(detail=True, methods=['post'])
    def update_responses(self, request, pk=None):
        """Update multiple responses at once"""
        checklist = self.get_object()
        responses_data = request.data.get('responses', [])
        
        updated_responses = []
        
        for response_data in responses_data:
            field_id = response_data.get('field_id')
            if not field_id:
                continue
                
            response, created = ChecklistResponse.objects.get_or_create(
                checklist=checklist,
                field_id=field_id,
                defaults={
                    'responded_by': request.user,
                    'value': response_data.get('value', {}),
                    'is_completed': response_data.get('is_completed', False),
                    'comments': response_data.get('comments', ''),
                    'internal_notes': response_data.get('internal_notes', '')
                }
            )
            
            if not created:
                response.value = response_data.get('value', response.value)
                response.is_completed = response_data.get('is_completed', response.is_completed)
                response.comments = response_data.get('comments', response.comments)
                response.internal_notes = response_data.get('internal_notes', response.internal_notes)
                response.responded_by = request.user
                if response_data.get('is_completed'):
                    response.responded_at = timezone.now()
                response.save()
            
            updated_responses.append(response)
        
        # Update checklist progress
        checklist.update_progress()
        
        return Response({
            'message': _('Responses updated successfully'),
            'responses': ChecklistResponseSerializer(updated_responses, many=True).data,
            'progress': checklist.get_progress_percentage()
        })
    
    @action(detail=True, methods=['post'])
    def change_status(self, request, pk=None):
        """Change checklist status"""
        checklist = self.get_object()
        new_status = request.data.get('status')
        
        if new_status not in dict(Checklist.STATUS_CHOICES):
            return Response(
                {'error': _('Invalid status')},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        old_status = checklist.status
        checklist.status = new_status
        
        # Set completed_at if status is completed
        if new_status == 'completed' and old_status != 'completed':
            checklist.completed_at = timezone.now()
        elif new_status != 'completed':
            checklist.completed_at = None
        
        checklist.save()
        
        return Response({
            'message': _('Status updated successfully'),
            'checklist': ChecklistDetailSerializer(checklist, context={'request': request}).data
        })
    
    @action(detail=True, methods=['get'])
    def progress(self, request, pk=None):
        """Get detailed progress information"""
        checklist = self.get_object()
        
        responses = checklist.responses.all()
        total_fields = checklist.template.fields.filter(field_type__ne='section').count()
        completed_responses = responses.filter(is_completed=True).count()
        
        # Field-by-field progress
        field_progress = []
        for field in checklist.template.fields.all():
            response = responses.filter(field=field).first()
            field_progress.append({
                'field_id': field.id,
                'field_label': field.label,
                'field_type': field.field_type,
                'is_required': field.is_required,
                'is_completed': response.is_completed if response else False,
                'has_response': bool(response),
                'responded_at': response.responded_at if response else None,
                'responded_by': UserSimpleSerializer(response.responded_by).data if response and response.responded_by else None
            })
        
        progress_data = {
            'total_fields': total_fields,
            'completed_fields': completed_responses,
            'completion_percentage': checklist.get_progress_percentage(),
            'status': checklist.status,
            'field_progress': field_progress,
            'last_activity': responses.order_by('-updated_at').first().updated_at if responses.exists() else None
        }
        
        return Response(progress_data)
    
    @action(detail=True, methods=['get', 'post'])
    def comments(self, request, pk=None):
        """Get or create comments for checklist"""
        checklist = self.get_object()
        
        if request.method == 'GET':
            comments = checklist.comments.filter(parent__isnull=True).order_by('-created_at')
            serializer = ChecklistCommentSerializer(comments, many=True)
            return Response(serializer.data)
        
        elif request.method == 'POST':
            serializer = ChecklistCommentSerializer(data=request.data)
            if serializer.is_valid():
                comment = serializer.save(
                    checklist=checklist,
                    author=request.user
                )
                return Response(
                    ChecklistCommentSerializer(comment).data,
                    status=status.HTTP_201_CREATED
                )
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['get', 'post'])
    def attachments(self, request, pk=None):
        """Get or upload attachments for checklist"""
        checklist = self.get_object()
        
        if request.method == 'GET':
            attachments = checklist.attachments.all().order_by('-created_at')
            serializer = ChecklistAttachmentSerializer(attachments, many=True)
            return Response(serializer.data)
        
        elif request.method == 'POST':
            serializer = ChecklistAttachmentSerializer(data=request.data)
            if serializer.is_valid():
                attachment = serializer.save(
                    checklist=checklist,
                    uploaded_by=request.user
                )
                return Response(
                    ChecklistAttachmentSerializer(attachment).data,
                    status=status.HTTP_201_CREATED
                )
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['post'])
    def duplicate(self, request, pk=None):
        """Create a copy of an existing checklist"""
        original_checklist = self.get_object()
        
        # Create new checklist
        new_checklist = Checklist.objects.create(
            template=original_checklist.template,
            name=f"Copy of {original_checklist.name}",
            description=original_checklist.description,
            assigned_to=request.user,
            created_by=request.user,
            priority=original_checklist.priority,
            tags=original_checklist.tags
        )
        
        return Response({
            'message': _('Checklist duplicated successfully'),
            'checklist': ChecklistDetailSerializer(new_checklist, context={'request': request}).data
        }, status=status.HTTP_201_CREATED)
    
    @action(detail=False, methods=['get'])
    def my_checklists(self, request):
        """Get current user's checklists"""
        checklists = self.get_queryset().filter(
            Q(assigned_to=request.user) | Q(created_by=request.user)
        ).distinct()
        
        serializer = ChecklistListSerializer(checklists, many=True, context={'request': request})
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def dashboard_stats(self, request):
        """Get dashboard statistics for current user"""
        user_checklists = self.get_queryset().filter(
            Q(assigned_to=request.user) | Q(created_by=request.user)
        ).distinct()
        
        stats = {
            'total_checklists': user_checklists.count(),
            'completed': user_checklists.filter(status='completed').count(),
            'in_progress': user_checklists.filter(status='in_progress').count(),
            'overdue': user_checklists.filter(
                due_date__lt=timezone.now(),
                status__in=['draft', 'in_progress']
            ).count(),
            'completion_rate': 0,
            'average_completion_time': None,
            'recent_activity': user_checklists.order_by('-updated_at')[:5].values(
                'id', 'name', 'status', 'completion_percentage', 'updated_at'
            )
        }
        
        if stats['total_checklists'] > 0:
            stats['completion_rate'] = (stats['completed'] / stats['total_checklists']) * 100
        
        # Calculate average completion time
        completed = user_checklists.filter(status='completed', completed_at__isnull=False)
        if completed.exists():
            avg_time = completed.aggregate(
                avg_duration=Avg(F('completed_at') - F('created_at'))
            )['avg_duration']
            if avg_time:
                stats['average_completion_time'] = avg_time.total_seconds() / 3600  # hours
        
        return Response(stats)
    
    @action(detail=True, methods=['get'])
    def export(self, request, pk=None):
        """Export checklist data"""
        checklist = self.get_object()
        
        # Create export data
        export_data = {
            'checklist': ChecklistDetailSerializer(checklist, context={'request': request}).data,
            'responses': ChecklistResponseSerializer(
                checklist.responses.all(),
                many=True
            ).data,
            'exported_at': timezone.now().isoformat(),
            'exported_by': UserSimpleSerializer(request.user).data
        }
        
        return Response(export_data)


class ChecklistFieldViewSet(viewsets.ModelViewSet):
    """ViewSet for checklist fields (for template editing)"""
    queryset = ChecklistField.objects.filter(is_deleted=False)
    serializer_class = ChecklistFieldSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['template', 'field_type', 'is_required']
    ordering_fields = ['order', 'created_at']
    ordering = ['order']
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Filter by template access
        if not self.request.user.is_staff:
            queryset = queryset.filter(template__created_by=self.request.user)
        
        return queryset.select_related('template')
    
    def perform_create(self, serializer):
        template = serializer.validated_data['template']
        
        # Check if template is frozen
        if template.is_frozen:
            return Response(
                {'error': _('Cannot add fields to frozen template')},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check permissions
        if template.created_by != self.request.user and not self.request.user.is_staff:
            return Response(
                {'error': _('You do not have permission to edit this template')},
                status=status.HTTP_403_FORBIDDEN
            )
        
        serializer.save()
    
    @action(detail=False, methods=['post'])
    def reorder(self, request):
        """Reorder fields within a template"""
        field_orders = request.data.get('field_orders', [])
        
        if not field_orders:
            return Response(
                {'error': _('field_orders is required')},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        updated_fields = []
        
        for item in field_orders:
            field_id = item.get('field_id')
            order = item.get('order')
            
            if field_id and order is not None:
                try:
                    field = ChecklistField.objects.get(
                        id=field_id,
                        template__created_by=request.user
                    )
                    field.order = order
                    field.save(update_fields=['order'])
                    updated_fields.append(field)
                except ChecklistField.DoesNotExist:
                    continue
        
        return Response({
            'message': _('Fields reordered successfully'),
            'fields': ChecklistFieldSerializer(updated_fields, many=True).data
        })
    
    @action(detail=True, methods=['post'])
    def duplicate(self, request, pk=None):
        """Duplicate a field within the same template"""
        original_field = self.get_object()
        
        # Create duplicate
        new_field = ChecklistField.objects.create(
            template=original_field.template,
            label=f"Copy of {original_field.label}",
            field_type=original_field.field_type,
            help_text=original_field.help_text,
            placeholder=original_field.placeholder,
            is_required=original_field.is_required,
            is_readonly=original_field.is_readonly,
            default_value=original_field.default_value,
            options=original_field.options,
            min_length=original_field.min_length,
            max_length=original_field.max_length,
            min_value=original_field.min_value,
            max_value=original_field.max_value,
            order=original_field.order + 1,
            css_class=original_field.css_class,
            conditional_logic=original_field.conditional_logic
        )
        
        return Response({
            'message': _('Field duplicated successfully'),
            'field': ChecklistFieldSerializer(new_field).data
        }, status=status.HTTP_201_CREATED)


class ChecklistAttachmentDownloadView(viewsets.GenericViewSet):
    """ViewSet for downloading checklist attachments"""
    queryset = ChecklistAttachment.objects.filter(is_deleted=False)
    permission_classes = [permissions.IsAuthenticated]
    
    def retrieve(self, request, pk=None):
        """Download attachment file"""
        attachment = get_object_or_404(self.queryset, pk=pk)
        
        # Check permissions
        checklist = attachment.checklist
        if not (checklist.assigned_to == request.user or 
                checklist.created_by == request.user or 
                request.user.is_staff):
            return Response(
                {'error': _('You do not have permission to download this file')},
                status=status.HTTP_403_FORBIDDEN
            )
        
        try:
            # Get file path
            file_path = attachment.file.path
            
            if not os.path.exists(file_path):
                raise Http404(_('File not found'))
            
            # Determine content type
            content_type, _ = mimetypes.guess_type(file_path)
            if not content_type:
                content_type = 'application/octet-stream'
            
            # Create response
            with open(file_path, 'rb') as file:
                response = HttpResponse(file.read(), content_type=content_type)
                response['Content-Disposition'] = f'attachment; filename="{attachment.original_name}"'
                return response
                
        except Exception as e:
            return Response(
                {'error': _('Error downloading file')},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
