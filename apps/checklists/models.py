from django.db import models
from django.contrib.auth import get_user_model
from django.utils.translation import gettext_lazy as _
from django.core.exceptions import ValidationError
from apps.utils.models import SoftDeleteModel
import json

User = get_user_model()


class FieldType(models.TextChoices):
    """Field types for checklist form fields"""
    TEXT = 'text', _('Text')
    TEXTAREA = 'textarea', _('Textarea')
    NUMBER = 'number', _('Number')
    EMAIL = 'email', _('Email')
    URL = 'url', _('URL')
    DATE = 'date', _('Date')
    DATETIME = 'datetime', _('DateTime')
    CHECKBOX = 'checkbox', _('Checkbox')
    SELECT = 'select', _('Select')
    MULTI_SELECT = 'multi_select', _('Multi Select')
    RADIO = 'radio', _('Radio')
    FILE = 'file', _('File Upload')
    RATING = 'rating', _('Rating')
    SECTION = 'section', _('Section Header')


class ChecklistTemplate(SoftDeleteModel):
    """Template for creating checklists with custom form fields"""
    
    name = models.CharField(max_length=255, verbose_name=_('Template Name'))
    description = models.TextField(blank=True, verbose_name=_('Description'))
    category = models.CharField(max_length=100, blank=True, verbose_name=_('Category'))
    
    # Template status
    is_active = models.BooleanField(default=True, verbose_name=_('Is Active'))
    is_frozen = models.BooleanField(default=False, verbose_name=_('Is Frozen'))
    
    # Metadata
    created_by = models.ForeignKey(
        User,
        on_delete=models.PROTECT,
        related_name='created_checklist_templates',
        verbose_name=_('Created By')
    )
    frozen_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        related_name='frozen_checklist_templates',
        null=True,
        blank=True,
        verbose_name=_('Frozen By')
    )
    frozen_at = models.DateTimeField(null=True, blank=True, verbose_name=_('Frozen At'))
    
    # Usage tracking
    usage_count = models.PositiveIntegerField(default=0, verbose_name=_('Usage Count'))
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = _('Checklist Template')
        verbose_name_plural = _('Checklist Templates')
    
    def __str__(self):
        return self.name
    
    def save(self, *args, **kwargs):
        if self.is_frozen and not self.frozen_at:
            from django.utils import timezone
            self.frozen_at = timezone.now()
        super().save(*args, **kwargs)
    
    def freeze(self, user):
        """Freeze the template to prevent further modifications"""
        if not self.is_frozen:
            self.is_frozen = True
            self.frozen_by = user
            from django.utils import timezone
            self.frozen_at = timezone.now()
            self.save(update_fields=['is_frozen', 'frozen_by', 'frozen_at'])
    
    def unfreeze(self):
        """Unfreeze the template to allow modifications"""
        if self.is_frozen:
            self.is_frozen = False
            self.frozen_by = None
            self.frozen_at = None
            self.save(update_fields=['is_frozen', 'frozen_by', 'frozen_at'])
    
    def increment_usage(self):
        """Increment usage count when template is used"""
        self.usage_count += 1
        self.save(update_fields=['usage_count'])


class ChecklistField(SoftDeleteModel):
    """Individual field in a checklist template"""
    
    template = models.ForeignKey(
        ChecklistTemplate,
        on_delete=models.CASCADE,
        related_name='fields',
        verbose_name=_('Template')
    )
    
    # Field definition
    label = models.CharField(max_length=255, verbose_name=_('Field Label'))
    field_type = models.CharField(
        max_length=20,
        choices=FieldType.choices,
        verbose_name=_('Field Type')
    )
    help_text = models.TextField(blank=True, verbose_name=_('Help Text'))
    placeholder = models.CharField(max_length=255, blank=True, verbose_name=_('Placeholder'))
    
    # Field properties
    is_required = models.BooleanField(default=False, verbose_name=_('Is Required'))
    is_readonly = models.BooleanField(default=False, verbose_name=_('Is Readonly'))
    default_value = models.TextField(blank=True, verbose_name=_('Default Value'))
    
    # Field options (for select, radio, etc.)
    options = models.JSONField(
        default=list,
        blank=True,
        verbose_name=_('Field Options'),
        help_text=_('JSON array of options for select/radio fields')
    )
    
    # Validation rules
    min_length = models.PositiveIntegerField(null=True, blank=True, verbose_name=_('Min Length'))
    max_length = models.PositiveIntegerField(null=True, blank=True, verbose_name=_('Max Length'))
    min_value = models.DecimalField(
        max_digits=10, decimal_places=2, null=True, blank=True, verbose_name=_('Min Value')
    )
    max_value = models.DecimalField(
        max_digits=10, decimal_places=2, null=True, blank=True, verbose_name=_('Max Value')
    )
    
    # Field ordering and layout
    order = models.PositiveIntegerField(default=0, verbose_name=_('Order'))
    css_class = models.CharField(max_length=255, blank=True, verbose_name=_('CSS Class'))
    
    # Conditional logic
    conditional_logic = models.JSONField(
        default=dict,
        blank=True,
        verbose_name=_('Conditional Logic'),
        help_text=_('JSON object defining when this field should be shown/hidden')
    )
    
    class Meta:
        ordering = ['order', 'created_at']
        verbose_name = _('Checklist Field')
        verbose_name_plural = _('Checklist Fields')
    
    def __str__(self):
        return f"{self.template.name} - {self.label}"
    
    def clean(self):
        # Validate options for select/radio fields
        if self.field_type in [FieldType.SELECT, FieldType.MULTI_SELECT, FieldType.RADIO]:
            if not self.options:
                raise ValidationError(_('Options are required for select/radio fields'))
            if not isinstance(self.options, list):
                raise ValidationError(_('Options must be a list'))


class Checklist(SoftDeleteModel):
    """Individual checklist instance created from a template"""
    
    template = models.ForeignKey(
        ChecklistTemplate,
        on_delete=models.PROTECT,
        related_name='checklists',
        verbose_name=_('Template')
    )
    
    # Checklist metadata
    name = models.CharField(max_length=255, verbose_name=_('Checklist Name'))
    description = models.TextField(blank=True, verbose_name=_('Description'))
    
    # Status tracking
    STATUS_CHOICES = [
        ('draft', _('Draft')),
        ('in_progress', _('In Progress')),
        ('completed', _('Completed')),
        ('cancelled', _('Cancelled')),
        ('on_hold', _('On Hold')),
    ]
    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default='draft',
        verbose_name=_('Status')
    )
    
    # Assignment and permissions
    assigned_to = models.ForeignKey(
        User,
        on_delete=models.PROTECT,
        related_name='assigned_checklists',
        verbose_name=_('Assigned To')
    )
    created_by = models.ForeignKey(
        User,
        on_delete=models.PROTECT,
        related_name='created_checklists',
        verbose_name=_('Created By')
    )
    
    # Dates
    due_date = models.DateTimeField(null=True, blank=True, verbose_name=_('Due Date'))
    completed_at = models.DateTimeField(null=True, blank=True, verbose_name=_('Completed At'))
    
    # Progress tracking
    total_fields = models.PositiveIntegerField(default=0, verbose_name=_('Total Fields'))
    completed_fields = models.PositiveIntegerField(default=0, verbose_name=_('Completed Fields'))
    completion_percentage = models.DecimalField(
        max_digits=5, decimal_places=2, default=0, verbose_name=_('Completion Percentage')
    )
    
    # Additional metadata
    tags = models.JSONField(default=list, blank=True, verbose_name=_('Tags'))
    priority = models.CharField(
        max_length=20,
        choices=[
            ('low', _('Low')),
            ('medium', _('Medium')),
            ('high', _('High')),
            ('urgent', _('Urgent')),
        ],
        default='medium',
        verbose_name=_('Priority')
    )
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = _('Checklist')
        verbose_name_plural = _('Checklists')
    
    def __str__(self):
        return self.name
    
    def save(self, *args, **kwargs):
        # Calculate completion percentage
        if self.total_fields > 0:
            self.completion_percentage = (self.completed_fields / self.total_fields) * 100
        else:
            self.completion_percentage = 0
        
        # Set completed_at if status is completed
        if self.status == 'completed' and not self.completed_at:
            from django.utils import timezone
            self.completed_at = timezone.now()
        elif self.status != 'completed':
            self.completed_at = None
        
        super().save(*args, **kwargs)
    
    def update_progress(self):
        """Update progress based on completed responses"""
        total = self.responses.count()
        completed = self.responses.filter(is_completed=True).count()
        
        self.total_fields = total
        self.completed_fields = completed
        self.save(update_fields=['total_fields', 'completed_fields', 'completion_percentage'])
    
    def get_progress_percentage(self):
        """Get completion percentage as integer"""
        return int(self.completion_percentage)


class ChecklistResponse(SoftDeleteModel):
    """User response to a checklist field"""
    
    checklist = models.ForeignKey(
        Checklist,
        on_delete=models.CASCADE,
        related_name='responses',
        verbose_name=_('Checklist')
    )
    field = models.ForeignKey(
        ChecklistField,
        on_delete=models.CASCADE,
        related_name='responses',
        verbose_name=_('Field')
    )
    
    # Response data
    value = models.JSONField(
        default=dict,
        verbose_name=_('Response Value'),
        help_text=_('JSON object containing the field response')
    )
    
    # Response metadata
    is_completed = models.BooleanField(default=False, verbose_name=_('Is Completed'))
    responded_by = models.ForeignKey(
        User,
        on_delete=models.PROTECT,
        related_name='checklist_responses',
        verbose_name=_('Responded By'),
        null=True,
        blank=True
    )
    responded_at = models.DateTimeField(null=True, blank=True, verbose_name=_('Responded At'))
    
    # Comments and notes
    comments = models.TextField(blank=True, verbose_name=_('Comments'))
    internal_notes = models.TextField(blank=True, verbose_name=_('Internal Notes'))
    
    class Meta:
        unique_together = ['checklist', 'field']
        ordering = ['field__order', 'created_at']
        verbose_name = _('Checklist Response')
        verbose_name_plural = _('Checklist Responses')
    
    def __str__(self):
        return f"{self.checklist.name} - {self.field.label}"
    
    def save(self, *args, **kwargs):
        # Set responded_at if is_completed is True
        if self.is_completed and not self.responded_at:
            from django.utils import timezone
            self.responded_at = timezone.now()
        elif not self.is_completed:
            self.responded_at = None
        
        super().save(*args, **kwargs)
        
        # Update checklist progress
        self.checklist.update_progress()


class ChecklistComment(SoftDeleteModel):
    """Comments on checklists"""
    
    checklist = models.ForeignKey(
        Checklist,
        on_delete=models.CASCADE,
        related_name='comments',
        verbose_name=_('Checklist')
    )
    author = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='checklist_comments',
        verbose_name=_('Author')
    )
    
    content = models.TextField(verbose_name=_('Content'))
    is_internal = models.BooleanField(default=False, verbose_name=_('Is Internal'))
    
    # Reply functionality
    parent = models.ForeignKey(
        'self',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='replies',
        verbose_name=_('Parent Comment')
    )
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = _('Checklist Comment')
        verbose_name_plural = _('Checklist Comments')
    
    def __str__(self):
        return f"{self.checklist.name} - {self.author.username}"


class ChecklistAttachment(SoftDeleteModel):
    """File attachments for checklists"""
    
    checklist = models.ForeignKey(
        Checklist,
        on_delete=models.CASCADE,
        related_name='attachments',
        verbose_name=_('Checklist')
    )
    
    file = models.FileField(
        upload_to='checklist_attachments/',
        verbose_name=_('File')
    )
    original_name = models.CharField(max_length=255, verbose_name=_('Original Name'))
    description = models.TextField(blank=True, verbose_name=_('Description'))
    file_size = models.PositiveIntegerField(verbose_name=_('File Size'))
    mime_type = models.CharField(max_length=100, blank=True, verbose_name=_('MIME Type'))
    
    uploaded_by = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='checklist_attachments',
        verbose_name=_('Uploaded By')
    )
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = _('Checklist Attachment')
        verbose_name_plural = _('Checklist Attachments')
    
    def __str__(self):
        return f"{self.checklist.name} - {self.original_name}"
