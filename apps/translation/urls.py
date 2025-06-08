from django.urls import path
from .views import TranslationView

# api/translation/
urlpatterns = [
    path("<str:code>", TranslationView.as_view()),
]
