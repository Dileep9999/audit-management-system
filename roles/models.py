from django.db import models
from django.conf import settings
from django.utils.translation import gettext_lazy as _


class Permission(models.Model):
    """Model for storing individual permissions"""
    name = models.CharField(max_length=255, unique=True)
    description = models.TextField(blank=True)
    category = models.CharField(max_length=100)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['category', 'name']
        verbose_name = _('Permission')
        verbose_name_plural = _('Permissions')

    def __str__(self):
        return f"{self.category} - {self.name}"


class Role(models.Model):
    """Model for storing roles with permissions"""
    SEVERITY_CHOICES = [
        ('Critical', 'Critical'),
        ('High', 'High'),
        ('Medium', 'Medium'),
        ('Low', 'Low'),
    ]
    
    STATUS_CHOICES = [
        ('Active', 'Active'),
        ('Inactive', 'Inactive'),
    ]

    name = models.CharField(max_length=255, unique=True)
    description = models.TextField(blank=True)
    severity = models.CharField(max_length=20, choices=SEVERITY_CHOICES, default='Low')
    hierarchy_position = models.IntegerField(default=0)
    permissions = models.ManyToManyField(Permission, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Active')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='created_roles')

    class Meta:
        ordering = ['hierarchy_position', 'name']
        verbose_name = _('Role')
        verbose_name_plural = _('Roles')

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        # Auto-assign hierarchy position if not set
        if not self.hierarchy_position:
            max_position = Role.objects.aggregate(models.Max('hierarchy_position'))['hierarchy_position__max']
            self.hierarchy_position = (max_position or 0) + 1
        super().save(*args, **kwargs)


class UserRole(models.Model):
    """Model for assigning roles to users"""
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='user_roles')
    role = models.ForeignKey(Role, on_delete=models.CASCADE, related_name='user_assignments')
    assigned_at = models.DateTimeField(auto_now_add=True)
    assigned_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True, related_name='role_assignments_made')

    class Meta:
        unique_together = ['user', 'role']
        verbose_name = _('User Role')
        verbose_name_plural = _('User Roles')

    def __str__(self):
        return f"{self.user.username} - {self.role.name}"
