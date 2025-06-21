from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class Workflow(models.Model):
    name = models.CharField(max_length=255)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='workflows')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    data = models.JSONField(default=dict)  # Stores the complete workflow data including nodes and edges

    class Meta:
        ordering = ['-updated_at']

    def __str__(self):
        return self.name
