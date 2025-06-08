from django.db import models
from django.conf import settings
from django.utils.translation import gettext_lazy as _


class Notification(models.Model):
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="notifications"
    )
    title = models.CharField(max_length=255)
    message = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    read_at = models.DateTimeField(null=True, blank=True)
    read = models.BooleanField(default=False)
    metadata = models.JSONField(default=dict, blank=True)
    type = models.CharField(max_length=50, default="info")

    class Meta:
        indexes = [
            models.Index(fields=["user", "read"]),
        ]
        permissions = [
            ("can_view_notifications", _("Can view notifications")),
            ("can_manage_notifications", _("Can manage notifications")),
        ]

    def __str__(self):
        return f"{self.title} ({'read' if self.read else 'unread'})"
