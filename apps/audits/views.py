from django.shortcuts import render
from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils.translation import gettext_lazy as _
from django.db.models import Q
from .models import Audit, AuditType, AuditStatus, CustomAuditType
from .serializers import AuditSerializer, CustomAuditTypeSerializer
import logging

logger = logging.getLogger(__name__)

# Create your views here.

class CustomAuditTypeViewSet(viewsets.ModelViewSet):
    queryset = CustomAuditType.objects.all()
    serializer_class = CustomAuditTypeSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """
        Filter queryset to show only active types by default,
        unless explicitly requested all types
        """
        queryset = super().get_queryset()
        show_all = self.request.query_params.get('show_all', 'false').lower() == 'true'
        if not show_all:
            queryset = queryset.filter(is_active=True)
        return queryset

    def destroy(self, request, *args, **kwargs):
        """
        Soft delete by setting is_active to False instead of actual deletion
        """
        instance = self.get_object()
        if instance.audits.exists():
            return Response(
                {'detail': _('Cannot delete audit type that is being used by audits.')},
                status=status.HTTP_400_BAD_REQUEST
            )
        instance.is_active = False
        instance.save()
        return Response(status=status.HTTP_204_NO_CONTENT)

class AuditViewSet(viewsets.ModelViewSet):
    queryset = Audit.objects.all()
    serializer_class = AuditSerializer
    permission_classes = [permissions.IsAuthenticated]

    def create(self, request, *args, **kwargs):
        """
        Override create method to add debugging
        """
        logger.info(f"Creating audit with user: {request.user}")
        logger.info(f"User authenticated: {request.user.is_authenticated}")
        logger.info(f"Request data: {request.data}")
        
        try:
            return super().create(request, *args, **kwargs)
        except Exception as e:
            logger.error(f"Error creating audit: {e}")
            return Response(
                {'detail': f'Error creating audit: {str(e)}'},
                status=status.HTTP_400_BAD_REQUEST
            )

    def get_queryset(self):
        """
        Filter audits based on query parameters
        """
        queryset = super().get_queryset()
        
        # Filter by audit type
        audit_type = self.request.query_params.get('audit_type', None)
        if audit_type:
            queryset = queryset.filter(
                Q(audit_type=audit_type) | 
                Q(custom_audit_type__name__iexact=audit_type)
            )

        # Filter by status
        status_filter = self.request.query_params.get('status', None)
        if status_filter:
            queryset = queryset.filter(status=status_filter)

        # Filter by date range
        from_date = self.request.query_params.get('from_date', None)
        to_date = self.request.query_params.get('to_date', None)
        if from_date and to_date:
            queryset = queryset.filter(
                period_from__gte=from_date,
                period_to__lte=to_date
            )

        return queryset

    def list(self, request, *args, **kwargs):
        """
        Override list method to ensure we always return a list
        """
        queryset = self.filter_queryset(self.get_queryset())
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def audit_types(self, request):
        """
        Return all available audit types (both system and custom)
        """
        system_types = [{'id': t[0], 'name': t[1], 'is_system': True} for t in AuditType.choices]
        custom_types = CustomAuditType.objects.filter(is_active=True).values('id', 'name')
        custom_types = [{'id': t['id'], 'name': t['name'], 'is_system': False} for t in custom_types]
        
        return Response(system_types + custom_types)

    @action(detail=False, methods=['get'])
    def audit_statuses(self, request):
        """
        Return all available audit statuses
        """
        return Response([{'id': s[0], 'name': s[1]} for s in AuditStatus.choices])
