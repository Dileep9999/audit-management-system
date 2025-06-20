# Generated by Django 5.2.1 on 2025-06-06 02:28

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("user", "0002_user_created_at_user_updated_at"),
    ]

    operations = [
        migrations.AlterModelOptions(
            name="user",
            options={
                "permissions": [
                    ("can_publish", "Can publish items"),
                    ("can_archive", "Can archive items"),
                ]
            },
        ),
        migrations.AlterField(
            model_name="user",
            name="language",
            field=models.CharField(
                blank=True,
                choices=[("ar", "Arabic"), ("en", "English")],
                default="en",
                max_length=7,
                null=True,
            ),
        ),
    ]
