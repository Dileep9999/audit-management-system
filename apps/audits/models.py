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
        max_length=100,
        help_text='Current workflow state name'
    )
    period_from = models.DateField()
    period_to = models.DateField()
    assigned_users = models.ManyToManyField(
        User,
        blank=True,
        related_name='assigned_audits',
        help_text='Users assigned to work on this audit'
    )
    workflow = models.ForeignKey(
        'workflows.Workflow',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='audits',
        help_text='Workflow to be followed for this audit'
    )
    created_by = models.ForeignKey(
        User,
        on_delete=models.PROTECT,
        related_name='created_audits'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def get_available_transitions(self):
        """
        Get available status transitions based on the assigned workflow
        """
        if not self.workflow or not self.workflow.data:
            return []
        
        workflow_data = self.workflow.data
        if 'transitions' not in workflow_data:
            return []
        
        transitions = workflow_data['transitions']
        current_transitions = transitions.get(self.status, [])
        return [transition['to'] for transition in current_transitions]

    def get_initial_status(self):
        """
        Get the initial status from the workflow (first node)
        """
        if not self.workflow or not self.workflow.data:
            return 'Draft'  # Default fallback
        
        workflow_data = self.workflow.data
        nodes = workflow_data.get('nodes', [])
        if nodes:
            return nodes[0].get('data', {}).get('name', 'Draft')
        return 'Draft'

    def save(self, *args, **kwargs):
        if not self.reference_number:
            # Get the latest audit number
            latest_audit = Audit.objects.order_by('-reference_number').first()
            if latest_audit:
                latest_number = int(latest_audit.reference_number.split('-')[1])
                self.reference_number = f'AU-{latest_number + 1:04d}'
            else:
                self.reference_number = 'AU-0001'
        
        # Set initial status if creating new audit and no status is set
        if not self.pk and (not self.status or self.status.strip() == ''):
            # If workflow is available, get initial status from it
            if self.workflow_id:
                try:
                    from workflows.models import Workflow
                    workflow = Workflow.objects.get(id=self.workflow_id)
                    if workflow.data and 'nodes' in workflow.data:
                        nodes = workflow.data.get('nodes', [])
                        if nodes:
                            # Get the name from the first node's data
                            first_node = nodes[0]
                            node_data = first_node.get('data', {})
                            self.status = node_data.get('name') or node_data.get('label') or 'Draft'
                        else:
                            self.status = 'Draft'
                    else:
                        self.status = 'Draft'
                except Exception as e:
                    print(f"Error getting workflow initial status: {e}")
                    self.status = 'Draft'
            elif self.workflow:
                # If workflow object is available but not workflow_id
                try:
                    if self.workflow.data and 'nodes' in self.workflow.data:
                        nodes = self.workflow.data.get('nodes', [])
                        if nodes:
                            first_node = nodes[0]
                            node_data = first_node.get('data', {})
                            self.status = node_data.get('name') or node_data.get('label') or 'Draft'
                        else:
                            self.status = 'Draft'
                    else:
                        self.status = 'Draft'
                except Exception as e:
                    print(f"Error getting workflow initial status: {e}")
                    self.status = 'Draft'
            else:
                self.status = 'Draft'
        
        super().save(*args, **kwargs)

    def __str__(self):
        if self.custom_audit_type:
            return f'{self.reference_number} - {self.title} ({self.custom_audit_type.name})'
        return f'{self.reference_number} - {self.title} ({self.get_audit_type_display()})'

    class Meta:
        ordering = ['-created_at']
        verbose_name = _('Audit')
        verbose_name_plural = _('Audits')
