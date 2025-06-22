from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from roles.models import Role, Permission
from django.db import transaction

User = get_user_model()

class Command(BaseCommand):
    help = 'Populate the database with audit-related roles'

    def handle(self, *args, **options):
        # First, make sure we have a superuser
        try:
            superuser = User.objects.get(is_superuser=True)
        except User.DoesNotExist:
            superuser = User.objects.create_superuser(
                username='admin',
                email='admin@example.com',
                password='admin123'
            )
            self.stdout.write(self.style.SUCCESS('Created superuser: admin'))

        # Define roles with their permissions
        roles_data = [
            {
                'name': 'Chief Audit Executive',
                'description': 'Leads the internal audit function and has overall responsibility for audit activities',
                'severity': 'Critical',
                'status': 'Active',
                'permission_categories': ['Audit Planning', 'Audit Execution', 'Audit Reporting', 'Findings Management',
                                       'Follow-up Management', 'Risk Assessment', 'Analytics and Reporting', 'System Administration']
            },
            {
                'name': 'Audit Manager',
                'description': 'Manages audit engagements and supervises audit teams',
                'severity': 'High',
                'status': 'Active',
                'permission_categories': ['Audit Planning', 'Audit Execution', 'Audit Reporting', 'Findings Management',
                                       'Follow-up Management', 'Risk Assessment', 'Analytics and Reporting']
            },
            {
                'name': 'Senior Auditor',
                'description': 'Leads audit engagements and performs complex audit procedures',
                'severity': 'High',
                'status': 'Active',
                'permission_categories': ['Audit Planning', 'Audit Execution', 'Audit Reporting', 'Findings Management',
                                       'Follow-up Management', 'Risk Assessment']
            },
            {
                'name': 'Staff Auditor',
                'description': 'Performs audit procedures and assists in audit engagements',
                'severity': 'Medium',
                'status': 'Active',
                'permission_categories': ['Audit Execution', 'Findings Management', 'Document Management']
            },
            {
                'name': 'Quality Reviewer',
                'description': 'Reviews audit work and ensures compliance with standards',
                'severity': 'High',
                'status': 'Active',
                'permission_categories': ['Audit Reporting', 'Document Management', 'Analytics and Reporting']
            },
            {
                'name': 'Risk Specialist',
                'description': 'Focuses on risk assessment and analysis',
                'severity': 'Medium',
                'status': 'Active',
                'permission_categories': ['Risk Assessment', 'Analytics and Reporting']
            },
            {
                'name': 'Audit Coordinator',
                'description': 'Coordinates audit activities and manages documentation',
                'severity': 'Medium',
                'status': 'Active',
                'permission_categories': ['Document Management', 'Follow-up Management']
            },
            {
                'name': 'External Auditor',
                'description': 'External party with limited access to audit information',
                'severity': 'Low',
                'status': 'Active',
                'permission_categories': []  # Will get only view permissions
            }
        ]

        created_count = 0
        updated_count = 0

        with transaction.atomic():
            for role_data in roles_data:
                role, created = Role.objects.get_or_create(
                    name=role_data['name'],
                    defaults={
                        'description': role_data['description'],
                        'severity': role_data['severity'],
                        'status': role_data['status'],
                        'created_by': superuser
                    }
                )

                if created:
                    created_count += 1
                    self.stdout.write(f"Created role: {role.name}")
                else:
                    # Update existing role
                    role.description = role_data['description']
                    role.severity = role_data['severity']
                    role.status = role_data['status']
                    role.save()
                    updated_count += 1
                    self.stdout.write(f"Updated role: {role.name}")

                # Assign permissions based on categories
                permissions = []
                
                # For External Auditor role, only add view permissions
                if role.name == 'External Auditor':
                    permissions = Permission.objects.filter(name__startswith='View')
                else:
                    # For other roles, add all permissions from their categories
                    for category in role_data['permission_categories']:
                        category_permissions = Permission.objects.filter(category=category)
                        permissions.extend(category_permissions)

                # Set permissions
                role.permissions.set(permissions)
                self.stdout.write(f"Assigned {len(permissions)} permissions to {role.name}")

        self.stdout.write(
            self.style.SUCCESS(
                f'Successfully populated roles. Created: {created_count}, Updated: {updated_count}'
            )
        ) 