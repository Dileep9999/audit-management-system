from django.shortcuts import render
from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils.translation import gettext_lazy as _
from django.db.models import Q
from django.shortcuts import get_object_or_404
from .models import Audit, AuditType, CustomAuditType, AuditTask, AuditEvidence
from .serializers import (
    AuditSerializer, CustomAuditTypeSerializer, AuditTaskCreateSerializer,
    AuditTaskDetailSerializer, AuditTaskListSerializer, AuditEvidenceSerializer
)
from apps.checklists.models import ChecklistTemplate
from apps.checklists.serializers import ChecklistTemplateListSerializer
from workflows.models import Workflow
import logging
from django.utils import timezone

logger = logging.getLogger(__name__)

# Create your views here.

class CustomAuditTypeViewSet(viewsets.ModelViewSet):
    queryset = CustomAuditType.objects.all()
    serializer_class = CustomAuditTypeSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """
        Filter queryset to show only active types by default,
        unless explicitly requested all types
        """
        queryset = super().get_queryset()
        show_all = self.request.query_params.get('show_all', 'false').lower() == 'true'
        if not show_all:
            queryset = queryset.filter(is_active=True)
        return queryset

    def destroy(self, request, *args, **kwargs):
        """
        Soft delete by setting is_active to False instead of actual deletion
        """
        instance = self.get_object()
        if instance.audits.exists():
            return Response(
                {'detail': _('Cannot delete audit type that is being used by audits.')},
                status=status.HTTP_400_BAD_REQUEST
            )
        instance.is_active = False
        instance.save()
        return Response(status=status.HTTP_204_NO_CONTENT)

class AuditViewSet(viewsets.ModelViewSet):
    queryset = Audit.objects.all()
    serializer_class = AuditSerializer
    permission_classes = [permissions.IsAuthenticated]

    def create(self, request, *args, **kwargs):
        """
        Override create method to add debugging
        """
        logger.info(f"Creating audit with user: {request.user}")
        logger.info(f"User authenticated: {request.user.is_authenticated}")
        logger.info(f"Request data: {request.data}")
        
        try:
            return super().create(request, *args, **kwargs)
        except Exception as e:
            logger.error(f"Error creating audit: {e}")
            return Response(
                {'detail': f'Error creating audit: {str(e)}'},
                status=status.HTTP_400_BAD_REQUEST
            )

    def get_queryset(self):
        """
        Filter audits based on query parameters
        """
        queryset = super().get_queryset()
        
        # Filter by audit type
        audit_type = self.request.query_params.get('audit_type', None)
        if audit_type:
            queryset = queryset.filter(
                Q(audit_type=audit_type) | 
                Q(custom_audit_type__name__iexact=audit_type)
            )

        # Filter by status
        status_filter = self.request.query_params.get('status', None)
        if status_filter:
            queryset = queryset.filter(status=status_filter)

        # Filter by date range
        from_date = self.request.query_params.get('from_date', None)
        to_date = self.request.query_params.get('to_date', None)
        if from_date and to_date:
            queryset = queryset.filter(
                period_from__gte=from_date,
                period_to__lte=to_date
            )

        return queryset

    def list(self, request, *args, **kwargs):
        """
        Override list method to ensure we always return a list
        """
        queryset = self.filter_queryset(self.get_queryset())
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def audit_types(self, request):
        """
        Return all available audit types (both system and custom)
        """
        system_types = [{'id': t[0], 'name': t[1], 'is_system': True} for t in AuditType.choices]
        custom_types = CustomAuditType.objects.filter(is_active=True).values('id', 'name')
        custom_types = [{'id': t['id'], 'name': t['name'], 'is_system': False} for t in custom_types]
        
        return Response(system_types + custom_types)

    @action(detail=False, methods=['get'])
    def audit_statuses(self, request):
        """
        Return all available audit statuses from active workflows
        """
        statuses = set()
        
        # Get all unique statuses from existing audits
        existing_statuses = Audit.objects.values_list('status', flat=True).distinct()
        statuses.update(existing_statuses)
        
        # Get all possible statuses from active workflows
        active_workflows = Workflow.objects.filter(status='active')
        for workflow in active_workflows:
            if workflow.data and 'nodes' in workflow.data:
                for node in workflow.data['nodes']:
                    if 'data' in node and 'name' in node['data']:
                        statuses.add(node['data']['name'])
        
        # If no workflows exist, provide default statuses
        if not statuses:
            statuses = {'Draft', 'In Progress', 'Review', 'Completed'}
        
        # Convert to list of dictionaries for consistent API response
        status_list = [{'id': status, 'name': status} for status in sorted(statuses)]
        return Response(status_list)

    @action(detail=True, methods=['get'])
    def available_transitions(self, request, pk=None):
        """
        Get available status transitions for a specific audit
        """
        audit = self.get_object()
        transitions = audit.get_available_transitions()
        return Response(transitions)

    @action(detail=True, methods=['post'])
    def transition_status(self, request, pk=None):
        """
        Transition audit status to a new state
        """
        audit = self.get_object()
        new_status = request.data.get('status')
        
        if not new_status:
            return Response(
                {'detail': 'Status is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        available_transitions = audit.get_available_transitions()
        if new_status not in available_transitions:
            return Response(
                {'detail': f'Invalid transition. Available transitions: {available_transitions}'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        audit.status = new_status
        audit.save()
        
        serializer = self.get_serializer(audit)
        return Response(serializer.data)

    # ======================== AUDIT TASK MANAGEMENT ========================

    @action(detail=True, methods=['get', 'post'])
    def tasks(self, request, pk=None):
        """
        Get audit tasks or create a new task
        """
        audit = self.get_object()
        
        if request.method == 'GET':
            tasks = audit.audit_tasks.all()
            serializer = AuditTaskListSerializer(tasks, many=True)
            return Response(serializer.data)
        
        elif request.method == 'POST':
            serializer = AuditTaskCreateSerializer(
                data=request.data, 
                context={'audit': audit, 'request': request}
            )
            if serializer.is_valid():
                task = serializer.save()
                response_serializer = AuditTaskDetailSerializer(task)
                return Response(response_serializer.data, status=status.HTTP_201_CREATED)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['get'])
    def task_templates(self, request, pk=None):
        """
        Get available checklist templates for creating audit tasks
        """
        audit = self.get_object()
        
        # Get templates relevant to audits
        templates = ChecklistTemplate.objects.filter(
            is_active=True,
            is_deleted=False
        ).filter(
            Q(category__icontains='audit') |
            Q(category__icontains='compliance') |
            Q(category__icontains='inspection') |
            Q(category__icontains='review') |
            Q(is_active=True)  # Show all active templates as fallback
        )
        
        serializer = ChecklistTemplateListSerializer(templates, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def task_summary(self, request, pk=None):
        """
        Get task summary and progress for audit
        """
        audit = self.get_object()
        progress = audit.get_task_progress()
        
        # Get task breakdown by status
        tasks = audit.audit_tasks.select_related('checklist').all()
        task_breakdown = {
            'by_status': {},
            'by_priority': {},
            'by_risk_level': {},
            'overdue_count': 0,
            'recent_activity': []
        }
        
        # Count by status
        for task in tasks:
            task_status = task.get_task_status()
            task_breakdown['by_status'][task_status] = task_breakdown['by_status'].get(task_status, 0) + 1
            
            # Count by priority
            priority = task.priority
            task_breakdown['by_priority'][priority] = task_breakdown['by_priority'].get(priority, 0) + 1
            
            # Count by risk level
            risk = task.risk_level
            task_breakdown['by_risk_level'][risk] = task_breakdown['by_risk_level'].get(risk, 0) + 1
            
            # Check if overdue
            if task.due_date and task.due_date < timezone.now() and task_status not in ['completed']:
                task_breakdown['overdue_count'] += 1
        
        # Get recent activity (last 5 updated tasks)
        recent_tasks = tasks.order_by('-updated_at')[:5]
        task_breakdown['recent_activity'] = AuditTaskListSerializer(recent_tasks, many=True).data
        
        return Response({
            'progress': progress,
            'breakdown': task_breakdown,
            'total_tasks': len(tasks)
        })

    @action(detail=True, methods=['post'])
    def bulk_create_tasks(self, request, pk=None):
        """
        Create multiple tasks from predefined templates
        """
        audit = self.get_object()
        template_configs = request.data.get('templates', [])
        
        if not template_configs:
            return Response(
                {'detail': 'No template configurations provided'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        created_tasks = []
        errors = []
        
        for config in template_configs:
            try:
                serializer = AuditTaskCreateSerializer(
                    data=config,
                    context={'audit': audit, 'request': request}
                )
                if serializer.is_valid():
                    task = serializer.save()
                    created_tasks.append(AuditTaskDetailSerializer(task).data)
                else:
                    errors.append({
                        'template_id': config.get('template_id'),
                        'errors': serializer.errors
                    })
            except Exception as e:
                errors.append({
                    'template_id': config.get('template_id'),
                    'errors': str(e)
                })
        
        return Response({
            'created_tasks': created_tasks,
            'errors': errors,
            'summary': {
                'total_requested': len(template_configs),
                'created': len(created_tasks),
                'failed': len(errors)
            }
        }, status=status.HTTP_201_CREATED if created_tasks else status.HTTP_400_BAD_REQUEST)


class AuditTaskViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing individual audit tasks
    """
    queryset = AuditTask.objects.all()
    permission_classes = [permissions.IsAuthenticated]
    
    def get_serializer_class(self):
        if self.action in ['list']:
            return AuditTaskListSerializer
        return AuditTaskDetailSerializer
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Filter by audit if provided
        audit_id = self.request.query_params.get('audit')
        if audit_id:
            queryset = queryset.filter(audit_id=audit_id)
        
        # Filter by assigned user
        assigned_to = self.request.query_params.get('assigned_to')
        if assigned_to:
            queryset = queryset.filter(assigned_to_id=assigned_to)
        
        # Filter by status
        task_status = self.request.query_params.get('status')
        if task_status:
            queryset = queryset.filter(checklist__status=task_status)
        
        # Filter by priority
        priority = self.request.query_params.get('priority')
        if priority:
            queryset = queryset.filter(priority=priority)
        
        return queryset.select_related('audit', 'checklist', 'assigned_to', 'created_by')

    @action(detail=True, methods=['get', 'post'])
    def evidence(self, request, pk=None):
        """
        Get or add evidence for a task
        """
        task = self.get_object()
        
        if request.method == 'GET':
            evidence = task.evidence.all()
            serializer = AuditEvidenceSerializer(evidence, many=True)
            return Response(serializer.data)
        
        elif request.method == 'POST':
            serializer = AuditEvidenceSerializer(
                data=request.data,
                context={'audit_task': task, 'request': request}
            )
            if serializer.is_valid():
                evidence = serializer.save()
                return Response(
                    AuditEvidenceSerializer(evidence).data,
                    status=status.HTTP_201_CREATED
                )
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'])
    def verify_evidence(self, request, pk=None):
        """
        Verify evidence for a task
        """
        task = self.get_object()
        evidence_id = request.data.get('evidence_id')
        
        if not evidence_id:
            return Response(
                {'detail': 'Evidence ID is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            evidence = task.evidence.get(id=evidence_id)
            evidence.is_verified = True
            evidence.verified_by = request.user
            evidence.verified_at = timezone.now()
            evidence.save()
            
            serializer = AuditEvidenceSerializer(evidence)
            return Response(serializer.data)
            
        except AuditEvidence.DoesNotExist:
            return Response(
                {'detail': 'Evidence not found'},
                status=status.HTTP_404_NOT_FOUND
            )

    @action(detail=True, methods=['post'])
    def update_completion(self, request, pk=None):
        """
        Update task completion notes
        """
        task = self.get_object()
        completion_notes = request.data.get('completion_notes', '')
        
        task.completion_notes = completion_notes
        task.save()
        
        serializer = self.get_serializer(task)
        return Response(serializer.data)
