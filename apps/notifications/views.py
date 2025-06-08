from datetime import timezone
from rest_framework import generics, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import Notification
from .serializers import NotificationSerializer
from .tasks import mark_all_notifications_read


class NotificationListView(generics.ListAPIView):
    serializer_class = NotificationSerializer

    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user).order_by("-id")


class NotificationDeleteView(generics.DestroyAPIView):
    serializer_class = NotificationSerializer

    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user)


class NotificationMarkReadView(APIView):

    def post(self, request, pk):
        notif = Notification.objects.filter(pk=pk, user=request.user).first()
        if notif:
            notif.read = True
            notif.save()
            return Response({"status": "marked as read"})
        return Response(
            {"error": "Notification not found"}, status=status.HTTP_404_NOT_FOUND
        )


class NotificationMarkAllReadTaskView(APIView):

    def post(self, request):
        unread_qs = Notification.objects.filter(user=request.user, read=False)
        count = unread_qs.count()
        if count == 0:
            return Response({"status": "no unread notifications", "task": False})
        elif count <= 500:
            unread_qs.update(read=True, read_at=timezone.now())
            return Response({"status": f"marked {count} as read in API", "task": False})
        else:
            mark_all_notifications_read.delay(request.user.id)
            return Response(
                {
                    "status": f"bulk mark as read started for {count} notifications",
                    "task": True,
                }
            )
