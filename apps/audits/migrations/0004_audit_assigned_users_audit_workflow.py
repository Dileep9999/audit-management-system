# Generated by Django 5.2.1 on 2025-06-23 10:38

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("audits", "0003_alter_audit_options_alter_customaudittype_options_and_more"),
        ("workflows", "0002_workflow_description_workflow_status_and_more"),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.AddField(
            model_name="audit",
            name="assigned_users",
            field=models.ManyToManyField(
                blank=True,
                help_text="Users assigned to work on this audit",
                related_name="assigned_audits",
                to=settings.AUTH_USER_MODEL,
            ),
        ),
        migrations.AddField(
            model_name="audit",
            name="workflow",
            field=models.ForeignKey(
                blank=True,
                help_text="Workflow to be followed for this audit",
                null=True,
                on_delete=django.db.models.deletion.SET_NULL,
                related_name="audits",
                to="workflows.workflow",
            ),
        ),
    ]
