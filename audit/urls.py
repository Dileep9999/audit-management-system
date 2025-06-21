"""
URL configuration for audit project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/5.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""

from django.contrib import admin
from django.urls import include, path
from django.contrib.auth.views import LoginView, LogoutView
from django.conf import settings
from django.views.static import serve
from django.conf.urls.static import static
from django.urls import re_path
from django.conf.urls import handler404
import os

from apps.user.admin_views import custom_dashboard
from .views import (
    CustomLoginView,
    HomeTemplateView,
    SetLanguageAPIView,
    custom_404_view,
    custom_set_language,
)
from django.utils.translation import gettext as _

handler404 = custom_404_view
admin.site.site_header = _("Audit Management Administration")
admin.site.site_title = _("Audit Management Admin Portal")

urlpatterns = [
    path(
        f"{settings.ADMIN_SITE_URL}/dashboard/",
        custom_dashboard,
        name="custom_dashboard",
    ),
    path(settings.ADMIN_SITE_URL, admin.site.urls),
    path("impersonate/", include("impersonate.urls")),
    path("", HomeTemplateView.as_view(), name="home"),
    path(
        "login",
        CustomLoginView.as_view(redirect_authenticated_user=True, next_page="/"),
        name="login",
    ),
    path("logout", LogoutView.as_view(next_page="login"), name="logout"),
    path("rosetta/", include("rosetta.urls")),
    path("i18n/setlang", custom_set_language, name="set_language"),
    path("api/setlang", SetLanguageAPIView.as_view(), name="set_language_api"),
    path("api/translation/", include("apps.translation.urls")),
    path("api/users/", include("apps.user.urls")),
    path("api/notifications/", include("apps.notifications.urls")),
    path("api/files/", include("apps.files.urls")),
    path("api/roles/", include("roles.urls")),
    path("api/workflows/", include("workflows.urls")),
]

if settings.DEBUG:
    urlpatterns += [
        re_path(
            r"^media/(?P<path>.*)$",
            serve,
            {
                "document_root": settings.MEDIA_ROOT,
            },
        ),
        re_path(
            r"^assets/(?P<path>.*)$",
            serve,
            {
                "document_root": "static/angular/assets",
            },
        ),
        # Serve React frontend static files
        re_path(
            r"^static/(?P<path>.*)$",
            serve,
            {
                "document_root": os.path.join(settings.BASE_DIR, "ui", "dist"),
            },
        ),
        # Serve React frontend assets
        re_path(
            r"^assets/(?P<path>.*)$",
            serve,
            {
                "document_root": os.path.join(settings.BASE_DIR, "ui", "public"),
            },
        ),
    ]
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
