from django.db import models
from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError
import json

User = get_user_model()

class Workflow(models.Model):
    STATUS_CHOICES = [
        ('draft', 'Draft'),
        ('active', 'Active'),
        ('archived', 'Archived')
    ]

    name = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='workflows')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    data = models.JSONField(default=dict)  # Stores the complete workflow data including nodes and edges
    version = models.PositiveIntegerField(default=1)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')

    class Meta:
        ordering = ['-updated_at']
        unique_together = ['name', 'created_by']  # Prevent duplicate names for the same user

    def __str__(self):
        return self.name

    def clean(self):
        # Validate workflow data structure
        if not isinstance(self.data, dict):
            raise ValidationError({'data': 'Workflow data must be a JSON object'})
        
        required_keys = ['nodes', 'edges']
        for key in required_keys:
            if key not in self.data:
                raise ValidationError({'data': f'Workflow data must contain {key}'})
            if not isinstance(self.data[key], list):
                raise ValidationError({'data': f'Workflow {key} must be a list'})

        # Validate nodes
        for node in self.data['nodes']:
            if not isinstance(node, dict):
                raise ValidationError({'data': 'Each node must be an object'})
            if 'id' not in node or 'type' not in node:
                raise ValidationError({'data': 'Each node must have id and type'})

        # Validate edges
        for edge in self.data['edges']:
            if not isinstance(edge, dict):
                raise ValidationError({'data': 'Each edge must be an object'})
            if 'source' not in edge or 'target' not in edge:
                raise ValidationError({'data': 'Each edge must have source and target'})

    def save(self, *args, **kwargs):
        if self.pk:  # If this is an update
            self.version += 1
        self.full_clean()  # Run validation before saving
        super().save(*args, **kwargs)
