from datetime import timezone, timedelta
from celery import shared_task
from .models import Notification


@shared_task
def mark_all_notifications_read(user_id, batch_size=5000):
    qs = Notification.objects.filter(user_id=user_id, read=False)
    while qs.exists():
        batch = qs[:batch_size]
        batch.update(read=True, read_at=timezone.now())


@shared_task
def delete_old_notifications(batch_size=2500):
    one_year_ago = timezone.now() - timedelta(days=365)
    while True:
        old_qs = Notification.objects.filter(created_at__lt=one_year_ago)[:batch_size]
        count = old_qs.count()
        if not count:
            break
        old_qs.delete()
