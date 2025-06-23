from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.utils.translation import gettext_lazy as _
from .models import (
    ChecklistTemplate, ChecklistField, Checklist, ChecklistResponse,
    ChecklistComment, ChecklistAttachment, FieldType
)

User = get_user_model()


class UserSimpleSerializer(serializers.ModelSerializer):
    """Simple user serializer for nested usage"""
    full_name = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'full_name']
        read_only_fields = ['id', 'username', 'email']
    
    def get_full_name(self, obj):
        return obj.get_full_name()


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
        
        return attrs


class ChecklistTemplateCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating checklist templates"""
    fields = ChecklistFieldSerializer(many=True, required=False)
    
    class Meta:
        model = ChecklistTemplate
        fields = [
            'id', 'name', 'description', 'category', 'is_active',
            'fields', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
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
    
    class Meta:
        model = ChecklistTemplate
        fields = [
            'id', 'name', 'description', 'category', 'is_active', 'is_frozen',
            'created_by', 'frozen_by', 'frozen_at', 'usage_count',
            'fields', 'can_edit', 'created_at', 'updated_at'
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


class ChecklistTemplateListSerializer(serializers.ModelSerializer):
    """List serializer for checklist templates"""
    created_by = UserSimpleSerializer(read_only=True)
    fields_count = serializers.SerializerMethodField()
    
    class Meta:
        model = ChecklistTemplate
        fields = [
            'id', 'name', 'description', 'category', 'is_active', 'is_frozen',
            'created_by', 'usage_count', 'fields_count', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'created_by', 'usage_count', 'created_at', 'updated_at'
        ]
    
    def get_fields_count(self, obj):
        return obj.fields.count()


class ChecklistResponseSerializer(serializers.ModelSerializer):
    """Serializer for checklist responses"""
    field = ChecklistFieldSerializer(read_only=True)
    field_id = serializers.IntegerField(write_only=True)
    responded_by = UserSimpleSerializer(read_only=True)
    
    class Meta:
        model = ChecklistResponse
        fields = [
            'id', 'field', 'field_id', 'value', 'is_completed',
            'responded_by', 'responded_at', 'comments', 'internal_notes',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'responded_by', 'responded_at', 'created_at', 'updated_at']
    
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
        """Validate response data"""
        field_id = attrs.get('field_id')
        value = attrs.get('value')
        
        if field_id:
            try:
                field = ChecklistField.objects.get(id=field_id)
                # Add field-specific validation here
                if field.is_required and not value:
                    raise serializers.ValidationError({
                        'value': _('This field is required')
                    })
            except ChecklistField.DoesNotExist:
                pass
        
        return attrs
    
    def save(self, **kwargs):
        kwargs['responded_by'] = self.context['request'].user
        return super().save(**kwargs)


class ChecklistCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating checklists"""
    template_id = serializers.IntegerField(write_only=True)
    assigned_to_id = serializers.IntegerField(write_only=True, required=False)
    
    class Meta:
        model = Checklist
        fields = [
            'id', 'template_id', 'name', 'description', 'assigned_to_id',
            'due_date', 'priority', 'tags', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def validate_template_id(self, value):
        """Validate template exists and is active"""
        try:
            template = ChecklistTemplate.objects.get(id=value, is_active=True, is_deleted=False)
            return value
        except ChecklistTemplate.DoesNotExist:
            raise serializers.ValidationError(_('Template not found or inactive'))
    
    def create(self, validated_data):
        template_id = validated_data.pop('template_id')
        assigned_to_id = validated_data.pop('assigned_to_id', None)
        
        template = ChecklistTemplate.objects.get(id=template_id)
        validated_data['template'] = template
        validated_data['created_by'] = self.context['request'].user
        
        # Set assigned_to (default to creator if not specified)
        if assigned_to_id:
            try:
                assigned_to = User.objects.get(id=assigned_to_id)
                validated_data['assigned_to'] = assigned_to
            except User.DoesNotExist:
                raise serializers.ValidationError(_('Assigned user not found'))
        else:
            validated_data['assigned_to'] = self.context['request'].user
        
        # Create checklist
        checklist = Checklist.objects.create(**validated_data)
        
        # Increment template usage
        template.increment_usage()
        
        # Create initial responses for all template fields
        for field in template.fields.all():
            ChecklistResponse.objects.create(
                checklist=checklist,
                field=field,
                value={}
            )
        
        # Update progress
        checklist.update_progress()
        
        return checklist


class ChecklistDetailSerializer(serializers.ModelSerializer):
    """Detailed serializer for checklists"""
    template = ChecklistTemplateDetailSerializer(read_only=True)
    assigned_to = UserSimpleSerializer(read_only=True)
    created_by = UserSimpleSerializer(read_only=True)
    responses = ChecklistResponseSerializer(many=True, read_only=True)
    
    class Meta:
        model = Checklist
        fields = [
            'id', 'template', 'name', 'description', 'status',
            'assigned_to', 'created_by', 'due_date', 'completed_at',
            'total_fields', 'completed_fields', 'completion_percentage',
            'tags', 'priority', 'responses', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'template', 'assigned_to', 'created_by', 'completed_at',
            'total_fields', 'completed_fields', 'completion_percentage',
            'created_at', 'updated_at'
        ]


class ChecklistUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating checklists"""
    
    class Meta:
        model = Checklist
        fields = [
            'name', 'description', 'status', 'due_date', 'priority', 'tags'
        ]
    
    def update(self, instance, validated_data):
        # Auto-complete if all fields are completed
        if validated_data.get('status') == 'completed':
            if instance.completed_fields < instance.total_fields:
                raise serializers.ValidationError(
                    _('Cannot mark as completed: not all fields are completed')
                )
        
        return super().update(instance, validated_data)


class ChecklistListSerializer(serializers.ModelSerializer):
    """List serializer for checklists"""
    template_name = serializers.CharField(source='template.name', read_only=True)
    assigned_to = UserSimpleSerializer(read_only=True)
    created_by = UserSimpleSerializer(read_only=True)
    
    class Meta:
        model = Checklist
        fields = [
            'id', 'name', 'template_name', 'status', 'assigned_to', 'created_by',
            'due_date', 'completion_percentage', 'priority', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'template_name', 'assigned_to', 'created_by',
            'completion_percentage', 'created_at', 'updated_at'
        ]


class ChecklistCommentSerializer(serializers.ModelSerializer):
    """Serializer for checklist comments"""
    author = UserSimpleSerializer(read_only=True)
    replies = serializers.SerializerMethodField()
    
    class Meta:
        model = ChecklistComment
        fields = [
            'id', 'content', 'is_internal', 'author', 'parent',
            'replies', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'author', 'created_at', 'updated_at']
    
    def get_replies(self, obj):
        if obj.replies.exists():
            return ChecklistCommentSerializer(obj.replies.all(), many=True).data
        return []
    
    def save(self, **kwargs):
        kwargs['author'] = self.context['request'].user
        kwargs['checklist'] = self.context['checklist']
        return super().save(**kwargs)


class ChecklistAttachmentSerializer(serializers.ModelSerializer):
    """Serializer for checklist attachments"""
    uploaded_by = UserSimpleSerializer(read_only=True)
    file_url = serializers.SerializerMethodField()
    
    class Meta:
        model = ChecklistAttachment
        fields = [
            'id', 'file', 'file_url', 'original_name', 'description',
            'file_size', 'mime_type', 'uploaded_by', 'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'file_size', 'mime_type', 'uploaded_by', 'created_at', 'updated_at'
        ]
    
    def get_file_url(self, obj):
        if obj.file:
            return obj.file.url
        return None
    
    def save(self, **kwargs):
        kwargs['uploaded_by'] = self.context['request'].user
        kwargs['checklist'] = self.context['checklist']
        
        # Set file metadata
        if self.validated_data.get('file'):
            file_obj = self.validated_data['file']
            kwargs['original_name'] = file_obj.name
            kwargs['file_size'] = file_obj.size
            kwargs['mime_type'] = getattr(file_obj, 'content_type', '')
        
        return super().save(**kwargs)


class FieldTypeChoicesSerializer(serializers.Serializer):
    """Serializer for field type choices"""
    value = serializers.CharField()
    label = serializers.CharField()


class ChecklistTemplateFieldsAddSerializer(serializers.Serializer):
    """Serializer for adding fields to existing template"""
    fields = ChecklistFieldSerializer(many=True)
    
    def validate(self, attrs):
        template = self.context['template']
        if template.is_frozen:
            raise serializers.ValidationError(_('Cannot add fields to frozen template'))
        return attrs
    
    def save(self):
        template = self.context['template']
        fields_data = self.validated_data['fields']
        
        created_fields = []
        for field_data in fields_data:
            field = ChecklistField.objects.create(template=template, **field_data)
            created_fields.append(field)
        
        return created_fields 