from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from apps.checklists.models import ChecklistTemplate, ChecklistField, Checklist, ChecklistResponse
from apps.audits.models import Audit, AuditTask

User = get_user_model()


class Command(BaseCommand):
    help = 'Create test checklist data for testing form functionality'

    def handle(self, *args, **options):
        # Get or create a test user
        user, created = User.objects.get_or_create(
            username='testuser',
            defaults={
                'email': 'test@example.com',
                'first_name': 'Test',
                'last_name': 'User'
            }
        )
        if created:
            user.set_password('testpass123')
            user.save()
            self.stdout.write(f'Created test user: {user.username}')
        else:
            self.stdout.write(f'Test user already exists: {user.username}')

        # Create a test checklist template
        template, created = ChecklistTemplate.objects.get_or_create(
            name='Test Form Template',
            defaults={
                'description': 'A test template with various field types',
                'category': 'Testing',
                'created_by': user
            }
        )
        if created:
            self.stdout.write(f'Created test template: {template.name}')

            # Create various field types
            fields_data = [
                {
                    'label': 'Text Field',
                    'field_type': 'text',
                    'help_text': 'Enter some text',
                    'is_required': True,
                    'order': 1
                },
                {
                    'label': 'Rating Field',
                    'field_type': 'rating',
                    'help_text': 'Rate from 1 to 5 stars',
                    'is_required': True,
                    'order': 2
                },
                {
                    'label': 'Select Field',
                    'field_type': 'select',
                    'help_text': 'Choose an option',
                    'options': ['Option 1', 'Option 2', 'Option 3'],
                    'is_required': True,
                    'order': 3
                },
                {
                    'label': 'Checkbox Field',
                    'field_type': 'checkbox',
                    'help_text': 'Select multiple options',
                    'options': ['Choice A', 'Choice B', 'Choice C'],
                    'is_required': False,
                    'order': 4
                },
                {
                    'label': 'Boolean Field',
                    'field_type': 'boolean',
                    'help_text': 'Yes or No question',
                    'is_required': True,
                    'order': 5
                },
                {
                    'label': 'Number Field',
                    'field_type': 'number',
                    'help_text': 'Enter a number',
                    'is_required': False,
                    'order': 6
                }
            ]

            for field_data in fields_data:
                ChecklistField.objects.create(template=template, **field_data)

            self.stdout.write(f'Created {len(fields_data)} fields for template')
        else:
            self.stdout.write(f'Test template already exists: {template.name}')

        self.stdout.write(
            self.style.SUCCESS(
                f'Test template ready!\n'
                f'Template ID: {template.id}\n'
                f'User: {user.username}'
            )
        )
