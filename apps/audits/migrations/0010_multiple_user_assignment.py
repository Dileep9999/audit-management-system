# Generated manually for multiple user assignment

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('audits', '0009_auditfinding'),
        ('user', '0004_user_picture'),
    ]

    operations = [
        # Add many-to-many field for multiple user assignment to AuditTask
        migrations.AddField(
            model_name='audittask',
            name='assigned_users',
            field=models.ManyToManyField(
                blank=True,
                related_name='assigned_audit_tasks_multi',
                to='user.User',
                verbose_name='Assigned Users'
            ),
        ),
        
        # Migrate existing single assignments to multiple assignments for AuditTask
        migrations.RunSQL(
            # Forward migration - copy single assignments to multiple assignments
            """
            -- Migrate AuditTask assignments
            INSERT INTO audits_audittask_assigned_users (audittask_id, user_id)
            SELECT id, assigned_to_id 
            FROM audits_audittask 
            WHERE assigned_to_id IS NOT NULL;
            """,
            
            # Reverse migration - restore single assignments from multiple assignments
            """
            -- Restore AuditTask assignments (take first user if multiple)
            UPDATE audits_audittask 
            SET assigned_to_id = (
                SELECT user_id 
                FROM audits_audittask_assigned_users 
                WHERE audittask_id = audits_audittask.id 
                LIMIT 1
            )
            WHERE id IN (
                SELECT DISTINCT audittask_id 
                FROM audits_audittask_assigned_users
            );
            """
        ),
    ] 