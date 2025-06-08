from django.contrib import admin
from django.urls import reverse
from .models import Translation
from import_export.admin import ImportExportModelAdmin
from import_export import resources


class TranslationResource(resources.ModelResource):
    class Meta:
        model = Translation


class TranslationAdmin(ImportExportModelAdmin):
    # change_list_template = 'admin/translation/translation/change_list.html'
    # def changelist_view(self, request, extra_context=None):
    #     extra_context = extra_context or {}
    #     extra_context['rosetta_url'] = reverse('rosetta-old-home-redirect')
    #     return super().changelist_view(request, extra_context=extra_context)

    resource_class = TranslationResource
    list_display = ["key", "ar", "en", "app"]
    list_filter = ["app"]
    search_fields = ["key", "ar", "en", "app"]

    class Media:
        js = ("custom_translate.js",)


admin.site.register(Translation, TranslationAdmin)
