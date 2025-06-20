# Generated by Django 5.2.1 on 2025-06-07 18:29

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name="UploadedFile",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True,
                        primary_key=True,
                        serialize=False,
                        verbose_name="ID",
                    ),
                ),
                (
                    "file",
                    models.FileField(
                        upload_to="uploads/%Y/%m/%d/", verbose_name="File"
                    ),
                ),
                (
                    "original_name",
                    models.CharField(
                        blank=True, max_length=255, verbose_name="Original File Name"
                    ),
                ),
                (
                    "uploaded_at",
                    models.DateTimeField(auto_now_add=True, verbose_name="Uploaded At"),
                ),
                (
                    "description",
                    models.CharField(
                        blank=True,
                        default="",
                        max_length=255,
                        verbose_name="Description",
                    ),
                ),
                (
                    "file_hash",
                    models.CharField(
                        blank=True, max_length=64, null=True, verbose_name="File Hash"
                    ),
                ),
                ("used", models.BooleanField(default=False, verbose_name="Used")),
                (
                    "type",
                    models.CharField(
                        choices=[
                            ("comment", "Comment"),
                            ("user", "User"),
                            ("post", "Post"),
                            ("evidence", "Evidence"),
                            ("report", "Report"),
                            ("plan", "Plan"),
                            ("attachment", "Attachment"),
                            ("finding", "Finding"),
                            ("action", "Action"),
                            ("template", "Template"),
                            ("policy", "Policy"),
                            ("other", "Other"),
                        ],
                        default="other",
                        max_length=32,
                        verbose_name="Type",
                    ),
                ),
                (
                    "object_pk",
                    models.PositiveIntegerField(
                        blank=True,
                        help_text="Primary key of the object this file is associated with.",
                        null=True,
                        verbose_name="Object Primary Key",
                    ),
                ),
                (
                    "uploaded_by",
                    models.ForeignKey(
                        blank=True,
                        null=True,
                        on_delete=django.db.models.deletion.CASCADE,
                        related_name="uploaded_files",
                        to=settings.AUTH_USER_MODEL,
                        verbose_name="Uploaded By",
                    ),
                ),
            ],
        ),
    ]
