# views.py
import json
from django.conf import settings
from django.http import JsonResponse
from django.shortcuts import render
from decouple import config
from django.contrib.auth.views import LoginView
from django.views.i18n import set_language as django_set_language
from django.views.generic import TemplateView
from django.contrib.auth.mixins import LoginRequiredMixin
from django.utils.translation import gettext as _
from django.utils import translation
from django.views.decorators.csrf import csrf_exempt, ensure_csrf_cookie
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
import os
from django.middleware.csrf import get_token
from django.utils.decorators import method_decorator

AD_CONFIGS_LIST = json.loads(config("AD_CONFIGS_JSON"))


class HomeTemplateView(LoginRequiredMixin, TemplateView):
    template_name = os.path.join(settings.BASE_DIR, "ui", "index.html")
    login_url = "login"
    redirect_field_name = "next"

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context["message"] = _("hello")
        return context


@method_decorator(ensure_csrf_cookie, name='dispatch')
class CustomLoginView(LoginView):
    template_name = "registration/login.html"

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context["ad_keys"] = [item["key"] for item in AD_CONFIGS_LIST]
        return context

    def get(self, request, *args, **kwargs):
        # For API requests, return JSON with CSRF token
        if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
            return JsonResponse({
                'csrf_token': get_token(request),
                'ad_keys': [item["key"] for item in AD_CONFIGS_LIST]
            })
        return super().get(request, *args, **kwargs)

    def form_valid(self, form):
        response = super().form_valid(form)
        user = self.request.user

        # Handle "Remember Me" functionality
        remember_me = self.request.POST.get("remember_me")
        if remember_me:
            # Persistent session: set expiry to e.g. 30 days
            self.request.session.set_expiry(60 * 60 * 24 * 30)  # 30 days

        # Set language cookie and activate user's language
        if user.is_authenticated and hasattr(user, "language") and user.language:
            translation.activate(user.language)
            response.set_cookie(
                settings.LANGUAGE_COOKIE_NAME,
                user.language,
                max_age=getattr(settings, "LANGUAGE_COOKIE_AGE", None),
                path=getattr(settings, "LANGUAGE_COOKIE_PATH", "/"),
                domain=getattr(settings, "LANGUAGE_COOKIE_DOMAIN", None),
                secure=getattr(settings, "LANGUAGE_COOKIE_SECURE", False),
                httponly=getattr(settings, "LANGUAGE_COOKIE_HTTPONLY", False),
                samesite=getattr(settings, "LANGUAGE_COOKIE_SAMESITE", None),
            )

        # For API requests, return JSON response
        if self.request.headers.get('X-Requested-With') == 'XMLHttpRequest':
            return JsonResponse({
                'status': 'success',
                'user': {
                    'id': user.id,
                    'username': user.username,
                    'email': user.email,
                    'first_name': user.first_name,
                    'last_name': user.last_name,
                    'is_staff': user.is_staff,
                    'is_active': user.is_active,
                    'date_joined': user.date_joined.isoformat(),
                }
            })

        return response

    def form_invalid(self, form):
        # For API requests, return JSON response with errors
        if self.request.headers.get('X-Requested-With') == 'XMLHttpRequest':
            return JsonResponse({
                'status': 'error',
                'errors': form.errors
            }, status=400)
        return super().form_invalid(form)


def custom_404_view(request, exception=None):
    if request.path.startswith("/api/"):
        return JsonResponse({"detail": "Not found."}, status=404)
    else:
        return render(request, "404.html", status=404)


def custom_set_language(request):
    response = django_set_language(request)
    lang_code = request.POST.get("language")
    is_admin = "/" + settings.ADMIN_SITE_URL in request.META.get("HTTP_REFERER", "")
    user = request.impersonator if is_admin and request.impersonator else request.user
    if user and user.is_authenticated:
        if lang_code:
            user.language = lang_code
            user.save()
    return response


class SetLanguageAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        lang_code = (
            request.data.get("language")
            or request.POST.get("language")
            or request.query_params.get("language")
        )
        if lang_code and translation.check_for_language(lang_code):
            translation.activate(lang_code)
            request.user.language = lang_code
            request.user.save()
            return Response({"status": "success", "language": lang_code})
        return Response(
            {"status": "error", "message": _("Invalid language code")},
            status=status.HTTP_400_BAD_REQUEST,
        )
