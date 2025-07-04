from django.conf import settings
from django.utils import translation


class UserLanguageMiddleware:
    """
    Custom middleware that works with Django's LocaleMiddleware
    to prioritize user profile language over cookies
    """
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # Skip language handling for set_language requests to avoid conflicts
        if request.path == "/i18n/setlang" or (
            hasattr(request, "resolver_match")
            and getattr(request.resolver_match, "url_name", "") == "set_language"
        ):
            return self.get_response(request)
        
        user = getattr(request, "user", None)
        
        # If user is authenticated and has a language preference, 
        # temporarily set it in the request so LocaleMiddleware picks it up
        if (
            user
            and user.is_authenticated
            and hasattr(user, "language")
            and user.language
            and translation.check_for_language(user.language)
        ):
            # Set a temporary cookie-like value for LocaleMiddleware to detect
            # This way we don't interfere with Django's built-in language detection
            request.COOKIES = request.COOKIES.copy()
            request.COOKIES[settings.LANGUAGE_COOKIE_NAME] = user.language
        
        response = self.get_response(request)
        
        # If user is authenticated and we activated their language,
        # ensure the cookie is updated to match their preference
        if (
            user
            and user.is_authenticated
            and hasattr(user, "language")
            and user.language
        ):
            response.set_cookie(
                settings.LANGUAGE_COOKIE_NAME,
                user.language,
                max_age=getattr(settings, "LANGUAGE_COOKIE_AGE", 60 * 60 * 24 * 365),
                path=getattr(settings, "LANGUAGE_COOKIE_PATH", "/"),
                domain=getattr(settings, "LANGUAGE_COOKIE_DOMAIN", None),
                secure=getattr(settings, "LANGUAGE_COOKIE_SECURE", False),
                httponly=getattr(settings, "LANGUAGE_COOKIE_HTTPONLY", False),
                samesite=getattr(settings, "LANGUAGE_COOKIE_SAMESITE", 'Lax'),
            )
        
        return response
