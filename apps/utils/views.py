from rest_framework.generics import ListAPIView

# Create your views here.


class ListSearchSerializersView(ListAPIView):
    """
    View to list all serializers in the application.
    This is a placeholder for future implementation.
    """

    def get_queryset(self):
        """
        Returns a queryset of all users, excluding soft-deleted ones.
        """
        return self.serializer_class.Meta.model.objects.filter(is_deleted=False)
