# django command to show users
from django.core.management.base import BaseCommand
from apps.user.models import User
from django.utils import timezone


class Command(BaseCommand):
    help = "Show all users in the system"

    def handle(self, *args, **kwargs):
        users = User.objects.all()[:100]  # Limit to 100 users for performance
        if not users:
            self.stdout.write(self.style.WARNING("No users found."))
            return

        self.stdout.write(self.style.SUCCESS("List of users:"))
        for user in users:
            last_login = (
                user.last_login.strftime("%Y-%m-%d %H:%M:%S")
                if user.last_login
                else "Never"
            )
            self.stdout.write(
                f'ID: {user.id}, Email: {user.email}, Last Login: {last_login}, Date Joined: {user.date_joined.strftime("%Y-%m-%d %H:%M:%S")}'
            )
            if user.is_deleted:
                deleted_info = f', Deleted At: {user.deleted_at.strftime("%Y-%m-%d %H:%M:%S")}, Deleted By: {user.deleted_by.username if user.deleted_by else "N/A"}'
                self.stdout.write(f" (Soft Deleted{deleted_info})")
            else:
                self.stdout.write(" (Active User)")
        self.stdout.write(self.style.SUCCESS("End of user list."))
        self.stdout.write(self.style.SUCCESS(f"Total users: {users.count()}"))
        self.stdout.write(
            self.style.SUCCESS(
                f'Timestamp: {timezone.now().strftime("%Y-%m-%d %H:%M:%S")}'
            )
        )
        self.stdout.write(self.style.SUCCESS("Command executed successfully."))
