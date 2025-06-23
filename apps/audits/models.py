from django.db import models
from django.utils.translation import gettext_lazy as _
from apps.user.models import User

class AuditType(models.TextChoices):
    INTERNAL = 'internal', _('Internal')
    EXTERNAL = 'external', _('External')
    COMPLIANCE = 'compliance', _('Compliance')
    FINANCIAL = 'financial', _('Financial')
    OPERATIONAL = 'operational', _('Operational')
    IT = 'it', _('IT')
    PERFORMANCE = 'performance', _('Performance')

class AuditStatus(models.TextChoices):
    PLANNED = 'planned', _('Planned')
    IN_PROGRESS = 'in_progress', _('In Progress')
    COMPLETED = 'completed', _('Completed')
    CLOSED = 'closed', _('Closed')

class CustomAuditType(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    created_by = models.ForeignKey(
        User,
        on_delete=models.PROTECT,
        related_name='created_audit_types'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.name

    class Meta:
        ordering = ['name']
        verbose_name = _('Custom Audit Type')
        verbose_name_plural = _('Custom Audit Types')

class Audit(models.Model):
    reference_number = models.CharField(max_length=10, unique=True, editable=False)
    title = models.CharField(max_length=255, default='Untitled Audit')
    audit_type = models.CharField(
        max_length=100,
        choices=AuditType.choices,
        default=AuditType.INTERNAL
    )
    custom_audit_type = models.ForeignKey(
        CustomAuditType,
        on_delete=models.PROTECT,
        null=True,
        blank=True,
        related_name='audits'
    )
    scope = models.TextField()
    objectives = models.TextField()
    status = models.CharField(
        max_length=20,
        choices=AuditStatus.choices,
        default=AuditStatus.PLANNED
    )
    period_from = models.DateField()
    period_to = models.DateField()
    created_by = models.ForeignKey(
        User,
        on_delete=models.PROTECT,
        related_name='created_audits'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        if not self.reference_number:
            # Get the latest audit number
            latest_audit = Audit.objects.order_by('-reference_number').first()
            if latest_audit:
                latest_number = int(latest_audit.reference_number.split('-')[1])
                self.reference_number = f'AU-{latest_number + 1:04d}'
            else:
                self.reference_number = 'AU-0001'
        super().save(*args, **kwargs)

    def __str__(self):
        if self.custom_audit_type:
            return f'{self.reference_number} - {self.title} ({self.custom_audit_type.name})'
        return f'{self.reference_number} - {self.title} ({self.get_audit_type_display()})'

    class Meta:
        ordering = ['-created_at']
        verbose_name = _('Audit')
        verbose_name_plural = _('Audits')
