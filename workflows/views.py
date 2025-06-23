from django.shortcuts import render
from rest_framework import viewsets, permissions
from rest_framework.response import Response
from rest_framework.decorators import action
from .models import Workflow
from .serializers import WorkflowSerializer

# Create your views here.

class WorkflowViewSet(viewsets.ModelViewSet):
    serializer_class = WorkflowSerializer
    permission_classes = [permissions.AllowAny]  # Temporary: Allow unauthenticated access for debugging

    def get_queryset(self):
        # Temporary: Return all workflows instead of filtering by user for debugging
        return Workflow.objects.all()
        # Original: return Workflow.objects.filter(created_by=self.request.user)

    def perform_create(self, serializer):
        # Only set created_by if user is authenticated
        if self.request.user.is_authenticated:
            serializer.save(created_by=self.request.user)
        else:
            serializer.save()

    @action(detail=True, methods=['post'])
    def duplicate(self, request, pk=None):
        workflow = self.get_object()
        new_workflow = Workflow.objects.create(
            name=f"Copy of {workflow.name}",
            created_by=request.user,
            data=workflow.data
        )
        serializer = self.get_serializer(new_workflow)
        return Response(serializer.data)
