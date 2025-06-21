from rest_framework import serializers
from .models import Workflow

class WorkflowSerializer(serializers.ModelSerializer):
    created_by_name = serializers.SerializerMethodField()

    class Meta:
        model = Workflow
        fields = ['id', 'name', 'description', 'created_by', 'created_by_name', 
                 'created_at', 'updated_at', 'data', 'version', 'status']
        read_only_fields = ['created_by', 'created_at', 'updated_at', 'version']

    def get_created_by_name(self, obj):
        return f"{obj.created_by.first_name} {obj.created_by.last_name}".strip() or obj.created_by.username

    def validate_name(self, value):
        # Check if name is not empty or just whitespace
        if not value.strip():
            raise serializers.ValidationError("Name cannot be empty")
        
        # Check for duplicate names for the same user
        request = self.context.get('request')
        if request and request.user:
            existing = Workflow.objects.filter(
                name=value,
                created_by=request.user
            )
            if self.instance:  # If updating
                existing = existing.exclude(pk=self.instance.pk)
            if existing.exists():
                raise serializers.ValidationError("You already have a workflow with this name")
        return value.strip()

    def validate_data(self, value):
        if not isinstance(value, dict):
            raise serializers.ValidationError("Workflow data must be a JSON object")
        
        required_keys = ['nodes', 'edges']
        for key in required_keys:
            if key not in value:
                raise serializers.ValidationError(f"Workflow data must contain {key}")
            if not isinstance(value[key], list):
                raise serializers.ValidationError(f"Workflow {key} must be a list")

        # Validate nodes
        node_ids = set()
        for node in value['nodes']:
            if not isinstance(node, dict):
                raise serializers.ValidationError("Each node must be an object")
            if 'id' not in node or 'type' not in node:
                raise serializers.ValidationError("Each node must have id and type")
            node_ids.add(node['id'])

        # Validate edges
        for edge in value['edges']:
            if not isinstance(edge, dict):
                raise serializers.ValidationError("Each edge must be an object")
            if 'source' not in edge or 'target' not in edge:
                raise serializers.ValidationError("Each edge must have source and target")
            # Validate that edge source and target exist in nodes
            if edge['source'] not in node_ids:
                raise serializers.ValidationError(f"Edge source {edge['source']} not found in nodes")
            if edge['target'] not in node_ids:
                raise serializers.ValidationError(f"Edge target {edge['target']} not found in nodes")

        return value

    def create(self, validated_data):
        validated_data['created_by'] = self.context['request'].user
        return super().create(validated_data) 