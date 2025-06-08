from django.contrib.auth import authenticate
from django.utils.translation import gettext_lazy as _
from rest_framework import serializers
from rest_framework.serializers import ModelSerializer
from .models import User
from apps.files.models import UploadedFile


class UploadedFileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UploadedFile
        fields = ["id", "file", "url", "type"]


class UserProfilePictureSerializer(serializers.ModelSerializer):
    picture = UploadedFileSerializer(read_only=True)
    picture_id = serializers.PrimaryKeyRelatedField(
        queryset=UploadedFile.objects.filter(type="user"),
        source="picture",
        write_only=True,
        required=True,
    )

    class Meta:
        model = User
        fields = ["id", "username", "picture", "picture_id"]

    def update(self, instance, validated_data):
        new_picture = validated_data.get("picture")
        old_picture = instance.picture

        # Set new picture as used
        if new_picture and not new_picture.used:
            new_picture.used = True
            new_picture.save(update_fields=["used"])

        # Set old picture as unused
        if old_picture and old_picture != new_picture:
            old_picture.used = False
            old_picture.save(update_fields=["used"])

        return super().update(instance, validated_data)


class UserSerializer(ModelSerializer):
    picture_url = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            "id",
            "email",
            "username",
            "first_name",
            "last_name",
            "is_active",
            "department",
            "title",
            "picture_url",
        ]
        read_only_fields = ("id", "email", "username", "is_active")

    def get_picture_url(self, obj):
        if obj.picture and obj.picture.file:
            return obj.picture.file.url
        return None


class CustomAuthTokenSerializer(serializers.Serializer):
    username = serializers.CharField(label=_("Username"))
    password = serializers.CharField(
        label=_("Password"), style={"input_type": "password"}, trim_whitespace=False
    )

    def validate(self, attrs):
        username = attrs.get("username")
        password = attrs.get("password")

        if username and password:
            user = authenticate(
                request=self.context.get("request"),
                username=username,
                password=password,
            )
            if not user:
                msg = _("Unable to log in with provided credentials.")
                raise serializers.ValidationError(msg, code="authorization")
            if not user.is_active:
                msg = _("User account is disabled.")
                raise serializers.ValidationError(msg, code="authorization")
        else:
            msg = _('Must include "username" and "password".')
            raise serializers.ValidationError(msg, code="authorization")

        attrs["user"] = user
        return attrs
