from rest_framework.generics import RetrieveAPIView
from rest_framework.response import Response
from .models import Translation
from rest_framework.permissions import AllowAny
from decouple import config
from django.conf import settings


class TranslationView(RetrieveAPIView):
    permission_classes = [AllowAny]

    def get(self, request, *args, **kwargs):
        limit = config("TRANSLATION_LIMIT", default=2000, cast=int)
        app = kwargs.get("app")
        lang_code = kwargs.get("code")

        # Dynamically get allowed language codes from settings.LANGUAGES
        allowed_langs = {lang[0] for lang in settings.LANGUAGES}
        if lang_code not in allowed_langs:
            return Response(
                {
                    "error": f"Invalid language code '{lang_code}'. Allowed: {', '.join(allowed_langs)}"
                },
                status=400,
            )

        queryset = Translation.objects.values("key", lang_code)
        if app is not None:
            queryset = queryset.filter(app=app)
        translations = queryset[:limit]
        response = {t["key"]: t.get(lang_code, "") for t in translations}
        return Response(response)
