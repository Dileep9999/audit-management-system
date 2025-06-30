from django.shortcuts import render
from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils.translation import gettext_lazy as _
from django.db.models import Q, Count
from django.shortcuts import get_object_or_404
from .models import Audit, AuditType, CustomAuditType, AuditTask, AuditEvidence, Team, TeamMember
from .serializers import (
    AuditSerializer, CustomAuditTypeSerializer, AuditTaskCreateSerializer,
    AuditTaskDetailSerializer, AuditTaskListSerializer, AuditEvidenceSerializer,
    TeamListSerializer, TeamCreateUpdateSerializer, TeamDetailSerializer,
    TeamMemberCreateUpdateSerializer, TeamMemberSerializer
)
from apps.checklists.models import ChecklistTemplate
from apps.checklists.serializers import ChecklistTemplateListSerializer
from workflows.models import Workflow
import logging
from django.utils import timezone
from rest_framework.exceptions import PermissionDenied
from rest_framework.generics import ListCreateAPIView, RetrieveUpdateDestroyAPIView

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
    
    def update(self, request, *args, **kwargs):
        """Handle both full and partial updates"""
        # Force partial update for all PUT requests to handle assignment updates
        kwargs['partial'] = True
        return super().update(request, *args, **kwargs)
    
    def partial_update(self, request, *args, **kwargs):
        """Handle PATCH requests with partial updates"""
        kwargs['partial'] = True
        return super().partial_update(request, *args, **kwargs)

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

    @action(detail=True, methods=['post'])
    def submit_for_review(self, request, pk=None):
        """
        Submit task for review
        """
        task = self.get_object()
        
        # Check if task is eligible for review
        if task.checklist.status != 'completed':
            return Response(
                {'detail': 'Task must be completed before submitting for review'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Update checklist status to under_review if that status exists
        try:
            from apps.checklists.models import Checklist
            task.checklist.status = 'under_review'
            task.checklist.save()
            
            # Log the review submission
            logger.info(f"Task {task.id} submitted for review by user {request.user.id}")
            
            return Response({
                'detail': 'Task submitted for review successfully',
                'status': task.checklist.status
            })
        except Exception as e:
            logger.error(f"Error submitting task for review: {e}")
            return Response(
                {'detail': 'Failed to submit task for review'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        """
        Approve a task
        """
        task = self.get_object()
        notes = request.data.get('notes', '')
        
        # Update checklist status to approved
        task.checklist.status = 'approved'
        task.checklist.save()
        
        # Update task completion
        if not task.completed_at:
            task.completed_at = timezone.now()
        task.completion_notes += f"\n\nApproved by {request.user.get_full_name() or request.user.username}: {notes}"
        task.save()
        
        logger.info(f"Task {task.id} approved by user {request.user.id}")
        
        return Response({
            'detail': 'Task approved successfully',
            'status': task.checklist.status,
            'approved_by': request.user.get_full_name() or request.user.username,
            'approval_notes': notes
        })

    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        """
        Reject a task with reason
        """
        task = self.get_object()
        reason = request.data.get('reason', '')
        
        if not reason:
            return Response(
                {'detail': 'Rejection reason is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Update checklist status back to in_progress
        task.checklist.status = 'in_progress'
        task.checklist.save()
        
        # Add rejection notes
        task.completion_notes += f"\n\nRejected by {request.user.get_full_name() or request.user.username}: {reason}"
        task.completed_at = None  # Clear completion timestamp
        task.save()
        
        logger.info(f"Task {task.id} rejected by user {request.user.id}")
        
        return Response({
            'detail': 'Task rejected successfully',
            'status': task.checklist.status,
            'rejected_by': request.user.get_full_name() or request.user.username,
            'rejection_reason': reason
        })

    @action(detail=True, methods=['get'])
    def reviews(self, request, pk=None):
        """
        Get review history for a task
        """
        task = self.get_object()
        
        # Parse completion notes to extract review history
        review_history = []
        if task.completion_notes:
            lines = task.completion_notes.split('\n')
            for line in lines:
                if 'Approved by' in line or 'Rejected by' in line:
                    review_history.append({
                        'action': 'approved' if 'Approved by' in line else 'rejected',
                        'details': line.strip(),
                        'timestamp': task.updated_at.isoformat() if task.updated_at else None
                    })
        
        return Response({
            'task_id': task.id,
            'current_status': task.checklist.status,
            'review_history': review_history,
            'completion_notes': task.completion_notes
        })

    @action(detail=True, methods=['post'])
    def findings(self, request, pk=None):
        """
        Create findings for a task
        """
        task = self.get_object()
        
        # Create audit finding linked to this task
        finding_data = request.data.copy()
        finding_data['audit'] = task.audit.id
        finding_data['task'] = task.id
        
        # Use the audit findings creation logic
        from .serializers import AuditFindingSerializer
        serializer = AuditFindingSerializer(
            data=finding_data,
            context={'request': request}
        )
        
        if serializer.is_valid():
            finding = serializer.save()
            return Response(
                AuditFindingSerializer(finding).data,
                status=status.HTTP_201_CREATED
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['get'])
    def reports(self, request, pk=None):
        """
        Generate task completion report
        """
        task = self.get_object()
        
        # Gather task completion data
        report_data = {
            'task_info': {
                'id': task.id,
                'name': task.task_name,
                'description': task.description,
                'priority': task.priority,
                'risk_level': task.risk_level,
                'control_area': task.control_area,
                'assigned_to': task.assigned_to.get_full_name() if task.assigned_to else None,
                'due_date': task.due_date.isoformat() if task.due_date else None,
                'completed_at': task.completed_at.isoformat() if task.completed_at else None,
                'status': task.get_task_status()
            },
            'checklist_info': {
                'template_name': task.checklist.template.name,
                'total_fields': task.checklist.get_total_fields(),
                'completed_fields': task.checklist.get_completed_fields(),
                'completion_percentage': task.checklist.get_progress_percentage(),
                'status': task.checklist.status
            },
            'evidence_summary': {
                'total_files': task.evidence.count(),
                'verified_files': task.evidence.filter(is_verified=True).count(),
                'evidence_types': list(task.evidence.values_list('evidence_type', flat=True).distinct())
            },
            'completion_notes': task.completion_notes,
            'generated_at': timezone.now().isoformat(),
            'generated_by': request.user.get_full_name() or request.user.username
        }
        
        return Response(report_data)

# Team Views
class TeamListCreateView(ListCreateAPIView):
    """
    List all teams or create a new team
    """
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = ['type', 'is_active', 'owner']
    search_fields = ['name', 'description', 'owner__first_name', 'owner__last_name']
    ordering_fields = ['name', 'created_at', 'type']
    ordering = ['name']
    
    def get_queryset(self):
        """Filter teams based on user permissions"""
        user = self.request.user
        
        # Superusers can see all teams
        if user.is_superuser:
            return Team.objects.all()
        
        # Users can see teams they own or are members of
        return Team.objects.filter(
            Q(owner=user) | 
            Q(team_memberships__user=user, team_memberships__is_active=True)
        ).distinct()
    
    def get_serializer_class(self):
        """Use different serializers for list and create"""
        if self.request.method == 'GET':
            return TeamListSerializer
        return TeamCreateUpdateSerializer


class TeamDetailView(RetrieveUpdateDestroyAPIView):
    """
    Retrieve, update or delete a team
    """
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = 'pk'
    
    def get_queryset(self):
        """Filter teams based on user permissions"""
        user = self.request.user
        
        # Superusers can access all teams
        if user.is_superuser:
            return Team.objects.all()
        
        # Users can access teams they own or are members of
        return Team.objects.filter(
            Q(owner=user) | 
            Q(team_memberships__user=user, team_memberships__is_active=True)
        ).distinct()
    
    def get_serializer_class(self):
        """Use different serializers for different actions"""
        if self.request.method in ['PUT', 'PATCH']:
            return TeamCreateUpdateSerializer
        return TeamDetailSerializer
    
    def perform_destroy(self, instance):
        """Soft delete the team"""
        instance.delete(user=self.request.user)


class TeamMemberListCreateView(ListCreateAPIView):
    """
    List team members or add a new member to a team
    """
    serializer_class = TeamMemberCreateUpdateSerializer
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = ['role', 'is_active']
    search_fields = ['user__first_name', 'user__last_name', 'user__email']
    
    def get_queryset(self):
        """Get team members for a specific team"""
        team_id = self.kwargs.get('team_pk')
        team = get_object_or_404(Team, pk=team_id)
        
        # Check if user can view this team
        user = self.request.user
        if not (user.is_superuser or team.owner == user or team.is_member(user)):
            return TeamMember.objects.none()
        
        return TeamMember.objects.filter(team=team)
    
    def perform_create(self, serializer):
        """Create team member with validation"""
        team_id = self.kwargs.get('team_pk')
        team = get_object_or_404(Team, pk=team_id)
        
        # Check if user can manage this team
        user = self.request.user
        if not (user.is_superuser or team.can_manage(user)):
            raise PermissionDenied("You don't have permission to add members to this team.")
        
        serializer.save(team=team)


class TeamMemberDetailView(RetrieveUpdateDestroyAPIView):
    """
    Retrieve, update or delete a team member
    """
    serializer_class = TeamMemberCreateUpdateSerializer
    permission_classes = [permissions.IsAuthenticated]
    lookup_field = 'pk'
    
    def get_queryset(self):
        """Get team member for a specific team"""
        team_id = self.kwargs.get('team_pk')
        team = get_object_or_404(Team, pk=team_id)
        
        # Check if user can view this team
        user = self.request.user
        if not (user.is_superuser or team.owner == user or team.is_member(user)):
            return TeamMember.objects.none()
        
        return TeamMember.objects.filter(team=team)
    
    def perform_update(self, serializer):
        """Update team member with validation"""
        team_id = self.kwargs.get('team_pk')
        team = get_object_or_404(Team, pk=team_id)
        
        # Check if user can manage this team
        user = self.request.user
        if not (user.is_superuser or team.can_manage(user)):
            raise PermissionDenied("You don't have permission to modify members of this team.")
        
        serializer.save()
    
    def perform_destroy(self, instance):
        """Remove team member with validation"""
        team = instance.team
        user = self.request.user
        
        # Check if user can manage this team
        if not (user.is_superuser or team.can_manage(user)):
            raise PermissionDenied("You don't have permission to remove members from this team.")
        
        instance.delete()


class TeamViewSet(viewsets.ModelViewSet):
    """
    ViewSet for team management with additional actions
    """
    permission_classes = [permissions.IsAuthenticated]
    filterset_fields = ['type', 'is_active', 'owner']
    search_fields = ['name', 'description']
    ordering_fields = ['name', 'created_at', 'type']
    ordering = ['name']
    
    def get_queryset(self):
        """Filter teams based on user permissions"""
        user = self.request.user
        
        # Superusers can see all teams
        if user.is_superuser:
            return Team.objects.all()
        
        # Users can see teams they own or are members of
        return Team.objects.filter(
            Q(owner=user) | 
            Q(team_memberships__user=user, team_memberships__is_active=True)
        ).distinct()
    
    def get_serializer_class(self):
        """Use different serializers for different actions"""
        if self.action == 'list':
            return TeamListSerializer
        elif self.action in ['create', 'update', 'partial_update']:
            return TeamCreateUpdateSerializer
        return TeamDetailSerializer
    
    @action(detail=True, methods=['post'])
    def add_member(self, request, pk=None):
        """Add a member to the team"""
        team = self.get_object()
        
        # Check permissions
        if not (request.user.is_superuser or team.can_manage(request.user)):
            return Response(
                {'error': 'You do not have permission to add members to this team.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        serializer = TeamMemberCreateUpdateSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            serializer.save(team=team)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['delete'])
    def remove_member(self, request, pk=None):
        """Remove a member from the team"""
        team = self.get_object()
        user_id = request.data.get('user_id')
        
        if not user_id:
            return Response(
                {'error': 'user_id is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check permissions
        if not (request.user.is_superuser or team.can_manage(request.user)):
            return Response(
                {'error': 'You do not have permission to remove members from this team.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        try:
            team_member = TeamMember.objects.get(team=team, user_id=user_id)
            team_member.delete()
            return Response({'message': 'Member removed successfully'}, status=status.HTTP_200_OK)
        except TeamMember.DoesNotExist:
            return Response(
                {'error': 'User is not a member of this team'}, 
                status=status.HTTP_404_NOT_FOUND
            )
    
    @action(detail=True, methods=['get'])
    def members(self, request, pk=None):
        """Get all members of the team"""
        team = self.get_object()
        members = TeamMember.objects.filter(team=team, is_active=True)
        serializer = TeamMemberSerializer(members, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def assign_to_audit(self, request, pk=None):
        """Assign team to an audit"""
        team = self.get_object()
        audit_id = request.data.get('audit_id')
        
        if not audit_id:
            return Response(
                {'error': 'audit_id is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check permissions
        if not (request.user.is_superuser or team.can_manage(request.user)):
            return Response(
                {'error': 'You do not have permission to assign this team to audits.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        try:
            audit = Audit.objects.get(id=audit_id)
            team.audits.add(audit)
            return Response({'message': 'Team assigned to audit successfully'}, status=status.HTTP_200_OK)
        except Audit.DoesNotExist:
            return Response(
                {'error': 'Audit not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )
    
    @action(detail=True, methods=['delete'])
    def unassign_from_audit(self, request, pk=None):
        """Unassign team from an audit"""
        team = self.get_object()
        audit_id = request.data.get('audit_id')
        
        if not audit_id:
            return Response(
                {'error': 'audit_id is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Check permissions
        if not (request.user.is_superuser or team.can_manage(request.user)):
            return Response(
                {'error': 'You do not have permission to unassign this team from audits.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        try:
            audit = Audit.objects.get(id=audit_id)
            team.audits.remove(audit)
            return Response({'message': 'Team unassigned from audit successfully'}, status=status.HTTP_200_OK)
        except Audit.DoesNotExist:
            return Response(
                {'error': 'Audit not found'}, 
                status=status.HTTP_404_NOT_FOUND
            )
    
    @action(detail=False, methods=['get'])
    def my_teams(self, request):
        """Get teams where the current user is owner or member"""
        user = request.user
        teams = Team.objects.filter(
            Q(owner=user) | 
            Q(team_memberships__user=user, team_memberships__is_active=True)
        ).distinct()
        
        serializer = TeamListSerializer(teams, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def statistics(self, request):
        """Get team statistics"""
        user = request.user
        
        # Get teams the user can see
        teams = self.get_queryset()
        
        stats = {
            'total_teams': teams.count(),
            'teams_by_type': {},
            'owned_teams': teams.filter(owner=user).count(),
            'member_teams': teams.filter(team_memberships__user=user, team_memberships__is_active=True).count(),
            'active_teams': teams.filter(is_active=True).count(),
        }
        
        # Teams by type
        type_counts = teams.values('type').annotate(count=Count('type'))
        for item in type_counts:
            team_type = dict(Team.TEAM_TYPE_CHOICES).get(item['type'], item['type'])
            stats['teams_by_type'][team_type] = item['count']
        
        return Response(stats)
