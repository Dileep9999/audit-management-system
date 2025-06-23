from django.core.management.base import BaseCommand
from apps.checklists.models import ChecklistTemplate, ChecklistField


class Command(BaseCommand):
    help = 'Create default checklist templates for common audit types'

    def handle(self, *args, **options):
        self.stdout.write('Creating default audit templates...')
        
        # Financial Audit Template
        financial_template = ChecklistTemplate.objects.get_or_create(
            name="Financial Audit Checklist",
            defaults={
                'description': 'Comprehensive financial audit checklist covering all major financial controls and compliance requirements.',
                'category': 'Financial',
                'is_frozen': False,
                'created_by_id': 1  # Assuming admin user exists
            }
        )[0]
        
        financial_fields = [
            {
                'label': 'Audit Period Start Date',
                'field_type': 'date',
                'help_text': 'Select the start date of the audit period',
                'is_required': True,
                'order': 1
            },
            {
                'label': 'Revenue Recognition Compliance',
                'field_type': 'radio',
                'options': ['Fully Compliant', 'Minor Issues', 'Major Issues', 'Non-Compliant'],
                'is_required': True,
                'order': 2
            },
            {
                'label': 'Cash Reconciliation Complete',
                'field_type': 'checkbox',
                'help_text': 'Check if all cash accounts are properly reconciled',
                'is_required': True,
                'order': 3
            },
            {
                'label': 'Accounts Receivable Balance ($)',
                'field_type': 'number',
                'help_text': 'Enter the total accounts receivable balance',
                'is_required': True,
                'order': 4
            },
            {
                'label': 'Inventory Valuation Method',
                'field_type': 'select',
                'options': ['FIFO', 'LIFO', 'Weighted Average', 'Specific Identification'],
                'is_required': True,
                'order': 5
            },
            {
                'label': 'Internal Controls Effectiveness (1-5)',
                'field_type': 'rating',
                'help_text': 'Rate the effectiveness of financial internal controls',
                'is_required': True,
                'order': 6
            },
            {
                'label': 'Supporting Financial Documents',
                'field_type': 'file',
                'help_text': 'Upload relevant financial statements and supporting documents',
                'is_required': False,
                'order': 7
            },
            {
                'label': 'Key Audit Findings',
                'field_type': 'textarea',
                'help_text': 'Describe any significant findings or concerns',
                'is_required': False,
                'order': 8
            }
        ]
        
        self.create_fields(financial_template, financial_fields)
        
        # IT Security Audit Template
        it_security_template = ChecklistTemplate.objects.get_or_create(
            name="IT Security Audit Checklist",
            defaults={
                'description': 'Comprehensive IT security audit covering cybersecurity controls, data protection, and compliance.',
                'category': 'IT Security',
                'is_frozen': False,
                'created_by_id': 1
            }
        )[0]
        
        it_security_fields = [
            {
                'label': 'Security Policies Reviewed and Updated',
                'field_type': 'checkbox',
                'help_text': 'Check if security policies have been reviewed and updated',
                'is_required': True,
                'order': 1
            },
            {
                'label': 'Access Control Effectiveness (1-5)',
                'field_type': 'rating',
                'help_text': 'Rate the effectiveness of user access controls',
                'is_required': True,
                'order': 2
            },
            {
                'label': 'Password Policy Compliance',
                'field_type': 'radio',
                'options': ['Fully Compliant', 'Partially Compliant', 'Non-Compliant'],
                'is_required': True,
                'order': 3
            },
            {
                'label': 'Data Backup Frequency',
                'field_type': 'select',
                'options': ['Daily', 'Weekly', 'Monthly', 'Irregular', 'No Backups'],
                'is_required': True,
                'order': 4
            },
            {
                'label': 'Last Vulnerability Scan Date',
                'field_type': 'date',
                'help_text': 'Enter the date of the last vulnerability scan',
                'is_required': True,
                'order': 5
            },
            {
                'label': 'Security Incidents (Last 12 Months)',
                'field_type': 'number',
                'help_text': 'Number of security incidents in the past year',
                'is_required': True,
                'order': 6
            },
            {
                'label': 'Compliance Certificates',
                'field_type': 'file',
                'help_text': 'Upload relevant security compliance certificates',
                'is_required': False,
                'order': 7
            },
            {
                'label': 'Security Recommendations',
                'field_type': 'textarea',
                'help_text': 'List recommended security improvements',
                'is_required': False,
                'order': 8
            }
        ]
        
        self.create_fields(it_security_template, it_security_fields)
        
        # Compliance Audit Template
        compliance_template = ChecklistTemplate.objects.get_or_create(
            name="Regulatory Compliance Audit",
            defaults={
                'description': 'General regulatory compliance audit template for various industry standards and regulations.',
                'category': 'Compliance',
                'is_frozen': False,
                'created_by_id': 1
            }
        )[0]
        
        compliance_fields = [
            {
                'label': 'Primary Regulation/Standard',
                'field_type': 'select',
                'options': ['SOX', 'GDPR', 'HIPAA', 'PCI-DSS', 'ISO 27001', 'Other'],
                'is_required': True,
                'order': 1
            },
            {
                'label': 'Compliance Officer Name',
                'field_type': 'text',
                'help_text': 'Enter the name of the compliance officer',
                'is_required': True,
                'order': 2
            },
            {
                'label': 'Previous Audit Date',
                'field_type': 'date',
                'help_text': 'Enter the date of the previous audit',
                'is_required': False,
                'order': 3
            },
            {
                'label': 'Policy Adherence Level (1-5)',
                'field_type': 'rating',
                'help_text': 'Rate overall adherence to compliance policies',
                'is_required': True,
                'order': 4
            },
            {
                'label': 'Staff Compliance Training Completed',
                'field_type': 'checkbox',
                'help_text': 'Check if staff compliance training has been completed',
                'is_required': True,
                'order': 5
            },
            {
                'label': 'Documentation Quality',
                'field_type': 'radio',
                'options': ['Excellent', 'Good', 'Fair', 'Poor'],
                'is_required': True,
                'order': 6
            },
            {
                'label': 'Compliance Evidence',
                'field_type': 'file',
                'help_text': 'Upload supporting compliance documentation',
                'is_required': False,
                'order': 7
            },
            {
                'label': 'Compliance Action Items',
                'field_type': 'textarea',
                'help_text': 'List required actions to maintain or improve compliance',
                'is_required': False,
                'order': 8
            }
        ]
        
        self.create_fields(compliance_template, compliance_fields)
        
        # Operational Audit Template
        operational_template = ChecklistTemplate.objects.get_or_create(
            name="Operational Efficiency Audit",
            defaults={
                'description': 'Operational audit template focusing on process efficiency, resource utilization, and performance metrics.',
                'category': 'Operations',
                'is_frozen': False,
                'created_by_id': 1
            }
        )[0]
        
        operational_fields = [
            {
                'label': 'Department/Process Being Audited',
                'field_type': 'text',
                'help_text': 'Enter the name of the department or process being audited',
                'is_required': True,
                'order': 1
            },
            {
                'label': 'Process Efficiency Rating (1-5)',
                'field_type': 'rating',
                'help_text': 'Rate the overall efficiency of the process',
                'is_required': True,
                'order': 2
            },
            {
                'label': 'Resource Utilization (%)',
                'field_type': 'number',
                'help_text': 'Enter percentage of resource utilization',
                'is_required': True,
                'order': 3
            },
            {
                'label': 'KPI Targets Met',
                'field_type': 'checkbox',
                'help_text': 'Check if key performance indicators are meeting targets',
                'is_required': True,
                'order': 4
            },
            {
                'label': 'Process Documentation Status',
                'field_type': 'radio',
                'options': ['Complete and Current', 'Partially Complete', 'Outdated', 'Missing'],
                'is_required': True,
                'order': 5
            },
            {
                'label': 'Automation Opportunities',
                'field_type': 'select',
                'options': ['High Potential', 'Medium Potential', 'Low Potential', 'Already Automated'],
                'is_required': True,
                'order': 6
            },
            {
                'label': 'Process Documentation',
                'field_type': 'file',
                'help_text': 'Upload current process documentation or flowchart',
                'is_required': False,
                'order': 7
            },
            {
                'label': 'Process Improvement Recommendations',
                'field_type': 'textarea',
                'help_text': 'Recommend specific improvements for operational efficiency',
                'is_required': False,
                'order': 8
            }
        ]
        
        self.create_fields(operational_template, operational_fields)
        
        self.stdout.write(
            self.style.SUCCESS(
                f'Successfully created default templates. Total templates: {ChecklistTemplate.objects.count()}'
            )
        )

    def create_fields(self, template, fields_data):
        """Helper method to create fields for a template"""
        for field_data in fields_data:
            ChecklistField.objects.get_or_create(
                template=template,
                label=field_data['label'],
                defaults=field_data
            ) 