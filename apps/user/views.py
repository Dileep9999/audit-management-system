from django.utils.translation import gettext as _
from rest_framework.response import Response
from rest_framework.generics import RetrieveAPIView, ListAPIView
from rest_framework.authtoken.views import ObtainAuthToken
from rest_framework.authtoken.models import Token
from rest_framework import generics, permissions

from apps.user.serializers import UserSerializer
from apps.utils.filters.include_exclude import IncludeExcludeFilterSet
from apps.utils.pagination import SearchPagination
from apps.utils.views import ListSearchSerializersView
from apps.user.tasks import send_login_email
from .models import User
from .serializers import UserProfilePictureSerializer


class LoggedInUserView(RetrieveAPIView):
    """
    Returns the currently logged-in user.
    """

    def get(self, request, *args, **kwargs):
        permissions = {}
        for perm in request.user.get_all_permissions():
            _, codename = perm.split(".", 1)
            permissions[codename] = 1

        picture_url = (
            request.user.picture.file.url
            if request.user.picture and request.user.picture.file
            else None
        )

        return Response(
            {
                "id": request.user.pk,
                "email": request.user.email,
                "username": request.user.username,
                "name": request.user.get_full_name(),
                "is_impersonate": hasattr(request.user, "is_impersonate")
                and request.user.is_impersonate,
                "is_superuser": request.user.is_superuser,
                "language": request.user.language,
                "groups": [g.name for g in request.user.groups.all()],
                "department": request.user.department,
                "title": request.user.title,
                "permissions": permissions,
                "picture_url": picture_url,
            }
        )


class AuthToken(ObtainAuthToken):
    def post(self, request, *args, **kwargs):
        serializer = self.serializer_class(
            data=request.data, context={"request": request}
        )
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data["user"]
        token, created = Token.objects.get_or_create(user=user)

        # Send email in background
        send_login_email.delay(user.email, user.username)

        permissions = {}
        for perm in user.get_all_permissions():
            _, codename = perm.split(".", 1)
            permissions[codename] = 1

        picture_url = (
            user.picture.file.url if user.picture and user.picture.file else None
        )

        return Response(
            {
                "token": token.key,
                "id": user.id,
                "email": user.email,
                "username": user.username,
                "name": user.get_full_name(),
                "is_impersonate": hasattr(request.user, "is_impersonate")
                and request.user.is_impersonate,
                "is_superuser": user.is_superuser,
                "language": user.language,
                "groups": [g.name for g in user.groups.all()],
                "department": user.department,
                "title": user.title,
                "permissions": permissions,
                "picture_url": picture_url,
            }
        )


class ListUsersView(ListSearchSerializersView):
    """
    Returns a list of all users with search, include and exclude.
    EXAMPLE: /users/?search=John&include=1,2l&exclude=3,4
    """

    serializer_class = UserSerializer
    search_fields = ("first_name", "last_name", "email", "username")
    filterset_class = IncludeExcludeFilterSet
    ordering_fields = ("id", "is_active")
    pagination_class = SearchPagination


class UserProfilePictureUpdateView(generics.UpdateAPIView):
    serializer_class = UserProfilePictureSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user
