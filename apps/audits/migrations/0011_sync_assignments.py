# Generated manually for syncing existing assignments

from django.db import migrations


def sync_existing_assignments(apps, schema_editor):
    """Sync existing single assignments to multiple assignments"""
    AuditTask = apps.get_model('audits', 'AuditTask')
    Checklist = apps.get_model('checklists', 'Checklist')
    
    # Sync AuditTask assignments
    for task in AuditTask.objects.filter(assigned_to__isnull=False):
        if not task.assigned_users.exists():
            task.assigned_users.add(task.assigned_to)
    
    # Sync Checklist assignments  
    for checklist in Checklist.objects.filter(assigned_to__isnull=False):
        if not checklist.assigned_users.exists():
            checklist.assigned_users.add(checklist.assigned_to)


def reverse_sync_assignments(apps, schema_editor):
    """Reverse the sync - clear multiple assignments"""
    AuditTask = apps.get_model('audits', 'AuditTask')
    Checklist = apps.get_model('checklists', 'Checklist')
    
    # Clear multiple assignments
    for task in AuditTask.objects.all():
        task.assigned_users.clear()
    
    for checklist in Checklist.objects.all():
        checklist.assigned_users.clear()


class Migration(migrations.Migration):

    dependencies = [
        ('audits', '0010_multiple_user_assignment'),
        ('checklists', '0002_multiple_user_assignment'),
    ]

    operations = [
        migrations.RunPython(
            sync_existing_assignments,
            reverse_sync_assignments,
        ),
    ] 