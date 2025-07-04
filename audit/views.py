# views.py
import json
from django.conf import settings
from django.http import JsonResponse
from django.shortcuts import render
from decouple import config
from django.contrib.auth.views import LoginView, LogoutView
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


class ReactAppView(LoginRequiredMixin, TemplateView):
    """Serves the React app for all non-API routes"""
    template_name = os.path.join(settings.BASE_DIR, "static", "dist", "index.html")
    login_url = "login"
    redirect_field_name = "next"

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context["message"] = _("hello")
        return context


class HomeTemplateView(LoginRequiredMixin, TemplateView):
    template_name = os.path.join(settings.BASE_DIR, "static", "dist", "index.html")
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
        # If user is already authenticated, serve React index.html
        if request.user.is_authenticated:
            try:
                # Path to React build index.html
                react_index_path = os.path.join(settings.BASE_DIR, "static", "dist", "index.html")
                if os.path.exists(react_index_path):
                    with open(react_index_path, 'r', encoding='utf-8') as f:
                        content = f.read()
                    from django.http import HttpResponse
                    response = HttpResponse(content, content_type='text/html')
                    # Set base URL for assets
                    response['X-Frame-Options'] = 'SAMEORIGIN'
                    return response
                else:
                    # Fallback to Django template if React build doesn't exist
                    return super().get(request, *args, **kwargs)
            except Exception as e:
                print(f"Error serving React index.html: {e}")
                return super().get(request, *args, **kwargs)
        
        # For API requests, return JSON with CSRF token
        if request.headers.get('X-Requested-With') == 'XMLHttpRequest':
            return JsonResponse({
                'csrf_token': get_token(request),
                'ad_keys': [item["key"] for item in AD_CONFIGS_LIST]
            })
        return super().get(request, *args, **kwargs)

    def get_success_url(self):
        """Redirect to UI dashboard after successful login"""
        next_url = self.request.GET.get('next')
        if next_url:
            # If there's a next parameter, use it but ensure it goes to the UI
            if next_url.startswith('/#'):
                return next_url
            elif next_url == '/':
                return '/#/dashboard'
            else:
                return f'/#/{next_url.lstrip("/")}'
        return '/#/dashboard'

    def form_valid(self, form):
        response = super().form_valid(form)
        user = self.request.user

        # Handle "Remember Me" functionality
        remember_me = self.request.POST.get("remember_me")
        if remember_me:
            # Persistent session: set expiry to e.g. 30 days
            self.request.session.set_expiry(60 * 60 * 24 * 30)  # 30 days

        # Check if there's a language cookie set from the login page
        login_language = self.request.COOKIES.get(settings.LANGUAGE_COOKIE_NAME)
        
        if login_language and translation.check_for_language(login_language):
            # Use the language from the login page
            translation.activate(login_language)
            # Update user's profile language to match
            if user.is_authenticated and hasattr(user, "language"):
                user.language = login_language
                user.save()
            # Keep the existing cookie (don't override it)
            print(f"Using login page language: {login_language}")
        elif user.is_authenticated and hasattr(user, "language") and user.language:
            # Fallback to user's profile language if no login page language
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
            print(f"Using user profile language: {user.language}")
        else:
            # Default to English if no language is set
            translation.activate('en')
            response.set_cookie(
                settings.LANGUAGE_COOKIE_NAME,
                'en',
                max_age=getattr(settings, "LANGUAGE_COOKIE_AGE", None),
                path=getattr(settings, "LANGUAGE_COOKIE_PATH", "/"),
                domain=getattr(settings, "LANGUAGE_COOKIE_DOMAIN", None),
                secure=getattr(settings, "LANGUAGE_COOKIE_SECURE", False),
                httponly=getattr(settings, "LANGUAGE_COOKIE_HTTPONLY", False),
                samesite=getattr(settings, "LANGUAGE_COOKIE_SAMESITE", None),
            )
            print("Using default language: en")

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
                },
                'redirect_url': '/#/dashboard'
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


class CustomLogoutView(LogoutView):
    """Custom logout view that accepts both GET and POST requests"""
    http_method_names = ['get', 'post']
    next_page = '/login/'
    
    def get(self, request, *args, **kwargs):
        """Handle GET requests by performing logout"""
        return self.post(request, *args, **kwargs)


def custom_404_view(request, exception=None):
    if request.path.startswith("/api/"):
        return JsonResponse({"detail": "Not found."}, status=404)
    else:
        return render(request, "404.html", status=404)


def custom_set_language(request):
    """Enhanced language switching that works with Django's LocaleMiddleware"""
    # Let Django's built-in set_language handle the cookie and language activation
    response = django_set_language(request)
    
    # Save the language to user profile if authenticated
    lang_code = request.POST.get("language")
    if lang_code and translation.check_for_language(lang_code):
        is_admin = "/" + settings.ADMIN_SITE_URL in request.META.get("HTTP_REFERER", "")
        user = request.impersonator if is_admin and request.impersonator else request.user
        if user and user.is_authenticated:
            user.language = lang_code
            user.save()
            print(f"Updated user {user.username} language to: {lang_code}")
    
    # Debug logging
    print(f"Language change request: {lang_code}")
    print(f"Response cookies: {response.cookies}")
    print(f"Current language: {translation.get_language()}")
    
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
            
            # Set the language cookie
            response = Response({"status": "success", "language": lang_code})
            response.set_cookie(
                settings.LANGUAGE_COOKIE_NAME,
                lang_code,
                max_age=getattr(settings, "LANGUAGE_COOKIE_AGE", 60 * 60 * 24 * 365),
                path=getattr(settings, "LANGUAGE_COOKIE_PATH", "/"),
                domain=getattr(settings, "LANGUAGE_COOKIE_DOMAIN", None),
                secure=getattr(settings, "LANGUAGE_COOKIE_SECURE", False),
                httponly=getattr(settings, "LANGUAGE_COOKIE_HTTPONLY", False),
                samesite=getattr(settings, "LANGUAGE_COOKIE_SAMESITE", 'Lax'),
            )
            return response
        return Response(
            {"status": "error", "message": _("Invalid language code")},
            status=status.HTTP_400_BAD_REQUEST,
        )
