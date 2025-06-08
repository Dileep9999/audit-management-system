from django.contrib import admin
from django.urls import path
from apps.user.views import (
    ListUsersView,
    LoggedInUserView,
    AuthToken,
    UserProfilePictureUpdateView,
)

urlpatterns = [
    path("", ListUsersView.as_view(), name="list_users"),
    path("whoami", LoggedInUserView.as_view()),
    path("api-token", AuthToken.as_view()),
    path(
        "profile/picture",
        UserProfilePictureUpdateView.as_view(),
        name="user-profile-picture-update",
    ),
]
