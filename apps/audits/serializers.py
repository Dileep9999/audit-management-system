from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Audit, AuditType, CustomAuditType, AuditTask, AuditEvidence, AuditFinding, Team, TeamMember
from apps.checklists.models import ChecklistTemplate, Checklist
from apps.checklists.serializers import ChecklistDetailSerializer, ChecklistTemplateDetailSerializer
from django.utils import timezone

User = get_user_model()

class CustomAuditTypeSerializer(serializers.ModelSerializer):
    created_by_name = serializers.SerializerMethodField()

    class Meta:
        model = CustomAuditType
        fields = [
            'id', 'name', 'description', 'is_active',
            'created_by', 'created_by_name', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_by', 'created_at', 'updated_at']

    def get_created_by_name(self, obj):
        if not obj.created_by:
            return ''
        full_name = obj.created_by.get_full_name()
        return full_name.strip() if full_name.strip() else obj.created_by.username

    def validate_name(self, value):
        """
        Check that the audit type name is unique (case-insensitive)
        """
        if CustomAuditType.objects.filter(name__iexact=value).exists():
            raise serializers.ValidationError('An audit type with this name already exists.')
        return value

    def create(self, validated_data):
        validated_data['created_by'] = self.context['request'].user
        return super().create(validated_data)


class AuditTaskCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating audit tasks"""
    template_id = serializers.IntegerField(write_only=True)
    checklist_name = serializers.CharField(write_only=True, required=False)
    
    class Meta:
        model = AuditTask
        fields = [
            'id', 'task_name', 'description', 'assigned_to', 'due_date',
            'priority', 'control_area', 'risk_level', 'template_id', 'checklist_name'
        ]
        
    def validate_template_id(self, value):
        """Validate that template exists and is active"""
        try:
            template = ChecklistTemplate.objects.get(id=value, is_active=True, is_deleted=False)
            return value
        except ChecklistTemplate.DoesNotExist:
            raise serializers.ValidationError('Template not found or inactive')
    
    def create(self, validated_data):
        template_id = validated_data.pop('template_id')
        checklist_name = validated_data.pop('checklist_name', validated_data.get('task_name', 'Audit Task'))
        audit = self.context['audit']
        request = self.context['request']
        
        # Get the template
        template = ChecklistTemplate.objects.get(id=template_id)
        
        # Create checklist from template
        checklist = Checklist.objects.create(
            template=template,
            name=checklist_name,
            description=f"Audit task for {audit.title}",
            assigned_to=validated_data.get('assigned_to', request.user),
            created_by=request.user,
            due_date=validated_data.get('due_date'),
            priority=validated_data.get('priority', 'medium'),
            tags=[audit.reference_number, 'audit', 'task']
        )
        
        # Create initial responses for all template fields
        for field in template.fields.all():
            from apps.checklists.models import ChecklistResponse
            ChecklistResponse.objects.create(
                checklist=checklist,
                field=field,
                value={}
            )
        
        # Update checklist progress
        checklist.update_progress()
        
        # Increment template usage
        template.increment_usage()
        
        # Create audit task
        validated_data['audit'] = audit
        validated_data['checklist'] = checklist
        validated_data['created_by'] = request.user
        
        return super().create(validated_data)


class AuditTaskDetailSerializer(serializers.ModelSerializer):
    """Detailed serializer for audit tasks"""
    checklist = ChecklistDetailSerializer(read_only=True)
    assigned_to_name = serializers.SerializerMethodField()
    assigned_users_details = serializers.SerializerMethodField()
    created_by_name = serializers.SerializerMethodField()
    task_status = serializers.SerializerMethodField()
    completion_percentage = serializers.SerializerMethodField()
    evidence_count = serializers.SerializerMethodField()
    
    class Meta:
        model = AuditTask
        fields = [
            'id', 'audit_id', 'task_name', 'description', 'assigned_to', 'assigned_to_name',
            'assigned_users', 'assigned_users_details', 'due_date', 'priority', 'control_area', 'risk_level',
            'created_by', 'created_by_name', 'created_at', 'updated_at',
            'completed_at', 'completion_notes', 'checklist',
            'task_status', 'completion_percentage', 'evidence_count'
        ]
        read_only_fields = [
            'id', 'created_by', 'created_at', 'updated_at', 'completed_at'
        ]
        extra_kwargs = {
            'task_name': {'required': False},
            'description': {'required': False},
            'priority': {'required': False},
            'control_area': {'required': False},
            'risk_level': {'required': False},
        }
    
    def validate_assigned_to(self, value):
        """Validate assigned_to user"""
        if value is not None:
            try:
                # If value is a User object, get its ID
                user_id = value.id if hasattr(value, 'id') else value
                
                # Check if user exists and is active
                user = User.objects.get(id=user_id)
                if not user.is_active:
                    raise serializers.ValidationError('Assigned user is not active')
                
                # Return the user object for ForeignKey field
                return user
            except User.DoesNotExist:
                raise serializers.ValidationError('Assigned user not found')
            except (AttributeError, ValueError, TypeError):
                # Handle invalid user ID
                raise serializers.ValidationError('Invalid user ID provided')
        return value
    
    def get_assigned_to_name(self, obj):
        if obj.assigned_to:
            return obj.assigned_to.get_full_name() or obj.assigned_to.username
        return None
    
    def get_assigned_users_details(self, obj):
        """Get detailed information about all assigned users"""
        if hasattr(obj, 'assigned_users'):
            return [
                {
                    'id': user.id,
                    'username': user.username,
                    'email': user.email,
                    'first_name': user.first_name,
                    'last_name': user.last_name,
                    'full_name': user.get_full_name() or user.username,
                    'is_active': user.is_active
                }
                for user in obj.assigned_users.all()
            ]
        return []
    
    def get_created_by_name(self, obj):
        if obj.created_by:
            return obj.created_by.get_full_name() or obj.created_by.username
        return None
    
    def get_task_status(self, obj):
        return obj.get_task_status()
    
    def get_completion_percentage(self, obj):
        return obj.get_completion_percentage()
    
    def get_evidence_count(self, obj):
        return obj.evidence.count()


class AuditTaskListSerializer(serializers.ModelSerializer):
    """List serializer for audit tasks"""
    assigned_to_name = serializers.SerializerMethodField()
    task_status = serializers.SerializerMethodField()
    completion_percentage = serializers.SerializerMethodField()
    template_name = serializers.CharField(source='checklist.template.name', read_only=True)
    
    class Meta:
        model = AuditTask
        fields = [
            'id', 'task_name', 'description', 'assigned_to_name',
            'due_date', 'priority', 'control_area', 'risk_level',
            'task_status', 'completion_percentage', 'template_name',
            'created_at', 'updated_at'
        ]
    
    def get_assigned_to_name(self, obj):
        if obj.assigned_to:
            return obj.assigned_to.get_full_name() or obj.assigned_to.username
        return None
    
    def get_task_status(self, obj):
        return obj.get_task_status()
    
    def get_completion_percentage(self, obj):
        return obj.get_completion_percentage()


class AuditEvidenceSerializer(serializers.ModelSerializer):
    """Serializer for audit evidence"""
    collected_by_name = serializers.SerializerMethodField()
    verified_by_name = serializers.SerializerMethodField()
    file_url = serializers.SerializerMethodField()
    checklist_field_id = serializers.IntegerField(write_only=True, required=False, allow_null=True)
    
    class Meta:
        model = AuditEvidence
        fields = [
            'id', 'title', 'description', 'file', 'file_url', 'evidence_type',
            'collected_by', 'collected_by_name', 'collected_at',
            'is_verified', 'verified_by', 'verified_by_name', 'verified_at',
            'checklist_field', 'checklist_field_id'
        ]
        read_only_fields = [
            'id', 'collected_by', 'collected_at', 'verified_by', 'verified_at'
        ]
    
    def get_collected_by_name(self, obj):
        return obj.collected_by.get_full_name() or obj.collected_by.username
    
    def get_verified_by_name(self, obj):
        if obj.verified_by:
            return obj.verified_by.get_full_name() or obj.verified_by.username
        return None
    
    def get_file_url(self, obj):
        if obj.file:
            return obj.file.url
        return None
    
    def save(self, **kwargs):
        kwargs['collected_by'] = self.context['request'].user
        kwargs['audit_task'] = self.context['audit_task']
        
        # Handle field association
        checklist_field_id = self.validated_data.pop('checklist_field_id', None)
        if checklist_field_id:
            from apps.checklists.models import ChecklistField
            try:
                checklist_field = ChecklistField.objects.get(id=checklist_field_id)
                kwargs['checklist_field'] = checklist_field
            except ChecklistField.DoesNotExist:
                pass  # Field association is optional
        
        return super().save(**kwargs)


class AuditFindingSerializer(serializers.ModelSerializer):
    """Serializer for audit findings"""
    audit_task_name = serializers.SerializerMethodField()
    
    class Meta:
        model = AuditFinding
        fields = [
            'id', 'audit_task', 'audit_task_name', 'title', 'description', 
            'severity', 'category', 'status', 'created_by', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_by', 'created_at', 'updated_at']
    
    def get_audit_task_name(self, obj):
        return obj.audit_task.task_name if obj.audit_task else ''
    
    def create(self, validated_data):
        validated_data['created_by'] = self.context['request'].user
        return super().create(validated_data)


class AuditSerializer(serializers.ModelSerializer):
    created_by_name = serializers.SerializerMethodField()
    assigned_users_details = serializers.SerializerMethodField()
    workflow_name = serializers.SerializerMethodField()
    task_progress = serializers.SerializerMethodField()
    tasks_summary = serializers.SerializerMethodField()
    # Add status display for better presentation
    status_display = serializers.CharField(source='status', read_only=True)
    # Make status optional since it will be auto-set by the model
    status = serializers.CharField(required=False, allow_blank=True)

    class Meta:
        model = Audit
        fields = [
            'id', 'reference_number', 'title', 'audit_type', 'custom_audit_type',
            'audit_item', 'scope', 'objectives', 'status', 'status_display', 'period_from', 'period_to',
            'assigned_users', 'assigned_users_details', 'workflow', 'workflow_name',
            'created_by', 'created_by_name', 'created_at', 'updated_at',
            'task_progress', 'tasks_summary'
        ]
        read_only_fields = ['reference_number', 'created_by', 'created_at', 'updated_at']

    def get_created_by_name(self, obj):
        if not obj.created_by:
            return ''
        full_name = obj.created_by.get_full_name()
        return full_name.strip() if full_name.strip() else obj.created_by.username

    def get_assigned_users_details(self, obj):
        return [
            {
                'id': user.id,
                'username': user.username,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'email': user.email
            }
            for user in obj.assigned_users.all()
        ]

    def get_workflow_name(self, obj):
        return obj.workflow.name if obj.workflow else None
    
    def get_task_progress(self, obj):
        """Get task completion progress"""
        return obj.get_task_progress()
    
    def get_tasks_summary(self, obj):
        """Get summary of audit tasks"""
        tasks = obj.audit_tasks.all()
        return {
            'total': tasks.count(),
            'pending': tasks.filter(checklist__status='draft').count(),
            'in_progress': tasks.filter(checklist__status='in_progress').count(),
            'completed': tasks.filter(checklist__status='completed').count(),
            'overdue': tasks.filter(
                due_date__lt=timezone.now(),
                checklist__status__in=['draft', 'in_progress']
            ).count() if hasattr(timezone, 'now') else 0
        }

    def validate(self, data):
        """
        Check that:
        1. period_to is after period_from
        2. Either audit_type or custom_audit_type is provided, not both
        """
        if data.get('period_from') and data.get('period_to'):
            if data['period_to'] < data['period_from']:
                raise serializers.ValidationError({
                    'period_to': 'End date must be after start date.'
                })

        audit_type = data.get('audit_type')
        custom_audit_type = data.get('custom_audit_type')

        if audit_type and custom_audit_type:
            raise serializers.ValidationError(
                'Please provide either a system audit type or a custom audit type, not both.'
            )

        if not audit_type and not custom_audit_type:
            raise serializers.ValidationError(
                'Please provide either a system audit type or a custom audit type.'
            )

        return data

    def create(self, validated_data):
        # Extract many-to-many field data
        assigned_users_data = validated_data.pop('assigned_users', [])
        
        # Set the creator
        validated_data['created_by'] = self.context['request'].user
        
        # Create the audit instance
        audit = super().create(validated_data)
        
        # Set assigned users
        if assigned_users_data:
            audit.assigned_users.set(assigned_users_data)
        
        return audit

    def update(self, instance, validated_data):
        # Extract many-to-many field data
        assigned_users_data = validated_data.pop('assigned_users', None)
        
        # Update the audit instance
        audit = super().update(instance, validated_data)
        
        # Update assigned users if provided
        if assigned_users_data is not None:
            audit.assigned_users.set(assigned_users_data)
        
        return audit 

# Team Serializers
class TeamMemberSerializer(serializers.ModelSerializer):
    """Serializer for team member details"""
    user_details = serializers.SerializerMethodField()
    added_by_name = serializers.SerializerMethodField()
    
    class Meta:
        model = TeamMember
        fields = [
            'id', 'user', 'user_details', 'role', 'can_assign_tasks', 
            'can_review', 'can_manage_team', 'added_by', 'added_by_name',
            'joined_at', 'is_active', 'notes'
        ]
        read_only_fields = ['added_by', 'joined_at']
    
    def get_user_details(self, obj):
        """Get user details for the team member"""
        from apps.user.serializers import UserSerializer
        return UserSerializer(obj.user).data
    
    def get_added_by_name(self, obj):
        """Get name of user who added this member"""
        if obj.added_by:
            return obj.added_by.get_full_name() or obj.added_by.username
        return ''


class TeamListSerializer(serializers.ModelSerializer):
    """Serializer for team list view (minimal data)"""
    owner_name = serializers.SerializerMethodField()
    member_count = serializers.SerializerMethodField()
    type_display = serializers.SerializerMethodField()
    
    class Meta:
        model = Team
        fields = [
            'id', 'name', 'type', 'type_display', 'description', 
            'owner', 'owner_name', 'member_count', 'is_active', 
            'created_at', 'updated_at'
        ]
    
    def get_owner_name(self, obj):
        """Get owner's display name"""
        if obj.owner:
            return obj.owner.get_full_name() or obj.owner.username
        return ''
    
    def get_member_count(self, obj):
        """Get total member count including owner"""
        return obj.get_member_count()
    
    def get_type_display(self, obj):
        """Get human-readable team type"""
        return obj.get_type_display()


class TeamDetailSerializer(serializers.ModelSerializer):
    """Serializer for detailed team view"""
    owner_details = serializers.SerializerMethodField()
    members_details = TeamMemberSerializer(source='team_memberships', many=True, read_only=True)
    member_count = serializers.SerializerMethodField()
    type_display = serializers.SerializerMethodField()
    created_by_name = serializers.SerializerMethodField()
    audit_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Team
        fields = [
            'id', 'name', 'type', 'type_display', 'description', 
            'owner', 'owner_details', 'members_details', 'member_count',
            'is_active', 'audit_count', 'created_by', 'created_by_name',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['created_by', 'created_at', 'updated_at']
    
    def get_owner_details(self, obj):
        """Get detailed owner information"""
        from apps.user.serializers import UserSerializer
        if obj.owner:
            return UserSerializer(obj.owner).data
        return None
    
    def get_member_count(self, obj):
        """Get total member count including owner"""
        return obj.get_member_count()
    
    def get_type_display(self, obj):
        """Get human-readable team type"""
        return obj.get_type_display()
    
    def get_created_by_name(self, obj):
        """Get name of user who created the team"""
        if obj.created_by:
            return obj.created_by.get_full_name() or obj.created_by.username
        return ''
    
    def get_audit_count(self, obj):
        """Get number of audits assigned to this team"""
        return obj.audits.count()


class TeamCreateUpdateSerializer(serializers.ModelSerializer):
    """Serializer for creating and updating teams"""
    member_ids = serializers.ListField(
        child=serializers.IntegerField(),
        write_only=True,
        required=False,
        help_text="List of user IDs to add as team members"
    )
    
    class Meta:
        model = Team
        fields = [
            'id', 'name', 'type', 'description', 'owner', 
            'member_ids', 'is_active'
        ]
        read_only_fields = ['created_by', 'created_at', 'updated_at']
    
    def validate_owner(self, value):
        """Validate that the owner exists and is active"""
        if not value.is_active:
            raise serializers.ValidationError("Team owner must be an active user.")
        return value
    
    def validate_member_ids(self, value):
        """Validate that all member IDs correspond to active users"""
        if value:
            # Check that all users exist and are active
            existing_users = User.objects.filter(id__in=value, is_active=True)
            if existing_users.count() != len(value):
                missing_ids = set(value) - set(existing_users.values_list('id', flat=True))
                raise serializers.ValidationError(
                    f"The following user IDs are invalid or inactive: {missing_ids}"
                )
        return value
    
    def validate(self, attrs):
        """Additional validation"""
        # Ensure owner is not in member list
        member_ids = attrs.get('member_ids', [])
        owner = attrs.get('owner')
        
        if owner and member_ids and owner.id in member_ids:
            raise serializers.ValidationError({
                'member_ids': 'Team owner cannot be included in the members list.'
            })
        
        return attrs
    
    def create(self, validated_data):
        """Create team with members"""
        member_ids = validated_data.pop('member_ids', [])
        validated_data['created_by'] = self.context['request'].user
        
        team = super().create(validated_data)
        
        # Add members to the team
        if member_ids:
            self._add_members_to_team(team, member_ids)
        
        return team
    
    def update(self, instance, validated_data):
        """Update team and members"""
        member_ids = validated_data.pop('member_ids', None)
        
        team = super().update(instance, validated_data)
        
        # Update members if provided
        if member_ids is not None:
            # Remove existing members
            TeamMember.objects.filter(team=team).delete()
            # Add new members
            self._add_members_to_team(team, member_ids)
        
        return team
    
    def _add_members_to_team(self, team, member_ids):
        """Helper method to add members to team"""
        users = User.objects.filter(id__in=member_ids, is_active=True)
        team_members = []
        
        for user in users:
            team_member = TeamMember(
                team=team,
                user=user,
                role='member',
                added_by=self.context['request'].user
            )
            team_members.append(team_member)
        
        TeamMember.objects.bulk_create(team_members, ignore_conflicts=True)


class TeamMemberCreateUpdateSerializer(serializers.ModelSerializer):
    """Serializer for adding/updating team members"""
    
    class Meta:
        model = TeamMember
        fields = [
            'id', 'team', 'user', 'role', 'can_assign_tasks',
            'can_review', 'can_manage_team', 'is_active', 'notes'
        ]
        read_only_fields = ['added_by', 'joined_at']
    
    def validate(self, attrs):
        """Validate team member data"""
        team = attrs.get('team')
        user = attrs.get('user')
        
        if team and user:
            # Check if user is the team owner
            if team.owner == user:
                raise serializers.ValidationError(
                    "Team owner cannot be added as a regular member."
                )
            
            # Check if user is already a member (for creation)
            if not self.instance and TeamMember.objects.filter(team=team, user=user).exists():
                raise serializers.ValidationError(
                    "User is already a member of this team."
                )
        
        return attrs
    
    def create(self, validated_data):
        """Create team member"""
        validated_data['added_by'] = self.context['request'].user
        return super().create(validated_data) 