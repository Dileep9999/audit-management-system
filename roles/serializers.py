from rest_framework import serializers
from .models import Permission, Role, UserRole


class PermissionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Permission
        fields = ['id', 'name', 'description', 'category', 'created_at', 'updated_at']
        read_only_fields = ['created_at', 'updated_at']


class RoleSerializer(serializers.ModelSerializer):
    permissions = PermissionSerializer(many=True, read_only=True)
    permission_ids = serializers.PrimaryKeyRelatedField(
        many=True, 
        write_only=True, 
        queryset=Permission.objects.all(),
        required=False,
        source='permissions'
    )
    created_by_username = serializers.CharField(source='created_by.username', read_only=True)
    permissions_count = serializers.SerializerMethodField()

    class Meta:
        model = Role
        fields = [
            'id', 'name', 'description', 'severity', 'hierarchy_position', 
            'status', 'permissions', 'permission_ids', 'created_at', 
            'updated_at', 'created_by', 'created_by_username', 'permissions_count'
        ]
        read_only_fields = ['created_at', 'updated_at', 'created_by', 'hierarchy_position']

    def get_permissions_count(self, obj):
        return obj.permissions.count()

    def create(self, validated_data):
        # Set created_by to the current user
        validated_data['created_by'] = self.context['request'].user
        return super().create(validated_data)


class RoleListSerializer(serializers.ModelSerializer):
    permissions_count = serializers.SerializerMethodField()
    created_by_username = serializers.CharField(source='created_by.username', read_only=True)

    class Meta:
        model = Role
        fields = [
            'id', 'name', 'description', 'severity', 'hierarchy_position', 
            'status', 'permissions_count', 'created_at', 'created_by_username'
        ]

    def get_permissions_count(self, obj):
        return obj.permissions.count()


class UserRoleSerializer(serializers.ModelSerializer):
    role_name = serializers.CharField(source='role.name', read_only=True)
    user_username = serializers.CharField(source='user.username', read_only=True)
    assigned_by_username = serializers.CharField(source='assigned_by.username', read_only=True)

    class Meta:
        model = UserRole
        fields = [
            'id', 'user', 'user_username', 'role', 'role_name', 
            'assigned_at', 'assigned_by', 'assigned_by_username'
        ]
        read_only_fields = ['assigned_at', 'assigned_by']


class RoleReorderSerializer(serializers.Serializer):
    role_id = serializers.IntegerField()
    new_position = serializers.IntegerField()


class PermissionCategorySerializer(serializers.Serializer):
    category = serializers.CharField()
    permissions = PermissionSerializer(many=True) 