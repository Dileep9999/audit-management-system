from django.contrib import admin
from django.urls import path
from apps.user.views import (
    ListUsersView,
    LoggedInUserView,
    AuthToken,
    UserProfilePictureUpdateView,
    CreateUserView,
    GetUserView,
    UpdateUserView,
    DeleteUserView,
)

# api/users/
urlpatterns = [
    path("", ListUsersView.as_view(), name="list_users"),
    path("create/", CreateUserView.as_view(), name="create_user"),
    path("<int:pk>/", GetUserView.as_view(), name="get_user"),
    path("<int:pk>/update/", UpdateUserView.as_view(), name="update_user"),
    path("<int:pk>/delete/", DeleteUserView.as_view(), name="delete_user"),
    path("whoami/", LoggedInUserView.as_view(), name="logged_in_user"),
    path("api-token/", AuthToken.as_view(), name="auth_token"),
    path(
        "profile/picture/",
        UserProfilePictureUpdateView.as_view(),
        name="user-profile-picture-update",
    ),
]
