from django.core.management.base import BaseCommand
from roles.models import Permission


class Command(BaseCommand):
    help = 'Populate the database with audit-related permissions'

    def handle(self, *args, **options):
        permissions_data = [
            # Audit Planning
            {'name': 'Create audit plan', 'category': 'Audit Planning', 'description': 'Ability to create new audit plans'},
            {'name': 'Edit audit plan', 'category': 'Audit Planning', 'description': 'Ability to modify existing audit plans'},
            {'name': 'Delete audit plan', 'category': 'Audit Planning', 'description': 'Ability to delete audit plans'},
            {'name': 'View audit plan', 'category': 'Audit Planning', 'description': 'Ability to view audit plans'},
            {'name': 'Approve audit plan', 'category': 'Audit Planning', 'description': 'Ability to approve audit plans'},
            {'name': 'Schedule audit', 'category': 'Audit Planning', 'description': 'Ability to schedule audits'},

            # Audit Execution
            {'name': 'Create audit checklist', 'category': 'Audit Execution', 'description': 'Ability to create audit checklists'},
            {'name': 'Edit audit checklist', 'category': 'Audit Execution', 'description': 'Ability to modify audit checklists'},
            {'name': 'Delete audit checklist', 'category': 'Audit Execution', 'description': 'Ability to delete audit checklists'},
            {'name': 'View audit checklist', 'category': 'Audit Execution', 'description': 'Ability to view audit checklists'},
            {'name': 'Conduct audit', 'category': 'Audit Execution', 'description': 'Ability to perform audit activities'},
            {'name': 'Record findings', 'category': 'Audit Execution', 'description': 'Ability to record audit findings'},
            {'name': 'Collect evidence', 'category': 'Audit Execution', 'description': 'Ability to collect and upload audit evidence'},

            # Audit Reporting
            {'name': 'Create audit report', 'category': 'Audit Reporting', 'description': 'Ability to create audit reports'},
            {'name': 'Edit audit report', 'category': 'Audit Reporting', 'description': 'Ability to modify audit reports'},
            {'name': 'Delete audit report', 'category': 'Audit Reporting', 'description': 'Ability to delete audit reports'},
            {'name': 'View audit report', 'category': 'Audit Reporting', 'description': 'Ability to view audit reports'},
            {'name': 'Generate draft report', 'category': 'Audit Reporting', 'description': 'Ability to generate draft audit reports'},
            {'name': 'Review audit report', 'category': 'Audit Reporting', 'description': 'Ability to review audit reports'},
            {'name': 'Approve audit report', 'category': 'Audit Reporting', 'description': 'Ability to approve audit reports'},
            {'name': 'Export audit report', 'category': 'Audit Reporting', 'description': 'Ability to export audit reports'},

            # Findings Management
            {'name': 'Create finding', 'category': 'Findings Management', 'description': 'Ability to create audit findings'},
            {'name': 'Edit finding', 'category': 'Findings Management', 'description': 'Ability to modify audit findings'},
            {'name': 'Delete finding', 'category': 'Findings Management', 'description': 'Ability to delete audit findings'},
            {'name': 'View finding', 'category': 'Findings Management', 'description': 'Ability to view audit findings'},
            {'name': 'Categorize finding', 'category': 'Findings Management', 'description': 'Ability to categorize audit findings'},
            {'name': 'Assign finding', 'category': 'Findings Management', 'description': 'Ability to assign findings to responsible parties'},
            {'name': 'Track finding status', 'category': 'Findings Management', 'description': 'Ability to track finding status'},

            # Follow-up Management
            {'name': 'Create follow-up', 'category': 'Follow-up Management', 'description': 'Ability to create follow-up tasks'},
            {'name': 'Edit follow-up', 'category': 'Follow-up Management', 'description': 'Ability to modify follow-up tasks'},
            {'name': 'Delete follow-up', 'category': 'Follow-up Management', 'description': 'Ability to delete follow-up tasks'},
            {'name': 'View follow-up', 'category': 'Follow-up Management', 'description': 'Ability to view follow-up tasks'},
            {'name': 'Track remediation', 'category': 'Follow-up Management', 'description': 'Ability to track remediation progress'},
            {'name': 'Verify remediation', 'category': 'Follow-up Management', 'description': 'Ability to verify completed remediation'},

            # Risk Assessment
            {'name': 'Create risk assessment', 'category': 'Risk Assessment', 'description': 'Ability to create risk assessments'},
            {'name': 'Edit risk assessment', 'category': 'Risk Assessment', 'description': 'Ability to modify risk assessments'},
            {'name': 'Delete risk assessment', 'category': 'Risk Assessment', 'description': 'Ability to delete risk assessments'},
            {'name': 'View risk assessment', 'category': 'Risk Assessment', 'description': 'Ability to view risk assessments'},
            {'name': 'Approve risk assessment', 'category': 'Risk Assessment', 'description': 'Ability to approve risk assessments'},

            # Document Management
            {'name': 'Upload document', 'category': 'Document Management', 'description': 'Ability to upload audit documents'},
            {'name': 'Edit document', 'category': 'Document Management', 'description': 'Ability to modify audit documents'},
            {'name': 'Delete document', 'category': 'Document Management', 'description': 'Ability to delete audit documents'},
            {'name': 'View document', 'category': 'Document Management', 'description': 'Ability to view audit documents'},
            {'name': 'Share document', 'category': 'Document Management', 'description': 'Ability to share audit documents'},

            # Analytics and Reporting
            {'name': 'Generate analytics', 'category': 'Analytics and Reporting', 'description': 'Ability to generate audit analytics'},
            {'name': 'View analytics', 'category': 'Analytics and Reporting', 'description': 'Ability to view audit analytics'},
            {'name': 'Create dashboard', 'category': 'Analytics and Reporting', 'description': 'Ability to create custom dashboards'},
            {'name': 'Export analytics', 'category': 'Analytics and Reporting', 'description': 'Ability to export analytics data'},

            # System Administration
            {'name': 'Manage users', 'category': 'System Administration', 'description': 'Ability to manage system users'},
            {'name': 'Manage roles', 'category': 'System Administration', 'description': 'Ability to manage user roles'},
            {'name': 'Configure system', 'category': 'System Administration', 'description': 'Ability to configure system settings'},
            {'name': 'View audit logs', 'category': 'System Administration', 'description': 'Ability to view system audit logs'},
            {'name': 'Manage templates', 'category': 'System Administration', 'description': 'Ability to manage audit templates'},
        ]

        created_count = 0
        updated_count = 0

        for permission_data in permissions_data:
            permission, created = Permission.objects.get_or_create(
                name=permission_data['name'],
                defaults={
                    'category': permission_data['category'],
                    'description': permission_data['description']
                }
            )
            
            if created:
                created_count += 1
                self.stdout.write(f"Created permission: {permission.name}")
            else:
                # Update existing permission if needed
                if permission.category != permission_data['category'] or permission.description != permission_data['description']:
                    permission.category = permission_data['category']
                    permission.description = permission_data['description']
                    permission.save()
                    updated_count += 1
                    self.stdout.write(f"Updated permission: {permission.name}")

        self.stdout.write(
            self.style.SUCCESS(
                f'Successfully populated permissions. Created: {created_count}, Updated: {updated_count}'
            )
        ) 