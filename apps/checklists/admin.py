from django.contrib import admin
from django.utils.translation import gettext_lazy as _
from .models import (
    ChecklistTemplate, ChecklistField, Checklist, ChecklistResponse,
    ChecklistComment, ChecklistAttachment
)


class ChecklistFieldInline(admin.TabularInline):
    model = ChecklistField
    extra = 0
    fields = ['label', 'field_type', 'is_required', 'order', 'help_text']
    ordering = ['order']


@admin.register(ChecklistTemplate)
class ChecklistTemplateAdmin(admin.ModelAdmin):
    list_display = ['name', 'category', 'is_active', 'is_frozen', 'usage_count', 'created_by', 'created_at']
    list_filter = ['category', 'is_active', 'is_frozen', 'created_at']
    search_fields = ['name', 'description', 'category']
    readonly_fields = ['usage_count', 'frozen_at', 'frozen_by', 'created_at', 'updated_at']
    inlines = [ChecklistFieldInline]
    
    fieldsets = (
        (_('Basic Information'), {
            'fields': ('name', 'description', 'category', 'is_active')
        }),
        (_('Status'), {
            'fields': ('is_frozen', 'frozen_by', 'frozen_at')
        }),
        (_('Statistics'), {
            'fields': ('usage_count',)
        }),
        (_('Metadata'), {
            'fields': ('created_by', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def get_readonly_fields(self, request, obj=None):
        readonly = list(self.readonly_fields)
        if obj and obj.is_frozen:
            readonly.extend(['name', 'description', 'category', 'is_active'])
        return readonly


@admin.register(ChecklistField)
class ChecklistFieldAdmin(admin.ModelAdmin):
    list_display = ['label', 'template', 'field_type', 'is_required', 'order']
    list_filter = ['field_type', 'is_required', 'template__category']
    search_fields = ['label', 'template__name']
    ordering = ['template', 'order']


class ChecklistResponseInline(admin.TabularInline):
    model = ChecklistResponse
    extra = 0
    readonly_fields = ['field', 'responded_at', 'responded_by']
    fields = ['field', 'value', 'is_completed', 'responded_by', 'responded_at']


@admin.register(Checklist)
class ChecklistAdmin(admin.ModelAdmin):
    list_display = ['name', 'template', 'status', 'assigned_to', 'completion_percentage', 'due_date', 'created_at']
    list_filter = ['status', 'priority', 'template__category', 'created_at']
    search_fields = ['name', 'description', 'template__name']
    readonly_fields = ['total_fields', 'completed_fields', 'completion_percentage', 'completed_at', 'created_at', 'updated_at']
    inlines = [ChecklistResponseInline]
    
    fieldsets = (
        (_('Basic Information'), {
            'fields': ('name', 'description', 'template', 'status', 'priority')
        }),
        (_('Assignment'), {
            'fields': ('assigned_to', 'created_by', 'due_date')
        }),
        (_('Progress'), {
            'fields': ('total_fields', 'completed_fields', 'completion_percentage', 'completed_at')
        }),
        (_('Additional'), {
            'fields': ('tags',)
        }),
        (_('Metadata'), {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(ChecklistResponse)
class ChecklistResponseAdmin(admin.ModelAdmin):
    list_display = ['checklist', 'field', 'is_completed', 'responded_by', 'responded_at']
    list_filter = ['is_completed', 'field__field_type', 'responded_at']
    search_fields = ['checklist__name', 'field__label']
    readonly_fields = ['responded_at', 'created_at', 'updated_at']


@admin.register(ChecklistComment)
class ChecklistCommentAdmin(admin.ModelAdmin):
    list_display = ['checklist', 'author', 'is_internal', 'created_at']
    list_filter = ['is_internal', 'created_at']
    search_fields = ['checklist__name', 'content', 'author__username']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(ChecklistAttachment)
class ChecklistAttachmentAdmin(admin.ModelAdmin):
    list_display = ['checklist', 'original_name', 'file_size', 'uploaded_by', 'created_at']
    list_filter = ['mime_type', 'created_at']
    search_fields = ['checklist__name', 'original_name', 'description']
    readonly_fields = ['file_size', 'mime_type', 'created_at', 'updated_at']
