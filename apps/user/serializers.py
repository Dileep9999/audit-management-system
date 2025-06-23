from django.contrib.auth import authenticate
from django.utils.translation import gettext_lazy as _
from rest_framework import serializers
from rest_framework.serializers import ModelSerializer
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError
from .models import User
from apps.files.models import UploadedFile


class UploadedFileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UploadedFile
        fields = ["id", "file", "url", "type"]


class UserCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating new users"""
    password = serializers.CharField(
        write_only=True,
        required=True,
        help_text="Leave empty if no change needed",
        style={'input_type': 'password', 'placeholder': 'Password'}
    )
    password_confirm = serializers.CharField(
        write_only=True,
        required=True,
        help_text="Enter the same password as before, for verification.",
        style={'input_type': 'password', 'placeholder': 'Password confirmation'}
    )

    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name',
            'password', 'password_confirm', 'department', 'title', 
            'language', 'is_active', 'is_staff'
        ]
        extra_kwargs = {
            'password': {'write_only': True},
            'password_confirm': {'write_only': True},
        }

    def validate_email(self, value):
        """Validate email uniqueness"""
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError(_("A user with this email already exists."))
        return value

    def validate_username(self, value):
        """Validate username uniqueness"""
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError(_("A user with this username already exists."))
        return value

    def validate_password(self, value):
        """Validate password using Django's password validators"""
        try:
            validate_password(value)
        except DjangoValidationError as e:
            raise serializers.ValidationError(list(e.messages))
        return value

    def validate(self, attrs):
        """Validate password confirmation"""
        if attrs.get('password') != attrs.get('password_confirm'):
            raise serializers.ValidationError({
                "password_confirm": _("The two password fields didn't match.")
            })
        return attrs

    def create(self, validated_data):
        """Create user with hashed password"""
        # Remove password_confirm as it's not a model field
        validated_data.pop('password_confirm', None)
        
        # Extract password and hash it
        password = validated_data.pop('password')
        user = User.objects.create_user(**validated_data)
        user.set_password(password)
        user.save()
        
        return user


class UserUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating existing users"""
    password = serializers.CharField(
        write_only=True,
        required=False,
        allow_blank=True,
        help_text="Leave empty if no change needed",
        style={'input_type': 'password', 'placeholder': 'Password'}
    )
    password_confirm = serializers.CharField(
        write_only=True,
        required=False,
        allow_blank=True,
        help_text="Enter the same password as before, for verification.",
        style={'input_type': 'password', 'placeholder': 'Password confirmation'}
    )

    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name',
            'password', 'password_confirm', 'department', 'title', 
            'language', 'is_active', 'is_staff'
        ]
        read_only_fields = ('id', 'username', 'email')
        extra_kwargs = {
            'password': {'write_only': True},
            'password_confirm': {'write_only': True},
        }

    def validate_password(self, value):
        """Validate password using Django's password validators"""
        if value:  # Only validate if password is provided
            try:
                validate_password(value)
            except DjangoValidationError as e:
                raise serializers.ValidationError(list(e.messages))
        return value

    def validate(self, attrs):
        """Validate password confirmation if password is being updated"""
        password = attrs.get('password')
        password_confirm = attrs.get('password_confirm')
        
        if password or password_confirm:
            if password != password_confirm:
                raise serializers.ValidationError({
                    "password_confirm": _("The two password fields didn't match.")
                })
        return attrs

    def update(self, instance, validated_data):
        """Update user, handling password separately"""
        # Remove password fields for separate handling
        password = validated_data.pop('password', None)
        validated_data.pop('password_confirm', None)
        
        # Update other fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        
        # Update password if provided
        if password:
            instance.set_password(password)
        
        instance.save()
        return instance


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
    full_name = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            "id",
            "email",
            "username",
            "first_name",
            "last_name",
            "full_name",
            "is_active",
            "is_staff",
            "is_superuser",
            "department",
            "title",
            "language",
            "picture_url",
            "date_joined",
            "last_login",
            "created_at",
            "updated_at",
        ]
        read_only_fields = (
            "id", 
            "email", 
            "username", 
            "is_active", 
            "date_joined", 
            "last_login",
            "created_at",
            "updated_at",
        )

    def get_picture_url(self, obj):
        if obj.picture and obj.picture.file:
            return obj.picture.file.url
        return None

    def get_full_name(self, obj):
        return obj.get_full_name()


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
