from django.contrib.admin.views.decorators import staff_member_required
from django.shortcuts import render
from django.contrib.auth import get_user_model
from django.utils import timezone
from django.db.models.functions import TruncDate
from django.db.models import Count
from django_celery_results.models import TaskResult
import json as pyjson  # avoid conflict with context json
from django.conf import settings


@staff_member_required
def custom_dashboard(request):
    User = get_user_model()
    today = timezone.now().date()
    total_users = User.objects.count()
    users_logged_in_today = User.objects.filter(last_login__date=today).count()

    # Users created per day for the last 7 days
    last_7_days = [today - timezone.timedelta(days=i) for i in range(6, -1, -1)]
    user_counts = (
        User.objects.filter(date_joined__date__gte=last_7_days[0])
        .annotate(day=TruncDate("date_joined"))
        .values("day")
        .annotate(count=Count("id"))
        .order_by("day")
    )
    user_chart_labels = [d.strftime("%Y-%m-%d") for d in last_7_days]
    user_counts_dict = {str(u["day"]): u["count"] for u in user_counts}
    user_chart_data = [user_counts_dict.get(label, 0) for label in user_chart_labels]

    # --- Celery tasks from Redis ---
    recent_tasks = TaskResult.objects.order_by("-date_done")[:20]

    return render(
        request,
        "admin/custom_dashboard.html",
        {
            "title": "Custom Dashboard",
            "total_users": total_users,
            "users_logged_in_today": users_logged_in_today,
            "user_chart_labels": pyjson.dumps(user_chart_labels),
            "user_chart_data": pyjson.dumps(user_chart_data),
            "recent_tasks": recent_tasks,
        },
    )
