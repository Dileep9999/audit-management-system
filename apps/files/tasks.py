from celery import shared_task
from django.utils import timezone
from datetime import timedelta
from .models import UploadedFile


@shared_task
def delete_unused_files():
    """
    Delete files not marked as used and uploaded more than 2 days ago.
    (For future: you can add logic to delete comment files unused after 8 hours.)
    """
    now = timezone.now()
    two_days_ago = now - timedelta(days=2)

    # Delete all unused files uploaded more than 2 days ago
    unused_files = UploadedFile.objects.filter(used=False, uploaded_at__lt=two_days_ago)
    count = 0
    for f in unused_files:
        f.file.delete(save=False)
        f.delete()
        count += 1

    # Future: To delete unused comment files after 8 hours, use:
    # eight_hours_ago = now - timedelta(hours=8)
    # comment_unused = UploadedFile.objects.filter(
    #     used=False, type='comment', uploaded_at__lt=eight_hours_ago
    # )
    # ...delete logic...

    return {"deleted_count": count}
