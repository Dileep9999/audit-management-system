from django.core.management.base import BaseCommand
from roles.models import Permission


class Command(BaseCommand):
    help = 'Populate the database with default permissions'

    def handle(self, *args, **options):
        permissions_data = [
            # Project permissions
            {'name': 'Archive project', 'category': 'Project', 'description': 'Ability to archive projects'},
            {'name': 'Edit project', 'category': 'Project', 'description': 'Ability to edit project details'},
            {'name': 'Select project modules', 'category': 'Project', 'description': 'Ability to select project modules'},
            {'name': 'View project attributes', 'category': 'Project', 'description': 'Ability to view project attributes'},
            {'name': 'Edit project attributes', 'category': 'Project', 'description': 'Ability to edit project attributes'},
            {'name': 'Select project attributes', 'category': 'Project', 'description': 'Ability to select project attributes'},
            {'name': 'Manage members', 'category': 'Project', 'description': 'Ability to manage project members'},
            {'name': 'View members', 'category': 'Project', 'description': 'Ability to view project members'},
            {'name': 'Manage versions', 'category': 'Project', 'description': 'Ability to manage project versions'},
            {'name': 'Select types', 'category': 'Project', 'description': 'Ability to select project types'},
            {'name': 'Select custom fields', 'category': 'Project', 'description': 'Ability to select custom fields'},
            {'name': 'Create subprojects', 'category': 'Project', 'description': 'Ability to create subprojects'},
            {'name': 'Copy projects', 'category': 'Project', 'description': 'Ability to copy projects'},
            {'name': 'Manage overview page', 'category': 'Project', 'description': 'Ability to manage project overview page'},
            {'name': 'Manage files in project', 'category': 'Project', 'description': 'Ability to manage project files'},
            {'name': 'Automatically managed project folders: Read files', 'category': 'Project', 'description': 'Read access to automatically managed project folders'},
            {'name': 'Automatically managed project folders: Write files', 'category': 'Project', 'description': 'Write access to automatically managed project folders'},
            {'name': 'Automatically managed project folders: Create files', 'category': 'Project', 'description': 'Create files in automatically managed project folders'},
            {'name': 'Automatically managed project folders: Delete files', 'category': 'Project', 'description': 'Delete files from automatically managed project folders'},
            {'name': 'Automatically managed project folders: Share files', 'category': 'Project', 'description': 'Share files from automatically managed project folders'},

            # Work packages and Gantt charts
            {'name': 'View work packages', 'category': 'Work packages and Gantt charts', 'description': 'Ability to view work packages'},
            {'name': 'Add work packages', 'category': 'Work packages and Gantt charts', 'description': 'Ability to add work packages'},
            {'name': 'Edit work packages', 'category': 'Work packages and Gantt charts', 'description': 'Ability to edit work packages'},
            {'name': 'Move work packages', 'category': 'Work packages and Gantt charts', 'description': 'Ability to move work packages'},
            {'name': 'Copy work packages', 'category': 'Work packages and Gantt charts', 'description': 'Ability to copy work packages'},
            {'name': 'Add comments', 'category': 'Work packages and Gantt charts', 'description': 'Ability to add comments to work packages'},
            {'name': 'Edit own comments', 'category': 'Work packages and Gantt charts', 'description': 'Ability to edit own comments'},
            {'name': 'Moderate comments', 'category': 'Work packages and Gantt charts', 'description': 'Ability to moderate all comments'},
            {'name': 'Add attachments', 'category': 'Work packages and Gantt charts', 'description': 'Ability to add attachments to work packages'},
            {'name': 'Manage work package categories', 'category': 'Work packages and Gantt charts', 'description': 'Ability to manage work package categories'},
            {'name': 'Export work packages', 'category': 'Work packages and Gantt charts', 'description': 'Ability to export work packages'},
            {'name': 'Delete work packages', 'category': 'Work packages and Gantt charts', 'description': 'Ability to delete work packages'},
            {'name': 'Manage work package relations', 'category': 'Work packages and Gantt charts', 'description': 'Ability to manage work package relations'},
            {'name': 'Manage work package hierarchies', 'category': 'Work packages and Gantt charts', 'description': 'Ability to manage work package hierarchies'},
            {'name': 'Manage public views', 'category': 'Work packages and Gantt charts', 'description': 'Ability to manage public views'},
            {'name': 'Save views', 'category': 'Work packages and Gantt charts', 'description': 'Ability to save views'},
            {'name': 'View watchers list', 'category': 'Work packages and Gantt charts', 'description': 'Ability to view watchers list'},
            {'name': 'Add watchers', 'category': 'Work packages and Gantt charts', 'description': 'Ability to add watchers'},
            {'name': 'Delete watchers', 'category': 'Work packages and Gantt charts', 'description': 'Ability to delete watchers'},
            {'name': 'Share work packages', 'category': 'Work packages and Gantt charts', 'description': 'Ability to share work packages'},
            {'name': 'View work package shares', 'category': 'Work packages and Gantt charts', 'description': 'Ability to view work package shares'},
            {'name': 'Assign versions', 'category': 'Work packages and Gantt charts', 'description': 'Ability to assign versions'},
            {'name': 'Change work package status', 'category': 'Work packages and Gantt charts', 'description': 'Ability to change work package status'},
            {'name': 'Become assignee/responsible', 'category': 'Work packages and Gantt charts', 'description': 'Ability to become assignee or responsible'},
            {'name': 'View file links', 'category': 'Work packages and Gantt charts', 'description': 'Ability to view file links'},
            {'name': 'Manage file links', 'category': 'Work packages and Gantt charts', 'description': 'Ability to manage file links'},

            # Boards
            {'name': 'View boards', 'category': 'Boards', 'description': 'Ability to view boards'},
            {'name': 'Manage boards', 'category': 'Boards', 'description': 'Ability to manage boards'},

            # Backlogs
            {'name': 'View master backlog', 'category': 'Backlogs', 'description': 'Ability to view master backlog'},
            {'name': 'View taskboards', 'category': 'Backlogs', 'description': 'Ability to view taskboards'},
            {'name': 'Select done statuses', 'category': 'Backlogs', 'description': 'Ability to select done statuses'},
            {'name': 'Update sprints', 'category': 'Backlogs', 'description': 'Ability to update sprints'},

            # Budgets
            {'name': 'View budgets', 'category': 'Budgets', 'description': 'Ability to view budgets'},
            {'name': 'Edit budgets', 'category': 'Budgets', 'description': 'Ability to edit budgets'},

            # Calendars
            {'name': 'View calendars', 'category': 'Calendars', 'description': 'Ability to view calendars'},
            {'name': 'Manage calendars', 'category': 'Calendars', 'description': 'Ability to manage calendars'},
            {'name': 'Subscribe to iCalendars', 'category': 'Calendars', 'description': 'Ability to subscribe to iCalendars'},

            # Documents
            {'name': 'View documents', 'category': 'Documents', 'description': 'Ability to view documents'},
            {'name': 'Manage documents', 'category': 'Documents', 'description': 'Ability to manage documents'},

            # Forums
            {'name': 'Manage forums', 'category': 'Forums', 'description': 'Ability to manage forums'},
            {'name': 'Post messages', 'category': 'Forums', 'description': 'Ability to post messages'},
            {'name': 'Edit messages', 'category': 'Forums', 'description': 'Ability to edit messages'},
            {'name': 'Edit own messages', 'category': 'Forums', 'description': 'Ability to edit own messages'},
            {'name': 'Delete messages', 'category': 'Forums', 'description': 'Ability to delete messages'},
            {'name': 'Delete own messages', 'category': 'Forums', 'description': 'Ability to delete own messages'},

            # GitHub
            {'name': 'Show GitHub content', 'category': 'GitHub', 'description': 'Ability to show GitHub content'},

            # GitLab
            {'name': 'Show GitLab content', 'category': 'GitLab', 'description': 'Ability to show GitLab content'},

            # Meetings
            {'name': 'View meetings', 'category': 'Meetings', 'description': 'Ability to view meetings'},
            {'name': 'Create meetings', 'category': 'Meetings', 'description': 'Ability to create meetings'},
            {'name': 'Edit meetings', 'category': 'Meetings', 'description': 'Ability to edit meetings'},
            {'name': 'Delete meetings', 'category': 'Meetings', 'description': 'Ability to delete meetings'},
            {'name': 'Invite users to meetings', 'category': 'Meetings', 'description': 'Ability to invite users to meetings'},
            {'name': 'Create meeting agendas', 'category': 'Meetings', 'description': 'Ability to create meeting agendas'},
            {'name': 'Manage agendas', 'category': 'Meetings', 'description': 'Ability to manage agendas'},
            {'name': 'Close agendas', 'category': 'Meetings', 'description': 'Ability to close agendas'},
            {'name': 'Send review notification for agendas', 'category': 'Meetings', 'description': 'Ability to send review notification for agendas'},
            {'name': 'Send meeting agenda as calendar entry', 'category': 'Meetings', 'description': 'Ability to send meeting agenda as calendar entry'},
            {'name': 'Manage minutes', 'category': 'Meetings', 'description': 'Ability to manage minutes'},
            {'name': 'Send review notification for minutes', 'category': 'Meetings', 'description': 'Ability to send review notification for minutes'},

            # News
            {'name': 'Manage news', 'category': 'News', 'description': 'Ability to manage news'},
            {'name': 'Comment news', 'category': 'News', 'description': 'Ability to comment on news'},

            # Repository
            {'name': 'Read-only access to repository (browse and checkout)', 'category': 'Repository', 'description': 'Read-only access to repository'},
            {'name': 'Read/write access to repository (commit)', 'category': 'Repository', 'description': 'Read/write access to repository'},
            {'name': 'Manage repository', 'category': 'Repository', 'description': 'Ability to manage repository'},
            {'name': 'View repository revisions in OpenProject', 'category': 'Repository', 'description': 'Ability to view repository revisions'},
            {'name': 'View commit author statistics', 'category': 'Repository', 'description': 'Ability to view commit author statistics'},

            # Team planners
            {'name': 'View team planner', 'category': 'Team planners', 'description': 'Ability to view team planner'},
            {'name': 'Manage team planner', 'category': 'Team planners', 'description': 'Ability to manage team planner'},

            # Time and costs
            {'name': 'View spent time', 'category': 'Time and costs', 'description': 'Ability to view spent time'},
            {'name': 'View own spent time', 'category': 'Time and costs', 'description': 'Ability to view own spent time'},
            {'name': 'Log own time', 'category': 'Time and costs', 'description': 'Ability to log own time'},
            {'name': 'Log time for other users', 'category': 'Time and costs', 'description': 'Ability to log time for other users'},
            {'name': 'Edit own time logs', 'category': 'Time and costs', 'description': 'Ability to edit own time logs'},
            {'name': 'Edit time logs for other users', 'category': 'Time and costs', 'description': 'Ability to edit time logs for other users'},
            {'name': 'Manage project activities', 'category': 'Time and costs', 'description': 'Ability to manage project activities'},
            {'name': 'View own hourly rate', 'category': 'Time and costs', 'description': 'Ability to view own hourly rate'},
            {'name': 'View all hourly rates', 'category': 'Time and costs', 'description': 'Ability to view all hourly rates'},
            {'name': 'Edit own hourly rates', 'category': 'Time and costs', 'description': 'Ability to edit own hourly rates'},
            {'name': 'Edit hourly rates', 'category': 'Time and costs', 'description': 'Ability to edit hourly rates'},
            {'name': 'View cost rates', 'category': 'Time and costs', 'description': 'Ability to view cost rates'},
            {'name': 'Book unit costs for oneself', 'category': 'Time and costs', 'description': 'Ability to book unit costs for oneself'},
            {'name': 'Book unit costs', 'category': 'Time and costs', 'description': 'Ability to book unit costs'},
            {'name': 'Edit own booked unit costs', 'category': 'Time and costs', 'description': 'Ability to edit own booked unit costs'},
            {'name': 'Edit booked unit costs', 'category': 'Time and costs', 'description': 'Ability to edit booked unit costs'},
            {'name': 'View booked costs', 'category': 'Time and costs', 'description': 'Ability to view booked costs'},
            {'name': 'View own booked costs', 'category': 'Time and costs', 'description': 'Ability to view own booked costs'},
            {'name': 'Save public cost reports', 'category': 'Time and costs', 'description': 'Ability to save public cost reports'},
            {'name': 'Save private cost reports', 'category': 'Time and costs', 'description': 'Ability to save private cost reports'},

            # Wiki
            {'name': 'View wiki', 'category': 'Wiki', 'description': 'Ability to view wiki'},
            {'name': 'List attachments', 'category': 'Wiki', 'description': 'Ability to list attachments'},
            {'name': 'Manage wiki', 'category': 'Wiki', 'description': 'Ability to manage wiki'},
            {'name': 'Manage wiki menu', 'category': 'Wiki', 'description': 'Ability to manage wiki menu'},
            {'name': 'Rename wiki pages', 'category': 'Wiki', 'description': 'Ability to rename wiki pages'},
            {'name': 'Change parent wiki page', 'category': 'Wiki', 'description': 'Ability to change parent wiki page'},
            {'name': 'Delete wiki pages', 'category': 'Wiki', 'description': 'Ability to delete wiki pages'},
            {'name': 'Export wiki pages', 'category': 'Wiki', 'description': 'Ability to export wiki pages'},
            {'name': 'View wiki history', 'category': 'Wiki', 'description': 'Ability to view wiki history'},
            {'name': 'Edit wiki pages', 'category': 'Wiki', 'description': 'Ability to edit wiki pages'},
            {'name': 'Delete attachments', 'category': 'Wiki', 'description': 'Ability to delete attachments'},
            {'name': 'Protect wiki pages', 'category': 'Wiki', 'description': 'Ability to protect wiki pages'},
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