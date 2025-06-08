from django.conf import settings
from django.utils import translation


class UserLanguageMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        if request.path == "/i18n/setlang" or (
            hasattr(request, "resolver_match")
            and getattr(request.resolver_match, "url_name", "") == "set_language"
        ):
            return self.get_response(request)
        user = getattr(request, "user", None)
        lang = None
        print(
            f"User: {user}, Authenticated: {getattr(user, 'is_authenticated', False)}"
        )
        print(f"User language: {getattr(user, 'language', None)}")
        # Check if user is authenticated and has a language set
        if (
            user
            and user.is_authenticated
            and hasattr(user, "language")
            and user.language
        ):
            translation.activate(user.language)
            request.LANGUAGE_CODE = user.language
            lang = user.language
        response = self.get_response(request)
        if lang:
            response.set_cookie(
                settings.LANGUAGE_COOKIE_NAME,
                lang,
                max_age=getattr(settings, "LANGUAGE_COOKIE_AGE", None),
                path=getattr(settings, "LANGUAGE_COOKIE_PATH", "/"),
                domain=getattr(settings, "LANGUAGE_COOKIE_DOMAIN", None),
                secure=getattr(settings, "LANGUAGE_COOKIE_SECURE", False),
                httponly=getattr(settings, "LANGUAGE_COOKIE_HTTPONLY", False),
                samesite=getattr(settings, "LANGUAGE_COOKIE_SAMESITE", None),
            )
        return response
