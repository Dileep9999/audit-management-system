from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Audit, AuditType, CustomAuditType

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

class AuditSerializer(serializers.ModelSerializer):
    created_by_name = serializers.SerializerMethodField()
    assigned_users_details = serializers.SerializerMethodField()
    workflow_name = serializers.SerializerMethodField()
    # Add status display for better presentation
    status_display = serializers.CharField(source='status', read_only=True)
    # Make status optional since it will be auto-set by the model
    status = serializers.CharField(required=False, allow_blank=True)

    class Meta:
        model = Audit
        fields = [
            'id', 'reference_number', 'title', 'audit_type', 'custom_audit_type',
            'scope', 'objectives', 'status', 'status_display', 'period_from', 'period_to',
            'assigned_users', 'assigned_users_details', 'workflow', 'workflow_name',
            'created_by', 'created_by_name', 'created_at', 'updated_at'
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