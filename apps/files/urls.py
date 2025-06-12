from django.urls import path
from .views import FileUploadView

# api/files/
urlpatterns = [
    path("upload/", FileUploadView.as_view(), name="file-upload"),
]
