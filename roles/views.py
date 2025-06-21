from django.shortcuts import render
from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db import transaction, models
from django.shortcuts import get_object_or_404
from django.db.models import Q
from .models import Permission, Role, UserRole
from .serializers import (
    PermissionSerializer, RoleSerializer, RoleListSerializer, 
    UserRoleSerializer, RoleReorderSerializer, PermissionCategorySerializer
)
from rest_framework.views import APIView


class TestAPIView(APIView):
    """Test endpoint to verify API is working without authentication"""
    permission_classes = []  # No authentication required
    
    def get(self, request):
        return Response({
            'message': 'API is working!',
            'permissions_count': Permission.objects.count(),
            'roles_count': Role.objects.count()
        })


class PermissionViewSet(viewsets.ModelViewSet):
    queryset = Permission.objects.all()
    serializer_class = PermissionSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        queryset = Permission.objects.all()
        category = self.request.query_params.get('category', None)
        search = self.request.query_params.get('search', None)
        
        if category:
            queryset = queryset.filter(category=category)
        
        if search:
            queryset = queryset.filter(
                Q(name__icontains=search) | 
                Q(description__icontains=search) | 
                Q(category__icontains=search)
            )
        
        return queryset

    @action(detail=False, methods=['get'])
    def categories(self, request):
        """Get all permission categories with their permissions"""
        categories = {}
        permissions = Permission.objects.all().order_by('category', 'name')
        
        for permission in permissions:
            if permission.category not in categories:
                categories[permission.category] = []
            categories[permission.category].append(PermissionSerializer(permission).data)
        
        result = [
            {'category': category, 'permissions': permissions}
            for category, permissions in categories.items()
        ]
        
        return Response(result)


class RoleViewSet(viewsets.ModelViewSet):
    queryset = Role.objects.all()
    permission_classes = [permissions.IsAuthenticated]
    
    def get_serializer_class(self):
        if self.action == 'list':
            return RoleListSerializer
        return RoleSerializer

    def get_queryset(self):
        queryset = Role.objects.all()
        severity = self.request.query_params.get('severity', None)
        status_filter = self.request.query_params.get('status', None)
        search = self.request.query_params.get('search', None)
        
        if severity:
            queryset = queryset.filter(severity=severity)
        
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        if search:
            queryset = queryset.filter(
                Q(name__icontains=search) | 
                Q(description__icontains=search)
            )
        
        return queryset

    @action(detail=False, methods=['post'])
    def reorder(self, request):
        """Reorder roles by updating hierarchy positions"""
        serializer = RoleReorderSerializer(data=request.data, many=True)
        if serializer.is_valid():
            with transaction.atomic():
                for item in serializer.validated_data:
                    role = get_object_or_404(Role, id=item['role_id'])
                    role.hierarchy_position = item['new_position']
                    role.save()
            
            return Response({'message': 'Roles reordered successfully'})
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'])
    def duplicate(self, request, pk=None):
        """Duplicate a role with all its permissions"""
        role = self.get_object()
        
        with transaction.atomic():
            new_role = Role.objects.create(
                name=f"{role.name} (Copy)",
                description=role.description,
                severity=role.severity,
                status='Active',
                created_by=request.user
            )
            
            # Copy permissions
            new_role.permissions.set(role.permissions.all())
            
            # Set hierarchy position
            max_position = Role.objects.aggregate(models.Max('hierarchy_position'))['hierarchy_position__max']
            new_role.hierarchy_position = (max_position or 0) + 1
            new_role.save()
        
        return Response(RoleSerializer(new_role).data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'])
    def toggle_status(self, request, pk=None):
        """Toggle role status between Active and Inactive"""
        role = self.get_object()
        role.status = 'Inactive' if role.status == 'Active' else 'Active'
        role.save()
        return Response(RoleSerializer(role).data)


class UserRoleViewSet(viewsets.ModelViewSet):
    queryset = UserRole.objects.all()
    serializer_class = UserRoleSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        queryset = UserRole.objects.all()
        user_id = self.request.query_params.get('user', None)
        role_id = self.request.query_params.get('role', None)
        
        if user_id:
            queryset = queryset.filter(user_id=user_id)
        
        if role_id:
            queryset = queryset.filter(role_id=role_id)
        
        return queryset

    def perform_create(self, serializer):
        serializer.save(assigned_by=self.request.user)

    @action(detail=False, methods=['get'])
    def user_roles(self, request):
        """Get all roles assigned to a specific user"""
        user_id = request.query_params.get('user_id')
        if not user_id:
            return Response({'error': 'user_id parameter is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        user_roles = UserRole.objects.filter(user_id=user_id)
        return Response(UserRoleSerializer(user_roles, many=True).data)

    @action(detail=False, methods=['post'])
    def bulk_assign(self, request):
        """Assign multiple roles to multiple users"""
        user_ids = request.data.get('user_ids', [])
        role_ids = request.data.get('role_ids', [])
        
        if not user_ids or not role_ids:
            return Response({'error': 'user_ids and role_ids are required'}, status=status.HTTP_400_BAD_REQUEST)
        
        created_assignments = []
        with transaction.atomic():
            for user_id in user_ids:
                for role_id in role_ids:
                    user_role, created = UserRole.objects.get_or_create(
                        user_id=user_id,
                        role_id=role_id,
                        defaults={'assigned_by': request.user}
                    )
                    if created:
                        created_assignments.append(user_role)
        
        return Response({
            'message': f'{len(created_assignments)} role assignments created',
            'assignments': UserRoleSerializer(created_assignments, many=True).data
        }, status=status.HTTP_201_CREATED)
