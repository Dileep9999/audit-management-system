from django.db import models
from django.utils.translation import gettext_lazy as _
from apps.user.models import User
from apps.utils.models import SoftDeleteModel

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

    def get_task_progress(self):
        """Get overall task completion progress for this audit"""
        tasks = self.audit_tasks.all()
        if not tasks:
            return {'total': 0, 'completed': 0, 'percentage': 0}
        
        total_tasks = tasks.count()
        completed_tasks = tasks.filter(checklist__status='completed').count()
        percentage = (completed_tasks / total_tasks) * 100 if total_tasks > 0 else 0
        
        return {
            'total': total_tasks,
            'completed': completed_tasks,
            'percentage': round(percentage, 2)
        }

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


class AuditTask(models.Model):
    """
    Links audits with checklists to create audit-specific tasks
    """
    TASK_STATUS_CHOICES = [
        ('pending', _('Pending')),
        ('in_progress', _('In Progress')),
        ('completed', _('Completed')),
        ('cancelled', _('Cancelled')),
        ('on_hold', _('On Hold')),
    ]
    
    TASK_PRIORITY_CHOICES = [
        ('low', _('Low')),
        ('medium', _('Medium')),
        ('high', _('High')),
        ('critical', _('Critical')),
    ]

    audit = models.ForeignKey(
        Audit,
        on_delete=models.CASCADE,
        related_name='audit_tasks',
        verbose_name=_('Audit')
    )
    checklist = models.OneToOneField(
        'checklists.Checklist',
        on_delete=models.CASCADE,
        related_name='audit_task',
        verbose_name=_('Checklist')
    )
    
    # Task-specific metadata
    task_name = models.CharField(max_length=255, verbose_name=_('Task Name'))
    description = models.TextField(blank=True, verbose_name=_('Description'))
    
    # Assignment and scheduling
    assigned_to = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='assigned_audit_tasks',
        verbose_name=_('Assigned To')
    )
    due_date = models.DateTimeField(null=True, blank=True, verbose_name=_('Due Date'))
    
    # Status tracking
    priority = models.CharField(
        max_length=20,
        choices=TASK_PRIORITY_CHOICES,
        default='medium',
        verbose_name=_('Priority')
    )
    
    # Audit-specific fields
    control_area = models.CharField(
        max_length=255,
        blank=True,
        verbose_name=_('Control Area'),
        help_text=_('Specific area of audit control this task addresses')
    )
    risk_level = models.CharField(
        max_length=20,
        choices=[
            ('low', _('Low Risk')),
            ('medium', _('Medium Risk')),
            ('high', _('High Risk')),
            ('critical', _('Critical Risk')),
        ],
        default='medium',
        verbose_name=_('Risk Level')
    )
    
    # Metadata
    created_by = models.ForeignKey(
        User,
        on_delete=models.PROTECT,
        related_name='created_audit_tasks',
        verbose_name=_('Created By')
    )
    created_at = models.DateTimeField(auto_now_add=True, verbose_name=_('Created At'))
    updated_at = models.DateTimeField(auto_now=True, verbose_name=_('Updated At'))
    
    # Completion tracking
    completed_at = models.DateTimeField(null=True, blank=True, verbose_name=_('Completed At'))
    completion_notes = models.TextField(blank=True, verbose_name=_('Completion Notes'))

    class Meta:
        ordering = ['-created_at']
        verbose_name = _('Audit Task')
        verbose_name_plural = _('Audit Tasks')
        unique_together = ['audit', 'checklist']

    def __str__(self):
        return f"{self.audit.reference_number} - {self.task_name}"

    def save(self, *args, **kwargs):
        # Sync status with checklist
        if self.checklist_id:
            try:
                from apps.checklists.models import Checklist
                checklist = Checklist.objects.get(id=self.checklist_id)
                
                # Update completion status based on checklist
                if checklist.status == 'completed' and not self.completed_at:
                    from django.utils import timezone
                    self.completed_at = timezone.now()
                elif checklist.status != 'completed':
                    self.completed_at = None
            except:
                pass  # Handle case where checklist doesn't exist yet
        
        super().save(*args, **kwargs)

    def get_task_status(self):
        """Get task status based on checklist status"""
        if not self.checklist:
            return 'pending'
        
        status_mapping = {
            'draft': 'pending',
            'in_progress': 'in_progress',
            'completed': 'completed',
            'cancelled': 'cancelled',
            'on_hold': 'on_hold'
        }
        
        return status_mapping.get(self.checklist.status, 'pending')
    
    def get_completion_percentage(self):
        """Get completion percentage from linked checklist"""
        if self.checklist:
            return self.checklist.get_progress_percentage()
        return 0


class AuditEvidence(models.Model):
    """
    Evidence collected during audit tasks
    """
    audit_task = models.ForeignKey(
        AuditTask,
        on_delete=models.CASCADE,
        related_name='evidence',
        verbose_name=_('Audit Task')
    )
    
    # Optional field association for field-specific evidence
    checklist_field = models.ForeignKey(
        'checklists.ChecklistField',
        on_delete=models.CASCADE,
        related_name='evidence',
        null=True,
        blank=True,
        verbose_name=_('Checklist Field'),
        help_text=_('Associate evidence with a specific checklist field')
    )
    
    title = models.CharField(max_length=255, verbose_name=_('Evidence Title'))
    description = models.TextField(blank=True, verbose_name=_('Description'))
    
    # Evidence file
    file = models.FileField(
        upload_to='audit_evidence/',
        verbose_name=_('Evidence File'),
        null=True,
        blank=True
    )
    
    # Evidence metadata
    evidence_type = models.CharField(
        max_length=50,
        choices=[
            ('document', _('Document')),
            ('screenshot', _('Screenshot')),
            ('photo', _('Photo')),
            ('video', _('Video')),
            ('report', _('Report')),
            ('other', _('Other')),
        ],
        default='document',
        verbose_name=_('Evidence Type')
    )
    
    # Collection info
    collected_by = models.ForeignKey(
        User,
        on_delete=models.PROTECT,
        related_name='collected_evidence',
        verbose_name=_('Collected By')
    )
    collected_at = models.DateTimeField(auto_now_add=True, verbose_name=_('Collected At'))
    
    # Verification
    is_verified = models.BooleanField(default=False, verbose_name=_('Is Verified'))
    verified_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='verified_evidence',
        verbose_name=_('Verified By')
    )
    verified_at = models.DateTimeField(null=True, blank=True, verbose_name=_('Verified At'))

    class Meta:
        ordering = ['-collected_at']
        verbose_name = _('Audit Evidence')
        verbose_name_plural = _('Audit Evidence')

    def __str__(self):
        return f"{self.audit_task.task_name} - {self.title}"


class AuditReview(SoftDeleteModel):
    """Review workflow for audit tasks and evidence"""
    
    REVIEW_STATUS_CHOICES = [
        ('pending', _('Pending Review')),
        ('in_review', _('In Review')),
        ('approved', _('Approved')),
        ('rejected', _('Rejected')),
        ('needs_revision', _('Needs Revision')),
    ]
    
    REVIEW_TYPE_CHOICES = [
        ('task', _('Task Review')),
        ('evidence', _('Evidence Review')),
        ('final', _('Final Audit Review')),
    ]
    
    # What is being reviewed
    audit_task = models.ForeignKey(
        'AuditTask',
        on_delete=models.CASCADE,
        related_name='reviews',
        null=True,
        blank=True,
        verbose_name=_('Audit Task')
    )
    audit_evidence = models.ForeignKey(
        'AuditEvidence',
        on_delete=models.CASCADE,
        related_name='reviews',
        null=True,
        blank=True,
        verbose_name=_('Audit Evidence')
    )
    audit = models.ForeignKey(
        'Audit',
        on_delete=models.CASCADE,
        related_name='reviews',
        null=True,
        blank=True,
        verbose_name=_('Audit')
    )
    
    # Review details
    review_type = models.CharField(
        max_length=20,
        choices=REVIEW_TYPE_CHOICES,
        verbose_name=_('Review Type')
    )
    status = models.CharField(
        max_length=20,
        choices=REVIEW_STATUS_CHOICES,
        default='pending',
        verbose_name=_('Review Status')
    )
    
    # Review participants
    reviewer = models.ForeignKey(
        User,
        on_delete=models.PROTECT,
        related_name='audit_reviews',
        verbose_name=_('Reviewer')
    )
    requested_by = models.ForeignKey(
        User,
        on_delete=models.PROTECT,
        related_name='requested_reviews',
        verbose_name=_('Requested By')
    )
    
    # Review content
    comments = models.TextField(
        blank=True,
        verbose_name=_('Review Comments')
    )
    internal_notes = models.TextField(
        blank=True,
        verbose_name=_('Internal Notes')
    )
    
    # Review timeline
    requested_at = models.DateTimeField(
        auto_now_add=True,
        verbose_name=_('Requested At')
    )
    due_date = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name=_('Review Due Date')
    )
    reviewed_at = models.DateTimeField(
        null=True,
        blank=True,
        verbose_name=_('Reviewed At')
    )
    
    # Review criteria and scoring
    review_criteria = models.JSONField(
        default=dict,
        blank=True,
        verbose_name=_('Review Criteria'),
        help_text=_('JSON object containing review criteria and scores')
    )
    overall_score = models.DecimalField(
        max_digits=3,
        decimal_places=1,
        null=True,
        blank=True,
        verbose_name=_('Overall Score'),
        help_text=_('Score out of 10')
    )
    
    # Approval workflow
    approval_level = models.PositiveIntegerField(
        default=1,
        verbose_name=_('Approval Level'),
        help_text=_('Level in approval hierarchy')
    )
    is_final_approval = models.BooleanField(
        default=False,
        verbose_name=_('Is Final Approval')
    )
    
    class Meta:
        ordering = ['-requested_at']
        verbose_name = _('Audit Review')
        verbose_name_plural = _('Audit Reviews')
    
    def __str__(self):
        item = self.audit_task or self.audit_evidence or self.audit
        return f"Review of {item} by {self.reviewer.get_full_name()}"
    
    def save(self, *args, **kwargs):
        if self.status in ['approved', 'rejected'] and not self.reviewed_at:
            from django.utils import timezone
            self.reviewed_at = timezone.now()
        super().save(*args, **kwargs)
    
    def approve(self, comments=''):
        """Approve the review"""
        self.status = 'approved'
        if comments:
            self.comments = comments
        from django.utils import timezone
        self.reviewed_at = timezone.now()
        self.save()
        
        # Update the related item status
        self._update_item_status()
    
    def reject(self, comments=''):
        """Reject the review"""
        self.status = 'rejected'
        if comments:
            self.comments = comments
        from django.utils import timezone
        self.reviewed_at = timezone.now()
        self.save()
        
        # Update the related item status
        self._update_item_status()
    
    def request_revision(self, comments=''):
        """Request revision"""
        self.status = 'needs_revision'
        if comments:
            self.comments = comments
        from django.utils import timezone
        self.reviewed_at = timezone.now()
        self.save()
        
        # Update the related item status
        self._update_item_status()
    
    def _update_item_status(self):
        """Update the status of the related item based on review outcome"""
        if self.audit_task:
            if self.status == 'approved':
                self.audit_task.task_status = 'completed'
            elif self.status == 'rejected':
                self.audit_task.task_status = 'cancelled'
            elif self.status == 'needs_revision':
                self.audit_task.task_status = 'in_progress'
            self.audit_task.save()
        
        elif self.audit_evidence:
            if self.status == 'approved':
                self.audit_evidence.verification_status = 'verified'
            elif self.status == 'rejected':
                self.audit_evidence.verification_status = 'rejected'
            elif self.status == 'needs_revision':
                self.audit_evidence.verification_status = 'needs_revision'
            self.audit_evidence.save()


class ReviewComment(SoftDeleteModel):
    """Comments on reviews for discussion"""
    
    review = models.ForeignKey(
        AuditReview,
        on_delete=models.CASCADE,
        related_name='review_comments',
        verbose_name=_('Review')
    )
    author = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='review_comments',
        verbose_name=_('Author')
    )
    
    content = models.TextField(verbose_name=_('Content'))
    is_internal = models.BooleanField(
        default=False,
        verbose_name=_('Is Internal'),
        help_text=_('Internal comments only visible to reviewers')
    )
    
    # Reply functionality
    parent = models.ForeignKey(
        'self',
        on_delete=models.CASCADE,
        related_name='replies',
        null=True,
        blank=True,
        verbose_name=_('Parent Comment')
    )
    
    class Meta:
        ordering = ['created_at']
        verbose_name = _('Review Comment')
        verbose_name_plural = _('Review Comments')
    
    def __str__(self):
        return f"Comment by {self.author.get_full_name()} on {self.review}"


class ReviewTemplate(SoftDeleteModel):
    """Templates for review criteria and scoring"""
    
    name = models.CharField(
        max_length=255,
        verbose_name=_('Template Name')
    )
    description = models.TextField(
        blank=True,
        verbose_name=_('Description')
    )
    
    # Template criteria
    criteria = models.JSONField(
        default=list,
        verbose_name=_('Review Criteria'),
        help_text=_('JSON array of criteria objects with name, description, weight, and scoring options')
    )
    
    # Template settings
    is_active = models.BooleanField(
        default=True,
        verbose_name=_('Is Active')
    )
    review_type = models.CharField(
        max_length=20,
        choices=AuditReview.REVIEW_TYPE_CHOICES,
        verbose_name=_('Review Type')
    )
    
    # Usage tracking
    usage_count = models.PositiveIntegerField(
        default=0,
        verbose_name=_('Usage Count')
    )
    
    created_by = models.ForeignKey(
        User,
        on_delete=models.PROTECT,
        related_name='created_review_templates',
        verbose_name=_('Created By')
    )
    
    class Meta:
        ordering = ['name']
        verbose_name = _('Review Template')
        verbose_name_plural = _('Review Templates')
    
    def __str__(self):
        return self.name
    
    def increment_usage(self):
        """Increment usage count when template is used"""
        self.usage_count += 1
        self.save(update_fields=['usage_count'])
