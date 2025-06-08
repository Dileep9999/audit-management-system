from django.contrib import admin
from .models import UploadedFile


@admin.register(UploadedFile)
class UploadedFileAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "original_name",
        "type",
        "uploaded_by",
        "uploaded_at",
        "used",
        "file_hash",
    )
    list_filter = ("type", "used", "uploaded_at")
    search_fields = (
        "original_name",
        "uploaded_by__username",
        "file_hash",
        "description",
    )
    readonly_fields = ("file_hash", "uploaded_at")
