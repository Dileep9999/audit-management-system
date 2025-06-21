from django.contrib import admin
from django.utils.html import format_html
from .models import Permission, Role, UserRole


@admin.register(Permission)
class PermissionAdmin(admin.ModelAdmin):
    list_display = ('name', 'category', 'description', 'created_at')
    list_filter = ('category', 'created_at')
    search_fields = ('name', 'description', 'category')
    ordering = ('category', 'name')
    readonly_fields = ('created_at', 'updated_at')
    
    fieldsets = (
        (None, {
            'fields': ('name', 'category', 'description')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(Role)
class RoleAdmin(admin.ModelAdmin):
    list_display = ('name', 'severity', 'hierarchy_position', 'status', 'permissions_count', 'created_at')
    list_filter = ('severity', 'status', 'created_at')
    search_fields = ('name', 'description')
    ordering = ('hierarchy_position', 'name')
    readonly_fields = ('created_at', 'updated_at', 'created_by')
    filter_horizontal = ('permissions',)
    
    fieldsets = (
        (None, {
            'fields': ('name', 'description', 'severity', 'hierarchy_position', 'status')
        }),
        ('Permissions', {
            'fields': ('permissions',),
            'classes': ('collapse',)
        }),
        ('Metadata', {
            'fields': ('created_by', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    def permissions_count(self, obj):
        return obj.permissions.count()
    permissions_count.short_description = 'Permissions'
    
    def save_model(self, request, obj, form, change):
        if not change:  # Only set created_by on creation
            obj.created_by = request.user
        super().save_model(request, obj, form, change)


@admin.register(UserRole)
class UserRoleAdmin(admin.ModelAdmin):
    list_display = ('user', 'role', 'assigned_at', 'assigned_by')
    list_filter = ('role', 'assigned_at')
    search_fields = ('user__username', 'user__email', 'role__name')
    ordering = ('-assigned_at',)
    readonly_fields = ('assigned_at',)
    
    fieldsets = (
        (None, {
            'fields': ('user', 'role', 'assigned_by')
        }),
        ('Timestamps', {
            'fields': ('assigned_at',),
            'classes': ('collapse',)
        }),
    )
    
    def save_model(self, request, obj, form, change):
        if not change:  # Only set assigned_by on creation
            obj.assigned_by = request.user
        super().save_model(request, obj, form, change)
