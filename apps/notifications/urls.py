from django.urls import path
from .views import (
    NotificationListView,
    NotificationDeleteView,
    NotificationMarkReadView,
    NotificationMarkAllReadTaskView,
)

urlpatterns = [
    path("", NotificationListView.as_view(), name="notification-list"),
    path(
        "<int:pk>/delete/", NotificationDeleteView.as_view(), name="notification-delete"
    ),
    path(
        "<int:pk>/mark-read/",
        NotificationMarkReadView.as_view(),
        name="notification-mark-read",
    ),
    path(
        "mark-all-read/",
        NotificationMarkAllReadTaskView.as_view(),
        name="notification-mark-all-read-task",
    ),
]
