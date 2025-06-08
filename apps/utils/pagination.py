from collections import OrderedDict
from rest_framework import pagination
from rest_framework.response import Response


class CustomPagination(pagination.PageNumberPagination):
    page_size = 20
    page_size_query_param = "page_size"
    max_page_size = 1000

    def get_paginated_response(self, data):
        return Response(
            OrderedDict(
                [
                    ("count", self.page.paginator.count),
                    ("total_pages", self.page.paginator.num_pages),
                    ("current_page", self.page.number),
                    (
                        "next",
                        (
                            self.page.number + 1
                            if self.page.number < self.page.paginator.num_pages
                            else None
                        ),
                    ),
                    (
                        "previous",
                        self.page.number - 1 if self.page.number > 1 else None,
                    ),
                    ("page_size", self.get_page_size(self.request)),
                    ("results", data),
                ]
            )
        )


class SearchPagination(pagination.PageNumberPagination):
    page_size = 5

    def get_paginated_response(self, data):
        return Response(data)
