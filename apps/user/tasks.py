from celery import shared_task
from django.core.mail import send_mail
from django.core import management
import logging

logger = logging.getLogger(__name__)


@shared_task(bind=True, max_retries=3, default_retry_delay=20, ignore_result=True)
def send_login_email(self, user_email, username):
    logger.info(f"Sending login email to {user_email} for user {username}")
    try:
        send_mail(
            subject="Login Notification",
            message=f"Hello {username}, you have just logged in.",
            from_email="no-reply@example.com",
            recipient_list=[user_email],
            fail_silently=False,  # Fail loudly so retry works
        )
    except Exception as exc:
        logger.error(f"Error sending email to {user_email}: {exc}")
        self.retry(exc=exc)


@shared_task(
    name="my_custom_clear_sessions_task",
    bind=True,
    max_retries=3,
    default_retry_delay=20,
)
def clear_expired_sessions(self):
    management.call_command("clearsessions")
    from celery import current_task
    from datetime import datetime

    return {
        "task_name": current_task.name,
        "time": datetime.utcnow().isoformat(),
        "result": "cleared",
    }
