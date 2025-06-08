from django.db import models
from django.contrib.auth.models import AbstractUser
from apps.utils.models import SoftDeleteModel
from django.conf import settings

# Import UploadedFile model
from apps.files.models import UploadedFile


class User(AbstractUser, SoftDeleteModel):
    email = models.EmailField(unique=True)

    # Optional AD-friendly fields
    department = models.CharField(max_length=255, blank=True, null=True)
    title = models.CharField(max_length=255, blank=True, null=True)
    ad_last_synced = models.DateTimeField(null=True, blank=True)

    # choices for language field setting
    language = models.CharField(
        null=True, blank=True, default="en", choices=settings.LANGUAGES, max_length=7
    )

    # Profile picture (optional, can be null/blank)
    picture = models.ForeignKey(
        UploadedFile,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name="user_pictures",
        help_text="Profile picture for the user (must be type='user').",
    )

    class Meta:
        permissions = [
            ("can_publish", "Can publish items"),
            ("can_archive", "Can archive items"),
        ]

    def __str__(self):
        return self.username
