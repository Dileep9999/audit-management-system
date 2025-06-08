from django.db import models
from apps.utils.constants import APPS


class Translation(models.Model):
    """
    Translations for the frontend.
    """

    key = models.CharField(max_length=255, unique=True)
    en = models.TextField(null=True, blank=True)
    ar = models.TextField(null=True, blank=True)
    app = models.CharField(max_length=255, choices=APPS, default="Audit")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.key
