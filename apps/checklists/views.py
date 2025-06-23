from django.shortcuts import render
from rest_framework import viewsets, permissions, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.utils.translation import gettext_lazy as _
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q
from django.utils import timezone

from .models import (
    ChecklistTemplate, ChecklistField, Checklist, ChecklistResponse,
    ChecklistComment, ChecklistAttachment, FieldType
)
from .serializers import (
    ChecklistTemplateCreateSerializer, ChecklistTemplateDetailSerializer,
    ChecklistFieldSerializer, ChecklistCreateSerializer, ChecklistDetailSerializer,
    UserSimpleSerializer
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
        return ChecklistTemplateDetailSerializer
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Filter by user's own templates or public ones
        if not self.request.user.is_staff:
            queryset = queryset.filter(
                Q(created_by=self.request.user) | Q(is_active=True)
            )
        
        return queryset
    
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
            'recent_usage': checklists.order_by('-created_at')[:5].values(
                'id', 'name', 'status', 'created_at', 'created_by__username'
            )
        }
        
        return Response(stats)
    
    @action(detail=False, methods=['get'])
    def field_types(self, request):
        """Get available field types"""
        field_types = [
            {'value': choice[0], 'label': choice[1]}
            for choice in FieldType.choices
        ]
        return Response(field_types)


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
        return ChecklistDetailSerializer
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Filter by user's own checklists or assigned to them
        if not self.request.user.is_staff:
            queryset = queryset.filter(
                Q(created_by=self.request.user) | Q(assigned_to=self.request.user)
            )
        
        return queryset
    
    @action(detail=True, methods=['get', 'post'])
    def responses(self, request, pk=None):
        """Get or update checklist responses"""
        checklist = self.get_object()
        
        if request.method == 'GET':
            responses = checklist.responses.all().order_by('field__order')
            data = []
            for response in responses:
                data.append({
                    'id': response.id,
                    'field': ChecklistFieldSerializer(response.field).data,
                    'value': response.value,
                    'is_completed': response.is_completed,
                    'comments': response.comments,
                    'responded_at': response.responded_at
                })
            return Response(data)
        
        elif request.method == 'POST':
            # Update multiple responses
            responses_data = request.data.get('responses', [])
            updated_responses = []
            
            for response_data in responses_data:
                response_id = response_data.get('id')
                value = response_data.get('value', {})
                
                # Ensure value is a dict
                if not isinstance(value, dict):
                    value = {}
                
                if response_id:
                    try:
                        response = checklist.responses.get(id=response_id)
                        response.value = value
                        response.is_completed = response_data.get('is_completed', response.is_completed)
                        response.comments = response_data.get('comments', response.comments)
                        response.responded_by = request.user
                        response.save()
                        updated_responses.append(response)
                    except ChecklistResponse.DoesNotExist:
                        continue
            
            # Update checklist progress
            checklist.update_progress()
            
            return Response({
                'message': _('Responses updated successfully'),
                'updated_count': len(updated_responses),
                'completion_percentage': checklist.get_progress_percentage()
            })
    
    @action(detail=True, methods=['post'])
    def submit_response(self, request, pk=None):
        """Submit a single field response"""
        checklist = self.get_object()
        field_id = request.data.get('field_id')
        value = request.data.get('value', {})
        is_completed = request.data.get('is_completed', False)
        comments = request.data.get('comments', '')
        
        # Ensure value is a dict
        if not isinstance(value, dict):
            value = {}
        
        if not field_id:
            return Response(
                {'error': _('Field ID is required')},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            field = ChecklistField.objects.get(id=field_id, template=checklist.template)
            response, created = ChecklistResponse.objects.get_or_create(
                checklist=checklist,
                field=field,
                defaults={
                    'value': value,
                    'is_completed': is_completed,
                    'comments': comments,
                    'responded_by': request.user
                }
            )
            
            if not created:
                response.value = value
                response.is_completed = is_completed
                response.comments = comments
                response.responded_by = request.user
                response.save()
            
            # Update checklist progress
            checklist.update_progress()
            
            return Response({
                'message': _('Response submitted successfully'),
                'response_id': response.id,
                'completion_percentage': checklist.get_progress_percentage(),
                'response': {
                    'id': response.id,
                    'value': response.value,
                    'is_completed': response.is_completed,
                    'comments': response.comments
                }
            })
            
        except ChecklistField.DoesNotExist:
            return Response(
                {'error': _('Field not found in this checklist template')},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    @action(detail=True, methods=['post'])
    def change_status(self, request, pk=None):
        """Change checklist status"""
        checklist = self.get_object()
        new_status = request.data.get('status')
        
        if new_status not in [choice[0] for choice in Checklist.STATUS_CHOICES]:
            return Response(
                {'error': _('Invalid status')},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Validate status change
        if new_status == 'completed':
            # Check if all required fields are completed
            required_fields = checklist.template.fields.filter(is_required=True)
            completed_required_fields = checklist.responses.filter(
                field__is_required=True,
                is_completed=True
            )
            
            if required_fields.count() > completed_required_fields.count():
                incomplete_count = required_fields.count() - completed_required_fields.count()
                return Response(
                    {'error': _('Cannot mark as completed: {} required field(s) are not completed').format(incomplete_count)},
                    status=status.HTTP_400_BAD_REQUEST
                )
        
        checklist.status = new_status
        checklist.save()
        
        return Response({
            'message': _('Status updated successfully'),
            'checklist': ChecklistDetailSerializer(checklist, context={'request': request}).data
        })
    
    @action(detail=True, methods=['get'])
    def progress(self, request, pk=None):
        """Get detailed progress information"""
        checklist = self.get_object()
        
        progress_data = {
            'total_fields': checklist.total_fields,
            'completed_fields': checklist.completed_fields,
            'completion_percentage': checklist.get_progress_percentage(),
            'status': checklist.status,
            'field_breakdown': []
        }
        
        for response in checklist.responses.all().order_by('field__order'):
            progress_data['field_breakdown'].append({
                'field_label': response.field.label,
                'field_type': response.field.field_type,
                'is_completed': response.is_completed,
                'is_required': response.field.is_required,
                'responded_at': response.responded_at
            })
        
        return Response(progress_data)
    
    @action(detail=False, methods=['get'])
    def my_checklists(self, request):
        """Get checklists assigned to current user"""
        checklists = self.get_queryset().filter(assigned_to=request.user)
        
        # Apply filters
        status_filter = request.query_params.get('status')
        if status_filter:
            checklists = checklists.filter(status=status_filter)
        
        serializer = ChecklistDetailSerializer(checklists, many=True, context={'request': request})
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def dashboard_stats(self, request):
        """Get dashboard statistics for current user"""
        user_checklists = self.get_queryset().filter(
            Q(assigned_to=request.user) | Q(created_by=request.user)
        )
        
        stats = {
            'total_checklists': user_checklists.count(),
            'completed': user_checklists.filter(status='completed').count(),
            'in_progress': user_checklists.filter(status='in_progress').count(),
            'overdue': user_checklists.filter(
                due_date__lt=timezone.now(),
                status__in=['draft', 'in_progress']
            ).count(),
            'recent_activity': user_checklists.order_by('-updated_at')[:5].values(
                'id', 'name', 'status', 'completion_percentage', 'updated_at'
            )
        }
        
        return Response(stats)


class ChecklistFieldViewSet(viewsets.ModelViewSet):
    """ViewSet for checklist fields (for template editing)"""
    queryset = ChecklistField.objects.filter(is_deleted=False)
    serializer_class = ChecklistFieldSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        queryset = super().get_queryset()
        template_id = self.request.query_params.get('template')
        
        if template_id:
            queryset = queryset.filter(template_id=template_id)
        
        return queryset.order_by('order')
    
    def perform_create(self, serializer):
        template_id = self.request.data.get('template_id')
        if template_id:
            template = get_object_or_404(ChecklistTemplate, id=template_id)
            
            # Check if user can edit template
            if template.is_frozen:
                raise serializers.ValidationError(_('Cannot add fields to frozen template'))
            
            if template.created_by != self.request.user and not self.request.user.is_staff:
                raise serializers.ValidationError(_('You do not have permission to edit this template'))
            
            serializer.save(template=template)
    
    @action(detail=False, methods=['post'])
    def reorder(self, request):
        """Reorder fields in a template"""
        field_orders = request.data.get('field_orders', [])
        
        for item in field_orders:
            field_id = item.get('id')
            order = item.get('order')
            
            try:
                field = ChecklistField.objects.get(id=field_id)
                
                # Check permissions
                if field.template.is_frozen:
                    return Response(
                        {'error': _('Cannot reorder fields in frozen template')},
                        status=status.HTTP_400_BAD_REQUEST
                    )
                
                if field.template.created_by != request.user and not request.user.is_staff:
                    return Response(
                        {'error': _('You do not have permission to edit this template')},
                        status=status.HTTP_403_FORBIDDEN
                    )
                
                field.order = order
                field.save(update_fields=['order'])
                
            except ChecklistField.DoesNotExist:
                continue
        
        return Response({'message': _('Fields reordered successfully')})
