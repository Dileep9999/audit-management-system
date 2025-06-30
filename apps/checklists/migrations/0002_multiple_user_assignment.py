# Generated manually for multiple user assignment in checklists

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('checklists', '0001_initial'),
        ('user', '0004_user_picture'),
    ]

    operations = [
        # Add many-to-many field for multiple user assignment to Checklist
        migrations.AddField(
            model_name='checklist',
            name='assigned_users',
            field=models.ManyToManyField(
                blank=True,
                related_name='assigned_checklists_multi',
                to='user.User',
                verbose_name='Assigned Users',
                help_text='Multiple users can be assigned to work on this checklist'
            ),
        ),
    ] 