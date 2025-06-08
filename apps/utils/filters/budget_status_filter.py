from django_filters import FilterSet
import django_filters
from django_filters import rest_framework as filters

from apps.budget_collection.models.budget import FINBudgetAllocation


class ListFilter(filters.BaseInFilter, filters.CharFilter):
    pass


class BudgetStatusFilterSet(FilterSet):
    status__in = ListFilter(field_name="status", lookup_expr="in")

    class Meta:
        model = FINBudgetAllocation
        fields = [
            "status__in",
            "budget_group__budget_plan",
            "budget_group__team",
            "budget_group",
            "budget_group__budget_plan__budget_year",
            "budget_group__child_organization",
            "budget_group__department",
            "budget_project",
            "budget_initiative",
            "account_number",
            "status",
            "priority",
            "created_by",
        ]
