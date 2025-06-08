from django.contrib import admin

# Register your models here.
from django.contrib.auth.admin import UserAdmin
from .models import User
from .forms import CustomUserChangeForm, CustomUserCreationForm
from django.utils.translation import gettext as _
from import_export import resources
from import_export.admin import ImportExportModelAdmin
from django.contrib.auth.hashers import make_password
from django.utils.html import format_html
from django.urls import reverse
from django.contrib import admin
from django.template.response import TemplateResponse
from apps.user.tasks import send_login_email
from django.contrib.sessions.models import Session


class CustomUserResource(resources.ModelResource):
    """Custom resource for importing/exporting User model data.
    This handles password hashing before import and ensures the password is not exported in plaintext.
    """

    def before_import_row(self, row, **kwargs):
        password = row.get("password")
        if password and not password.startswith("pbkdf2_"):  # not already hashed
            row["password"] = make_password(password)

    class Meta:
        model = User
        import_id_fields = ["username"]
        fields = (
            "username",
            "email",
            "first_name",
            "last_name",
            "is_active",
            "is_staff",
            "is_superuser",
            "date_joined",
            "last_login",
            "language",
            "department",
            "title",
            "ad_last_synced",
        )


class CustomUserAdmin(ImportExportModelAdmin, UserAdmin):

    resource_class = CustomUserResource
    add_form = CustomUserCreationForm
    form = CustomUserChangeForm
    model = User

    list_display = (
        "username",
        "email",
        "first_name",
        "last_name",
        "is_staff",
        "date_joined",
        "last_login",
        "is_active",
        "is_deleted",
    )
    list_filter = (
        "is_staff",
        "is_superuser",
        "is_active",
        "groups",
        "is_deleted",
        "language",
    )
    search_fields = ("username", "first_name", "last_name", "email")

    fieldsets = (
        (None, {"fields": ("username", "email", "password")}),
        (_("Personal info"), {"fields": ("first_name", "last_name", "language")}),
        (
            _("Permissions"),
            {
                "fields": (
                    "is_active",
                    "is_staff",
                    "is_superuser",
                    "groups",
                    "user_permissions",
                ),
            },
        ),
        (_("Important dates"), {"fields": ("last_login", "date_joined")}),
        (_("AD Sync"), {"fields": ("department", "title", "ad_last_synced")}),
    )
    add_fieldsets = (
        (
            None,
            {
                "classes": ("wide",),
                "fields": ("username", "email", "password1", "password2"),
            },
        ),
    )

    actions = ["send_login_email_action"]

    @admin.action(description="Send login email (Celery task)")
    def send_login_email_action(self, request, queryset):
        for user in queryset:
            send_login_email.delay(user.email, user.username)
        self.message_user(
            request, f"Triggered login email task for {queryset.count()} user(s)."
        )

    def impersonate(self, obj):
        if self.request.user != obj:
            url = reverse("impersonate-start", args=[obj.pk])
            return format_html(f'<a href="{url}">{_("Switch")}</a>')
        return "-"

    impersonate.short_description = _("Impersonate User")

    def get_list_display(self, request):
        self.request = request  # so we can access in `impersonate`
        return super().get_list_display(request) + ("impersonate",)


admin.site.register(User, CustomUserAdmin)


# SessionAdmin for managing user sessions
class SessionAdmin(admin.ModelAdmin):
    list_display = ("session_key", "user", "expire_date")
    search_fields = ("session_key",)

    def user(self, obj):
        try:
            from django.contrib.auth import get_user_model

            data = obj.get_decoded()
            user_id = data.get("_auth_user_id")
            if user_id:
                User = get_user_model()
                user = User.objects.filter(pk=user_id).first()
                return user.username if user else "-"
        except Exception:
            return "-"
        return "-"

    user.short_description = _("User")

    def has_add_permission(self, request):
        return False

    # def has_delete_permission(self, request, obj=None):
    #     return False


admin.site.register(Session, SessionAdmin)
