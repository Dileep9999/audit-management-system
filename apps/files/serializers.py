from rest_framework import serializers
from .models import UploadedFile, validate_file_type_and_size


class UploadedFileSerializer(serializers.ModelSerializer):
    url = serializers.ReadOnlyField(source="file.url")
    uploaded_by = serializers.ReadOnlyField(source="uploaded_by.username")

    class Meta:
        model = UploadedFile
        fields = [
            "id",
            "file",
            "original_name",
            "url",
            "uploaded_at",
            "uploaded_by",
            "type",
            "used",
            "description",
            "file_hash",
            "object_pk",
        ]

    def validate(self, attrs):
        file = attrs.get("file")
        file_type = attrs.get("type", "other")
        if file and file_type:
            validate_file_type_and_size(file, file_type)
        return attrs

    def create(self, validated_data):
        file = validated_data.get("file")
        if file:
            validated_data["original_name"] = file.name
        return super().create(validated_data)
