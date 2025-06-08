from django_filters import FilterSet
import django_filters


class PlanTeamFilterSet(FilterSet):
    team = django_filters.CharFilter(method="team", label="Teams: Ex: 1,2,3")

    @staticmethod
    def team(queryset, _, value):
        return queryset.exclude(team__in=value.split(","))

    class Meta:
        fields = {
            "team": ["in", "exact"],
        }
