from django.contrib import admin
from django.utils.translation import gettext_lazy as _
from .models import CustomAuditType, Audit, AuditTask, AuditEvidence, Team, TeamMember


class AuditTaskInline(admin.TabularInline):
    model = AuditTask
    extra = 0
    fields = ['task_name', 'assigned_to', 'priority', 'due_date', 'control_area']
    readonly_fields = ['created_at', 'updated_at']


class AuditEvidenceInline(admin.TabularInline):
    model = AuditEvidence
    extra = 0
    fields = ['title', 'evidence_type', 'file', 'is_verified']
    readonly_fields = ['collected_by', 'collected_at']


@admin.register(CustomAuditType)
class CustomAuditTypeAdmin(admin.ModelAdmin):
    list_display = ['name', 'is_active', 'created_by', 'created_at']
    list_filter = ['is_active', 'created_at']
    search_fields = ['name', 'description']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(Audit)
class AuditAdmin(admin.ModelAdmin):
    list_display = [
        'reference_number', 'title', 'audit_type', 'status', 
        'created_by', 'created_at'
    ]
    list_filter = ['audit_type', 'status', 'created_at']
    search_fields = ['reference_number', 'title', 'scope']
    readonly_fields = ['reference_number', 'created_at', 'updated_at']
    filter_horizontal = ['assigned_users']
    inlines = [AuditTaskInline]
    
    fieldsets = (
        (_('Basic Information'), {
            'fields': ('reference_number', 'title', 'audit_type', 'custom_audit_type')
        }),
        (_('Details'), {
            'fields': ('scope', 'objectives', 'period_from', 'period_to')
        }),
        (_('Status & Workflow'), {
            'fields': ('status', 'workflow')
        }),
        (_('Assignment'), {
            'fields': ('assigned_users', 'created_by')
        }),
        (_('Metadata'), {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(AuditTask)
class AuditTaskAdmin(admin.ModelAdmin):
    list_display = [
        'task_name', 'audit', 'assigned_to', 'priority', 'risk_level',
        'get_task_status', 'due_date', 'created_at'
    ]
    list_filter = [
        'priority', 'risk_level', 'audit__audit_type', 'created_at',
        'checklist__status'
    ]
    search_fields = [
        'task_name', 'description', 'audit__title', 'audit__reference_number',
        'control_area'
    ]
    readonly_fields = [
        'created_at', 'updated_at', 'completed_at', 'get_task_status',
        'get_completion_percentage'
    ]
    inlines = [AuditEvidenceInline]
    
    fieldsets = (
        (_('Task Information'), {
            'fields': ('task_name', 'description', 'audit', 'checklist')
        }),
        (_('Assignment & Scheduling'), {
            'fields': ('assigned_to', 'due_date', 'priority')
        }),
        (_('Audit Details'), {
            'fields': ('control_area', 'risk_level')
        }),
        (_('Status & Completion'), {
            'fields': (
                'get_task_status', 'get_completion_percentage', 
                'completed_at', 'completion_notes'
            )
        }),
        (_('Metadata'), {
            'fields': ('created_by', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def get_task_status(self, obj):
        return obj.get_task_status().title()
    get_task_status.short_description = _('Task Status')
    
    def get_completion_percentage(self, obj):
        return f"{obj.get_completion_percentage()}%"
    get_completion_percentage.short_description = _('Completion %')


@admin.register(AuditEvidence)
class AuditEvidenceAdmin(admin.ModelAdmin):
    list_display = [
        'title', 'audit_task', 'evidence_type', 'collected_by',
        'is_verified', 'collected_at'
    ]
    list_filter = [
        'evidence_type', 'is_verified', 'collected_at',
        'audit_task__audit__audit_type'
    ]
    search_fields = [
        'title', 'description', 'audit_task__task_name',
        'audit_task__audit__reference_number'
    ]
    readonly_fields = [
        'collected_by', 'collected_at', 'verified_by', 'verified_at'
    ]
    
    fieldsets = (
        (_('Evidence Information'), {
            'fields': ('title', 'description', 'audit_task')
        }),
        (_('File & Type'), {
            'fields': ('file', 'evidence_type')
        }),
        (_('Collection'), {
            'fields': ('collected_by', 'collected_at')
        }),
        (_('Verification'), {
            'fields': ('is_verified', 'verified_by', 'verified_at')
        }),
    )
    
    def save_model(self, request, obj, form, change):
        if not change:  # Creating new evidence
            obj.collected_by = request.user
        super().save_model(request, obj, form, change)


# Team Admin Classes
class TeamMemberInline(admin.TabularInline):
    model = TeamMember
    extra = 1
    fields = ['user', 'role', 'can_assign_tasks', 'can_review', 'can_manage_team', 'is_active']
    readonly_fields = ['added_by', 'joined_at']


@admin.register(Team)
class TeamAdmin(admin.ModelAdmin):
    list_display = [
        'name', 'type', 'owner', 'get_member_count', 'is_active', 
        'created_by', 'created_at'
    ]
    list_filter = ['type', 'is_active', 'created_at']
    search_fields = ['name', 'description', 'owner__username', 'owner__first_name', 'owner__last_name']
    readonly_fields = ['created_by', 'created_at', 'updated_at']
    filter_horizontal = ['audits']
    inlines = [TeamMemberInline]
    
    fieldsets = (
        (None, {
            'fields': ('name', 'type', 'description', 'owner')
        }),
        (_('Settings'), {
            'fields': ('is_active',)
        }),
        (_('Audit Assignments'), {
            'fields': ('audits',),
            'classes': ('collapse',)
        }),
        (_('Metadata'), {
            'fields': ('created_by', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def get_member_count(self, obj):
        """Get total member count including owner"""
        return obj.get_member_count()
    get_member_count.short_description = _('Member Count')
    
    def save_model(self, request, obj, form, change):
        if not change:  # Only set created_by for new objects
            obj.created_by = request.user
        super().save_model(request, obj, form, change)


@admin.register(TeamMember)
class TeamMemberAdmin(admin.ModelAdmin):
    list_display = [
        'user', 'team', 'role', 'can_assign_tasks', 'can_review', 
        'can_manage_team', 'is_active', 'added_by', 'joined_at'
    ]
    list_filter = ['role', 'is_active', 'can_assign_tasks', 'can_review', 'can_manage_team', 'joined_at']
    search_fields = [
        'user__username', 'user__first_name', 'user__last_name', 
        'team__name', 'added_by__username'
    ]
    readonly_fields = ['added_by', 'joined_at']
    
    fieldsets = (
        (None, {
            'fields': ('team', 'user', 'role')
        }),
        (_('Permissions'), {
            'fields': ('can_assign_tasks', 'can_review', 'can_manage_team')
        }),
        (_('Status & Notes'), {
            'fields': ('is_active', 'notes')
        }),
        (_('Metadata'), {
            'fields': ('added_by', 'joined_at'),
            'classes': ('collapse',)
        }),
    )
    
    def save_model(self, request, obj, form, change):
        if not change:  # Only set added_by for new objects
            obj.added_by = request.user
        super().save_model(request, obj, form, change)
