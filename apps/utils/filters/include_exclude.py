from django_filters import FilterSet
import django_filters


class IncludeExcludeFilterSet(FilterSet):
    exclude = django_filters.CharFilter(
        method="filter_exclude_ids", label="Exclude Ids"
    )
    include = django_filters.CharFilter(
        method="filter_include_ids", label="Include Ids"
    )

    @staticmethod
    def filter_exclude_ids(queryset, _, value):
        return queryset.exclude(id__in=value.split(","))

    @staticmethod
    def filter_include_ids(queryset, _, value):
        # trim and remove , at end from value
        value = value.strip().rstrip(",")
        return queryset.filter(id__in=value.split(","))

    class Meta:
        fields = {
            "id": ["in", "exact"],
        }
