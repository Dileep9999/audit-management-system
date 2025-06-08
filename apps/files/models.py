from django.db import models
from django.conf import settings
from django.utils.translation import gettext_lazy as _
from django.core.exceptions import ValidationError
import hashlib
import uuid
import os
import datetime


def validate_file_type_and_size(uploaded_file, file_type):
    # Define allowed types and max sizes (in bytes) per file type
    allowed_types = {
        "comment": [
            "image/jpeg",
            "image/png",
            "application/pdf",
            "text/csv",
            "application/vnd.ms-excel",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "application/vnd.ms-powerpoint",
            "application/vnd.openxmlformats-officedocument.presentationml.presentation",
            "application/vnd.ms-access",
            "application/rtf",
            "text/plain",
        ],
        "user": ["image/jpeg", "image/png"],
        "post": [
            "image/jpeg",
            "image/png",
            "application/pdf",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        ],
        "evidence": [
            "image/jpeg",
            "image/png",
            "application/pdf",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "application/vnd.ms-excel",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "application/vnd.ms-powerpoint",
            "application/vnd.openxmlformats-officedocument.presentationml.presentation",
            "application/vnd.ms-access",
            "application/rtf",
            "text/plain",
        ],
        "task": [
            "image/jpeg",
            "image/png",
            "application/pdf",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "application/vnd.ms-excel",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "application/vnd.ms-powerpoint",
            "application/vnd.openxmlformats-officedocument.presentationml.presentation",
            "application/vnd.ms-access",
            "application/rtf",
            "text/plain",
        ],
        "report": [
            "application/pdf",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        ],
        "plan": [
            "application/pdf",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "application/vnd.ms-excel",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        ],
        "attachment": [
            "image/jpeg",
            "image/png",
            "application/pdf",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "application/zip",
        ],
        "finding": [
            "image/jpeg",
            "image/png",
            "application/pdf",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        ],
        "action": [
            "application/pdf",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        ],
        "template": [
            "application/pdf",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "application/vnd.ms-excel",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        ],
        "policy": [
            "application/pdf",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        ],
        "other": [
            "image/jpeg",
            "image/png",
            "image/gif",
            "image/bmp",
            "image/webp",
            "image/svg+xml",
            "application/x-png",
            "application/x-jpg",
            "application/x-gif",
            "application/pdf",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "application/vnd.ms-excel",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "application/vnd.ms-powerpoint",
            "application/vnd.openxmlformats-officedocument.presentationml.presentation",
            "application/vnd.ms-access",
            "application/rtf",
            "text/plain",
            "text/csv",
        ],
    }
    max_size = {
        "comment": 5 * 1024 * 1024,  # 5MB
        "user": 3 * 1024 * 1024,  # 3MB
        "post": 5 * 1024 * 1024,  # 5MB
        "evidence": 100 * 1024 * 1024,  # 100MB
        "report": 40 * 1024 * 1024,  # 40MB
        "plan": 10 * 1024 * 1024,  # 10MB
        "attachment": 50 * 1024 * 1024,  # 50MB
        "finding": 10 * 1024 * 1024,  # 10MB
        "action": 10 * 1024 * 1024,  # 10MB
        "template": 10 * 1024 * 1024,  # 10MB
        "policy": 10 * 1024 * 1024,  # 10MB
        "task": 100 * 1024 * 1024,  # 100MB
        "other": 10 * 1024 * 1024,  # 10MB
    }
    content_type = getattr(uploaded_file, "content_type", None)

    # Map MIME types to user-friendly names
    mime_display = {
        "image/jpeg": "JPEG image",
        "image/png": "PNG image",
        "image/gif": "GIF image",
        "image/bmp": "BMP image",
        "image/webp": "WebP image",
        "image/svg+xml": "SVG image",
        "application/x-png": "PNG image",
        "application/x-jpg": "JPEG image",
        "application/x-gif": "GIF image",
        "application/x-bmp": "BMP image",
        "application/pdf": "PDF document",
        "application/msword": "Word document",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "Word document",
        "application/vnd.ms-excel": "Excel spreadsheet",
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "Excel spreadsheet",
        "application/zip": "ZIP archive",
        "application/vnd.ms-powerpoint": "PowerPoint presentation",
        "application/vnd.openxmlformats-officedocument.presentationml.presentation": "PowerPoint presentation",
        "application/vnd.ms-access": "Access database",
        "application/rtf": "Rich Text Format",
        "text/plain": "Plain text file",
        "text/csv": "CSV file",
        "text/html": "HTML document",
        "text/xml": "XML document",
        "application/json": "JSON file",
        "application/javascript": "JavaScript file",
        "application/octet-stream": "Binary file",
        "application/x-zip-compressed": "ZIP archive",
        "application/x-tar": "TAR archive",
        "application/x-gzip": "GZIP archive",  # Common alternative for GZIP files
        "application/x-bzip2": "BZIP2 archive",  # Common alternative for BZIP2 files
        "application/x-7z-compressed": "7z archive",  # Common alternative for 7z files
        "application/x-rar-compressed": "RAR archive",  # Common alternative for RAR files
        "application/x-shockwave-flash": "Flash file",  # Common alternative for Flash files
        "video/mp4": "MP4 video",  # Common alternative for MP4 files
        "video/x-msvideo": "AVI video",
        "video/x-flv": "FLV video",
        "video/webm": "WebM video",
        "audio/mpeg": "MP3 audio",
        "audio/wav": "WAV audio",
        "audio/ogg": "OGG audio",  # Common alternative for OGG files
        "audio/aac": "AAC audio",  # Common alternative for AAC files
        "application/x-msdownload": "Executable file",  # Common alternative for EXE files
        "application/x-sh": "Shell script",  # Common alternative for shell scripts
        # Add more as needed
    }
    display_type = mime_display.get(content_type, content_type)

    if content_type and content_type not in allowed_types.get(file_type, []):
        raise ValidationError(
            {
                "file": _('File type "{content_type}" not allowed.').format(
                    content_type=display_type, file_type=file_type
                )
            }
        )
    if uploaded_file.size > max_size.get(file_type, 10 * 1024 * 1024):
        raise ValidationError(
            {
                "file": _(
                    "File size {size:.2f} MB exceeds the limit ({limit:.2f} MB)."
                ).format(
                    size=uploaded_file.size / (1024 * 1024),
                    limit=max_size.get(file_type, 10 * 1024 * 1024) / (1024 * 1024),
                )
            }
        )


def upload_to_unique(instance, filename):
    # Handle files with or without extension
    base, ext = os.path.splitext(filename)
    ext = ext.lstrip(".")
    if ext:
        unique_name = f"{uuid.uuid4().hex}.{ext}"
    else:
        unique_name = f"{uuid.uuid4().hex}"
    today = datetime.date.today()
    return os.path.join("uploads", str(today), unique_name)


class UploadedFile(models.Model):
    """
    Model to handle file uploads with type validation and size limits.
    """

    # Define choices for file types, Also add in above validation function
    # to ensure that the file type is valid for the given context.
    FILE_TYPE_CHOICES = [
        ("comment", _("Comment")),
        ("user", _("User")),
        ("post", _("Post")),
        ("evidence", _("Evidence")),
        ("report", _("Report")),
        ("plan", _("Plan")),
        ("attachment", _("Attachment")),
        ("finding", _("Finding")),
        ("action", _("Action")),
        ("template", _("Template")),
        ("policy", _("Policy")),
        ("other", _("Other")),
    ]

    file = models.FileField(upload_to=upload_to_unique, verbose_name=_("File"))
    original_name = models.CharField(
        max_length=255, blank=True, verbose_name=_("Original File Name")
    )
    uploaded_at = models.DateTimeField(auto_now_add=True, verbose_name=_("Uploaded At"))
    uploaded_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        blank=True,
        null=True,
        on_delete=models.CASCADE,
        related_name="uploaded_files",
        verbose_name=_("Uploaded By"),
    )
    description = models.CharField(
        max_length=255, blank=True, default="", verbose_name=_("Description")
    )
    file_hash = models.CharField(
        max_length=64, blank=True, null=True, verbose_name=_("File Hash")
    )
    used = models.BooleanField(default=False, verbose_name=_("Used"))

    type = models.CharField(
        max_length=32,
        choices=FILE_TYPE_CHOICES,
        default="other",
        verbose_name=_("Type"),
    )
    object_pk = models.PositiveIntegerField(
        blank=True,
        null=True,
        verbose_name=_("Object Primary Key"),
        help_text=_("Primary key of the object this file is associated with."),
    )

    def clean(self):
        # Validate file type and size
        if self.file and self.type:
            validate_file_type_and_size(self.file, self.type)

    def save(self, *args, **kwargs):
        # Calculate file hash if not set and file exists
        if self.file and not self.file_hash:
            self.file.seek(0)
            self.file_hash = hashlib.sha256(self.file.read()).hexdigest()
            self.file.seek(0)
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.file.name} ({self.get_type_display()})"

    @property
    def url(self):
        return self.file.url

    def delete(self, *args, **kwargs):
        storage = self.file.storage
        path = self.file.path
        super().delete(*args, **kwargs)
        storage.delete(path)
