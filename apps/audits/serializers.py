from rest_framework import serializers
from django.utils.translation import gettext_lazy as _
from .models import Audit, AuditType, AuditStatus, CustomAuditType

class CustomAuditTypeSerializer(serializers.ModelSerializer):
    created_by_name = serializers.SerializerMethodField()

    class Meta:
        model = CustomAuditType
        fields = [
            'id',
            'name',
            'description',
            'created_by',
            'created_by_name',
            'created_at',
            'updated_at',
            'is_active'
        ]
        read_only_fields = ['created_by', 'created_at', 'updated_at']

    def get_created_by_name(self, obj):
        """
        Return the user's full name if available, otherwise username
        """
        if obj.created_by:
            full_name = obj.created_by.get_full_name()
            if full_name.strip():
                return full_name
            return obj.created_by.username
        return ""

    def validate_name(self, value):
        """
        Check that the audit type name is unique (case-insensitive)
        """
        if CustomAuditType.objects.filter(name__iexact=value).exists():
            raise serializers.ValidationError(_('An audit type with this name already exists.'))
        return value

    def create(self, validated_data):
        validated_data['created_by'] = self.context['request'].user
        return super().create(validated_data)

class AuditSerializer(serializers.ModelSerializer):
    audit_type_display = serializers.CharField(source='get_audit_type_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    created_by_name = serializers.SerializerMethodField()
    custom_audit_type_name = serializers.CharField(source='custom_audit_type.name', read_only=True)

    class Meta:
        model = Audit
        fields = [
            'id',
            'reference_number',
            'title',
            'audit_type',
            'audit_type_display',
            'custom_audit_type',
            'custom_audit_type_name',
            'scope',
            'objectives',
            'status',
            'status_display',
            'period_from',
            'period_to',
            'created_by',
            'created_by_name',
            'created_at',
            'updated_at'
        ]
        read_only_fields = ['reference_number', 'created_by', 'created_at', 'updated_at']

    def get_created_by_name(self, obj):
        """
        Return the user's full name if available, otherwise username
        """
        if obj.created_by:
            full_name = obj.created_by.get_full_name()
            if full_name.strip():
                return full_name
            return obj.created_by.username
        return ""

    def validate(self, data):
        """
        Check that:
        1. period_to is after period_from
        2. Either audit_type or custom_audit_type is provided, not both
        """
        if data.get('period_from') and data.get('period_to'):
            if data['period_to'] < data['period_from']:
                raise serializers.ValidationError({
                    'period_to': _('End date must be after start date.')
                })

        audit_type = data.get('audit_type')
        custom_audit_type = data.get('custom_audit_type')

        if audit_type and custom_audit_type:
            raise serializers.ValidationError(
                _('Please provide either a system audit type or a custom audit type, not both.')
            )

        if not audit_type and not custom_audit_type:
            raise serializers.ValidationError(
                _('Please provide either a system audit type or a custom audit type.')
            )

        return data

    def create(self, validated_data):
        """
        Set the created_by field to the current user
        """
        validated_data['created_by'] = self.context['request'].user
        return super().create(validated_data) 