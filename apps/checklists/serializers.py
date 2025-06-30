from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.utils.translation import gettext_lazy as _
from django.utils import timezone
from django.core.files.uploadedfile import UploadedFile
import os
import mimetypes

from .models import (
    ChecklistTemplate, ChecklistField, Checklist, ChecklistResponse,
    ChecklistComment, ChecklistAttachment, FieldType
)

User = get_user_model()


class UserSimpleSerializer(serializers.ModelSerializer):
    """Simple user serializer for nested usage"""
    full_name = serializers.SerializerMethodField()
    avatar_url = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'full_name', 'avatar_url']
        read_only_fields = ['id', 'username', 'email']
    
    def get_full_name(self, obj):
        return obj.get_full_name() or obj.username
    
    def get_avatar_url(self, obj):
        # Return placeholder avatar URL
        return f"https://ui-avatars.com/api/?name={obj.username}&background=random"


class ChecklistFieldSerializer(serializers.ModelSerializer):
    """Serializer for checklist fields"""
    
    class Meta:
        model = ChecklistField
        fields = [
            'id', 'label', 'field_type', 'help_text', 'placeholder',
            'is_required', 'is_readonly', 'default_value', 'options',
            'min_length', 'max_length', 'min_value', 'max_value',
            'order', 'css_class', 'conditional_logic', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def validate(self, attrs):
        # Validate options for select/radio fields
        field_type = attrs.get('field_type')
        options = attrs.get('options', [])
        
        if field_type in [FieldType.SELECT, FieldType.MULTI_SELECT, FieldType.RADIO]:
            if not options:
                raise serializers.ValidationError({
                    'options': _('Options are required for select/radio fields')
                })
            if not isinstance(options, list):
                raise serializers.ValidationError({
                    'options': _('Options must be a list')
                })
            if len(options) < 1:
                raise serializers.ValidationError({
                    'options': _('At least one option is required')
                })
            
            # Validate option format
            for i, option in enumerate(options):
                if isinstance(option, str):
                    # Convert string to proper format
                    options[i] = {'value': option, 'label': option}
                elif isinstance(option, dict):
                    if 'value' not in option or 'label' not in option:
                        raise serializers.ValidationError({
                            'options': _('Each option must have "value" and "label" properties')
                        })
                else:
                    raise serializers.ValidationError({
                        'options': _('Options must be strings or objects with value/label')
                    })
            attrs['options'] = options
        
        # Validate min/max values
        min_val = attrs.get('min_value')
        max_val = attrs.get('max_value')
        if min_val is not None and max_val is not None and min_val > max_val:
            raise serializers.ValidationError({
                'min_value': _('Min value cannot be greater than max value')
            })
        
        min_len = attrs.get('min_length')
        max_len = attrs.get('max_length')
        if min_len is not None and max_len is not None and min_len > max_len:
            raise serializers.ValidationError({
                'min_length': _('Min length cannot be greater than max length')
            })
        
        # Validate conditional logic
        conditional_logic = attrs.get('conditional_logic', {})
        if conditional_logic and not isinstance(conditional_logic, dict):
            raise serializers.ValidationError({
                'conditional_logic': _('Conditional logic must be a JSON object')
            })
        
        return attrs


class ChecklistTemplateCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating checklist templates"""
    fields = ChecklistFieldSerializer(many=True, required=False)
    field_count = serializers.SerializerMethodField(read_only=True)
    
    class Meta:
        model = ChecklistTemplate
        fields = [
            'id', 'name', 'description', 'category', 'is_active',
            'fields', 'field_count', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_field_count(self, obj):
        return obj.fields.count() if obj.pk else 0
    
    def validate_name(self, value):
        if len(value.strip()) < 3:
            raise serializers.ValidationError(_('Name must be at least 3 characters long'))
        return value.strip()
    
    def validate_fields(self, value):
        if not value:
            raise serializers.ValidationError(_('At least one field is required'))
        
        # Validate field orders
        orders = [field.get('order', 0) for field in value]
        if len(orders) != len(set(orders)):
            raise serializers.ValidationError(_('Field orders must be unique'))
        
        return value
    
    def create(self, validated_data):
        fields_data = validated_data.pop('fields', [])
        validated_data['created_by'] = self.context['request'].user
        
        template = ChecklistTemplate.objects.create(**validated_data)
        
        # Create fields
        for field_data in fields_data:
            ChecklistField.objects.create(template=template, **field_data)
        
        return template
    
    def update(self, instance, validated_data):
        # Don't allow updates if template is frozen
        if instance.is_frozen:
            raise serializers.ValidationError(_('Cannot update frozen template'))
        
        fields_data = validated_data.pop('fields', None)
        
        # Update template
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        
        # Update fields if provided
        if fields_data is not None:
            # Delete existing fields
            instance.fields.all().delete()
            
            # Create new fields
            for field_data in fields_data:
                ChecklistField.objects.create(template=instance, **field_data)
        
        return instance


class ChecklistTemplateDetailSerializer(serializers.ModelSerializer):
    """Detailed serializer for checklist templates"""
    fields = ChecklistFieldSerializer(many=True, read_only=True)
    created_by = UserSimpleSerializer(read_only=True)
    frozen_by = UserSimpleSerializer(read_only=True)
    can_edit = serializers.SerializerMethodField()
    can_delete = serializers.SerializerMethodField()
    field_count = serializers.SerializerMethodField()
    usage_stats = serializers.SerializerMethodField()
    
    class Meta:
        model = ChecklistTemplate
        fields = [
            'id', 'name', 'description', 'category', 'is_active', 'is_frozen',
            'created_by', 'frozen_by', 'frozen_at', 'usage_count', 'field_count',
            'fields', 'can_edit', 'can_delete', 'usage_stats', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'created_by', 'frozen_by', 'frozen_at', 'usage_count',
            'created_at', 'updated_at'
        ]
    
    def get_can_edit(self, obj):
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return False
        
        # Cannot edit if frozen
        if obj.is_frozen:
            return False
        
        # Can edit if user is creator or admin
        return obj.created_by == request.user or request.user.is_staff
    
    def get_can_delete(self, obj):
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return False
        
        # Can delete if user is creator or admin, and no active checklists
        if obj.created_by == request.user or request.user.is_staff:
            return obj.checklists.filter(is_deleted=False).count() == 0
        return False
    
    def get_field_count(self, obj):
        return obj.fields.count()
    
    def get_usage_stats(self, obj):
        checklists = obj.checklists.filter(is_deleted=False)
        return {
            'total_checklists': checklists.count(),
            'active_checklists': checklists.exclude(status='completed').count(),
            'completed_checklists': checklists.filter(status='completed').count()
        }


class ChecklistTemplateListSerializer(serializers.ModelSerializer):
    """List serializer for checklist templates"""
    created_by = UserSimpleSerializer(read_only=True)
    field_count = serializers.SerializerMethodField()
    last_used = serializers.SerializerMethodField()
    
    class Meta:
        model = ChecklistTemplate
        fields = [
            'id', 'name', 'description', 'category', 'is_active', 'is_frozen',
            'created_by', 'usage_count', 'field_count', 'last_used', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'created_by', 'usage_count', 'created_at', 'updated_at'
        ]
    
    def get_field_count(self, obj):
        return obj.fields.count()
    
    def get_last_used(self, obj):
        last_checklist = obj.checklists.filter(is_deleted=False).order_by('-created_at').first()
        return last_checklist.created_at if last_checklist else None


class ChecklistResponseSerializer(serializers.ModelSerializer):
    """Serializer for checklist responses"""
    field = ChecklistFieldSerializer(read_only=True)
    field_id = serializers.IntegerField(write_only=True)
    responded_by = UserSimpleSerializer(read_only=True)
    field_label = serializers.CharField(source='field.label', read_only=True)
    field_type = serializers.CharField(source='field.field_type', read_only=True)
    is_valid_response = serializers.SerializerMethodField()
    
    class Meta:
        model = ChecklistResponse
        fields = [
            'id', 'field', 'field_id', 'field_label', 'field_type', 'value', 
            'is_completed', 'responded_by', 'responded_at', 'comments', 
            'internal_notes', 'is_valid_response', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'responded_by', 'responded_at', 'created_at', 'updated_at']
    
    def get_is_valid_response(self, obj):
        """Check if the response value is valid for the field type"""
        if not obj.value:
            return not obj.field.is_required
        
        field_type = obj.field.field_type
        value = obj.value
        
        try:
            if field_type == FieldType.NUMBER:
                num_val = float(value.get('number', 0))
                if obj.field.min_value and num_val < obj.field.min_value:
                    return False
                if obj.field.max_value and num_val > obj.field.max_value:
                    return False
            
            elif field_type in [FieldType.TEXT, FieldType.TEXTAREA]:
                text_val = str(value.get('text', ''))
                if obj.field.min_length and len(text_val) < obj.field.min_length:
                    return False
                if obj.field.max_length and len(text_val) > obj.field.max_length:
                    return False
            
            elif field_type in [FieldType.SELECT, FieldType.RADIO]:
                selected = value.get('selected')
                if selected:
                    valid_options = [opt['value'] for opt in obj.field.options]
                    return selected in valid_options
                return not obj.field.is_required
            
            elif field_type == FieldType.MULTI_SELECT:
                selected = value.get('selected', [])
                if selected:
                    valid_options = [opt['value'] for opt in obj.field.options]
                    return all(sel in valid_options for sel in selected)
                return not obj.field.is_required
            
            return True
            
        except (ValueError, TypeError, KeyError):
            return False
    
    def validate_field_id(self, value):
        """Validate field belongs to the checklist"""
        checklist = self.context.get('checklist')
        if checklist:
            try:
                field = ChecklistField.objects.get(id=value, template=checklist.template)
                return value
            except ChecklistField.DoesNotExist:
                raise serializers.ValidationError(_('Field does not belong to this checklist template'))
        return value
    
    def validate(self, attrs):
        field_id = attrs.get('field_id')
        value = attrs.get('value', {})
        is_completed = attrs.get('is_completed', False)
        
        if field_id:
            try:
                field = ChecklistField.objects.get(id=field_id)
                
                # Validate required fields
                if field.is_required and is_completed and not value:
                    raise serializers.ValidationError({
                        'value': _('Value is required for required fields')
                    })
                
                # Validate value format based on field type
                if value and is_completed:
                    field_type = field.field_type
                    
                    if field_type == FieldType.EMAIL:
                        email_val = value.get('email', '')
                        if email_val:
                            from django.core.validators import validate_email
                            try:
                                validate_email(email_val)
                            except:
                                raise serializers.ValidationError({
                                    'value': _('Invalid email format')
                                })
                    
                    elif field_type == FieldType.URL:
                        url_val = value.get('url', '')
                        if url_val:
                            from django.core.validators import URLValidator
                            validator = URLValidator()
                            try:
                                validator(url_val)
                            except:
                                raise serializers.ValidationError({
                                    'value': _('Invalid URL format')
                                })
                
            except ChecklistField.DoesNotExist:
                pass  # Will be caught by field_id validation
        
        return attrs
    
    def save(self, **kwargs):
        # Set responded_at if is_completed is True
        if self.validated_data.get('is_completed') and not kwargs.get('responded_at'):
            kwargs['responded_at'] = timezone.now()
        
        return super().save(**kwargs)


class ChecklistCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating checklists"""
    template_id = serializers.IntegerField(write_only=True)
    assigned_to_id = serializers.IntegerField(write_only=True, required=False)
    template_name = serializers.CharField(source='template.name', read_only=True)
    
    class Meta:
        model = Checklist
        fields = [
            'id', 'template_id', 'template_name', 'name', 'description', 
            'assigned_to_id', 'due_date', 'priority', 'tags', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def validate_template_id(self, value):
        try:
            template = ChecklistTemplate.objects.get(id=value, is_active=True, is_deleted=False)
            return value
        except ChecklistTemplate.DoesNotExist:
            raise serializers.ValidationError(_('Template not found or not active'))
    
    def validate_assigned_to_id(self, value):
        if value:
            try:
                User.objects.get(id=value, is_active=True)
                return value
            except User.DoesNotExist:
                raise serializers.ValidationError(_('Assigned user not found or not active'))
        return value
    
    def validate_name(self, value):
        if len(value.strip()) < 3:
            raise serializers.ValidationError(_('Name must be at least 3 characters long'))
        return value.strip()
    
    def validate_tags(self, value):
        if value and not isinstance(value, list):
            raise serializers.ValidationError(_('Tags must be a list'))
        return value or []
    
    def create(self, validated_data):
        template_id = validated_data.pop('template_id')
        assigned_to_id = validated_data.pop('assigned_to_id', None)
        
        # Get template and user
        template = ChecklistTemplate.objects.get(id=template_id)
        assigned_to = None
        if assigned_to_id:
            assigned_to = User.objects.get(id=assigned_to_id)
        
        # Create checklist
        checklist = Checklist.objects.create(
            template=template,
            assigned_to=assigned_to,
            **validated_data
        )
        
        # Calculate initial field counts
        total_fields = template.fields.exclude(field_type=FieldType.SECTION).count()
        checklist.total_fields = total_fields
        checklist.save(update_fields=['total_fields'])
        
        return checklist


class ChecklistDetailSerializer(serializers.ModelSerializer):
    """Detailed serializer for checklists"""
    template = ChecklistTemplateDetailSerializer(read_only=True)
    assigned_to = UserSimpleSerializer(read_only=True)
    assigned_users = UserSimpleSerializer(many=True, read_only=True)
    created_by = UserSimpleSerializer(read_only=True)
    responses = ChecklistResponseSerializer(many=True, read_only=True)
    response_count = serializers.SerializerMethodField()
    overdue = serializers.SerializerMethodField()
    time_remaining = serializers.SerializerMethodField()
    can_edit = serializers.SerializerMethodField()
    
    class Meta:
        model = Checklist
        fields = [
            'id', 'template', 'name', 'description', 'status',
            'assigned_to', 'assigned_users', 'created_by', 'due_date', 'completed_at',
            'total_fields', 'completed_fields', 'completion_percentage',
            'tags', 'priority', 'responses', 'response_count', 'overdue',
            'time_remaining', 'can_edit', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'total_fields', 'completed_fields', 'completion_percentage',
            'completed_at', 'created_at', 'updated_at'
        ]
    
    def get_response_count(self, obj):
        return obj.responses.count()
    
    def get_overdue(self, obj):
        if obj.due_date and obj.status not in ['completed', 'cancelled']:
            return timezone.now() > obj.due_date
        return False
    
    def get_time_remaining(self, obj):
        if obj.due_date and obj.status not in ['completed', 'cancelled']:
            delta = obj.due_date - timezone.now()
            if delta.total_seconds() > 0:
                return {
                    'days': delta.days,
                    'hours': delta.seconds // 3600,
                    'total_hours': delta.total_seconds() / 3600
                }
        return None
    
    def get_can_edit(self, obj):
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return False
        
        return (obj.assigned_to == request.user or 
                obj.created_by == request.user or 
                request.user.is_staff)


class ChecklistUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating checklists"""
    assigned_to_id = serializers.IntegerField(write_only=True, required=False)
    
    class Meta:
        model = Checklist
        fields = [
            'name', 'description', 'status', 'assigned_to_id', 
            'due_date', 'priority', 'tags'
        ]
    
    def validate_assigned_to_id(self, value):
        if value:
            try:
                User.objects.get(id=value, is_active=True)
                return value
            except User.DoesNotExist:
                raise serializers.ValidationError(_('Assigned user not found'))
        return value
    
    def update(self, instance, validated_data):
        assigned_to_id = validated_data.pop('assigned_to_id', None)
        
        if assigned_to_id:
            instance.assigned_to = User.objects.get(id=assigned_to_id)
        elif 'assigned_to_id' in self.initial_data and assigned_to_id is None:
            instance.assigned_to = None
        
        # Auto-complete if all required fields are completed
        if validated_data.get('status') == 'completed':
            required_fields = instance.template.fields.filter(is_required=True)
            completed_responses = instance.responses.filter(
                field__is_required=True,
                is_completed=True
            )
            
            if required_fields.count() > completed_responses.count():
                validated_data['status'] = 'in_progress'  # Keep as in_progress
        
        # Update fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        # Set completed_at
        if instance.status == 'completed' and not instance.completed_at:
            instance.completed_at = timezone.now()
        elif instance.status != 'completed':
            instance.completed_at = None
        
        instance.save()
        return instance


class ChecklistListSerializer(serializers.ModelSerializer):
    """List serializer for checklists"""
    template_name = serializers.CharField(source='template.name', read_only=True)
    template_category = serializers.CharField(source='template.category', read_only=True)
    assigned_to = UserSimpleSerializer(read_only=True)
    created_by = UserSimpleSerializer(read_only=True)
    overdue = serializers.SerializerMethodField()
    last_activity = serializers.SerializerMethodField()
    
    class Meta:
        model = Checklist
        fields = [
            'id', 'name', 'template_name', 'template_category', 'status', 
            'assigned_to', 'created_by', 'due_date', 'completion_percentage', 
            'priority', 'overdue', 'last_activity', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'completion_percentage', 'created_at', 'updated_at'
        ]
    
    def get_overdue(self, obj):
        if obj.due_date and obj.status not in ['completed', 'cancelled']:
            return timezone.now() > obj.due_date
        return False
    
    def get_last_activity(self, obj):
        last_response = obj.responses.order_by('-updated_at').first()
        return last_response.updated_at if last_response else obj.updated_at


class ChecklistCommentSerializer(serializers.ModelSerializer):
    """Serializer for checklist comments"""
    author = UserSimpleSerializer(read_only=True)
    replies = serializers.SerializerMethodField()
    can_edit = serializers.SerializerMethodField()
    can_delete = serializers.SerializerMethodField()
    
    class Meta:
        model = ChecklistComment
        fields = [
            'id', 'content', 'is_internal', 'author', 'parent',
            'replies', 'can_edit', 'can_delete', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'author', 'created_at', 'updated_at']
    
    def get_replies(self, obj):
        if obj.replies.exists():
            return ChecklistCommentSerializer(
                obj.replies.all(),
                many=True,
                context=self.context
            ).data
        return []
    
    def get_can_edit(self, obj):
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return False
        return obj.author == request.user or request.user.is_staff
    
    def get_can_delete(self, obj):
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return False
        return obj.author == request.user or request.user.is_staff
    
    def validate_content(self, value):
        if len(value.strip()) < 1:
            raise serializers.ValidationError(_('Comment content cannot be empty'))
        return value.strip()
    
    def save(self, **kwargs):
        if not self.instance:  # Creating new comment
            kwargs['author'] = self.context['request'].user
        return super().save(**kwargs)


class ChecklistAttachmentSerializer(serializers.ModelSerializer):
    """Serializer for checklist attachments"""
    uploaded_by = UserSimpleSerializer(read_only=True)
    file_url = serializers.SerializerMethodField()
    file_size_human = serializers.SerializerMethodField()
    can_delete = serializers.SerializerMethodField()
    
    class Meta:
        model = ChecklistAttachment
        fields = [
            'id', 'file', 'file_url', 'original_name', 'description',
            'file_size', 'file_size_human', 'mime_type', 'uploaded_by', 
            'can_delete', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'original_name', 'file_size', 'mime_type', 'uploaded_by',
            'created_at', 'updated_at'
        ]
    
    def get_file_url(self, obj):
        if obj.file:
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.file.url)
            return obj.file.url
        return None
    
    def get_file_size_human(self, obj):
        size = obj.file_size
        for unit in ['B', 'KB', 'MB', 'GB']:
            if size < 1024.0:
                return f"{size:.1f} {unit}"
            size /= 1024.0
        return f"{size:.1f} TB"
    
    def get_can_delete(self, obj):
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return False
        return obj.uploaded_by == request.user or request.user.is_staff
    
    def validate_file(self, value):
        if not isinstance(value, UploadedFile):
            raise serializers.ValidationError(_('Invalid file upload'))
        
        # Check file size (max 10MB)
        max_size = 10 * 1024 * 1024  # 10MB
        if value.size > max_size:
            raise serializers.ValidationError(
                _('File size cannot exceed 10MB')
            )
        
        # Check file type
        allowed_types = [
            'application/pdf', 'application/msword', 
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'text/plain', 'text/csv',
            'image/jpeg', 'image/png', 'image/gif', 'image/webp'
        ]
        
        file_type = getattr(value, 'content_type', None)
        if file_type and file_type not in allowed_types:
            raise serializers.ValidationError(
                _('File type not allowed. Allowed types: PDF, Word, Excel, Text, Images')
            )
        
        return value
    
    def save(self, **kwargs):
        if not self.instance:  # Creating new attachment
            file = self.validated_data['file']
            kwargs.update({
                'uploaded_by': self.context['request'].user,
                'original_name': file.name,
                'file_size': file.size,
                'mime_type': getattr(file, 'content_type', '')
            })
        return super().save(**kwargs)


class FieldTypeChoicesSerializer(serializers.Serializer):
    """Serializer for field type choices"""
    value = serializers.CharField()
    label = serializers.CharField()


class ChecklistTemplateFieldsAddSerializer(serializers.Serializer):
    """Serializer for adding fields to existing template"""
    fields = ChecklistFieldSerializer(many=True)
    
    def validate(self, attrs):
        template = self.context.get('template')
        if not template:
            raise serializers.ValidationError(_('Template context required'))
        
        if template.is_frozen:
            raise serializers.ValidationError(_('Cannot add fields to frozen template'))
        
        return attrs
    
    def save(self):
        template = self.context['template']
        fields_data = self.validated_data['fields']
        
        created_fields = []
        for field_data in fields_data:
            field = ChecklistField.objects.create(
                template=template,
                **field_data
            )
            created_fields.append(field)
        
        return created_fields


class ChecklistExportSerializer(serializers.Serializer):
    """Serializer for checklist export data"""
    checklist = ChecklistDetailSerializer(read_only=True)
    responses = ChecklistResponseSerializer(many=True, read_only=True)
    comments = ChecklistCommentSerializer(many=True, read_only=True)
    attachments = ChecklistAttachmentSerializer(many=True, read_only=True)
    exported_at = serializers.DateTimeField(read_only=True)
    exported_by = UserSimpleSerializer(read_only=True)
    
    class Meta:
        fields = [
            'checklist', 'responses', 'comments', 'attachments',
            'exported_at', 'exported_by'
        ]


class ChecklistBulkUpdateSerializer(serializers.Serializer):
    """Serializer for bulk updating checklists"""
    checklist_ids = serializers.ListField(
        child=serializers.IntegerField(),
        min_length=1
    )
    status = serializers.ChoiceField(
        choices=Checklist.STATUS_CHOICES,
        required=False
    )
    assigned_to_id = serializers.IntegerField(required=False, allow_null=True)
    priority = serializers.ChoiceField(
        choices=[('low', 'Low'), ('medium', 'Medium'), ('high', 'High'), ('critical', 'Critical')],
        required=False
    )
    due_date = serializers.DateTimeField(required=False, allow_null=True)
    tags = serializers.ListField(
        child=serializers.CharField(max_length=50),
        required=False
    )
    
    def validate_checklist_ids(self, value):
        user = self.context['request'].user
        checklists = Checklist.objects.filter(
            id__in=value,
            is_deleted=False
        )
        
        # Filter by permissions
        if not user.is_staff:
            checklists = checklists.filter(
                Q(assigned_to=user) | Q(created_by=user)
            )
        
        found_ids = list(checklists.values_list('id', flat=True))
        invalid_ids = set(value) - set(found_ids)
        
        if invalid_ids:
            raise serializers.ValidationError(
                f'Invalid checklist IDs: {list(invalid_ids)}'
            )
        
        return found_ids
    
    def validate_assigned_to_id(self, value):
        if value:
            try:
                User.objects.get(id=value, is_active=True)
                return value
            except User.DoesNotExist:
                raise serializers.ValidationError(_('Assigned user not found'))
        return value 