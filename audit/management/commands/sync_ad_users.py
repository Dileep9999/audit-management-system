from django.core.management.base import BaseCommand
from django_auth_ldap.backend import LDAPBackend
from django.conf import settings
from datetime import datetime
from apps.user.models import User


class Command(BaseCommand):
    help = "Sync users from LDAP to Django using django-auth-ldap config"

    def handle(self, *args, **kwargs):
        start_time = datetime.now()
        self.stdout.write(
            f"🔄 Sync started at: {start_time.strftime('%Y-%m-%d %H:%M:%S')}"
        )

        backend = LDAPBackend()

        # Connect to LDAP
        conn = backend.ldap.initialize(settings.AUTH_LDAP_SERVER_URI)
        conn.simple_bind_s(settings.AUTH_LDAP_BIND_DN, settings.AUTH_LDAP_BIND_PASSWORD)

        # Search users using AUTH_LDAP_USER_SEARCH
        user_search = settings.AUTH_LDAP_USER_SEARCH
        results = conn.search_s(
            user_search.base_dn,
            user_search.scope,
            "(objectClass=inetOrgPerson)",  # Adjust to your directory
            ["uid", "mail", "first_name", "last_name"],
        )

        count = 0
        for dn, entry in results:
            if not entry.get("uid"):
                continue

            username = entry["uid"][0].decode()

            # Populate and sync the user using django-auth-ldap
            user = backend.populate_user(username)

            if user and user.is_active:
                count += 1
                self.stdout.write(
                    f"Synced: {user.username} | {user.email} | "
                    f"{'staff' if user.is_staff else ''} "
                    f"{'superuser' if user.is_superuser else ''}"
                )

        end_time = datetime.now()
        duration = (end_time - start_time).total_seconds()
        self.stdout.write(f"\n✅ Synced {count} users.")
        self.stdout.write(
            f"⏱ Finished at: {end_time.strftime('%Y-%m-%d %H:%M:%S')} (Duration: {duration:.2f} seconds)"
        )
