from django.test import TestCase
from django.contrib.auth import get_user_model
from django.urls import reverse
from django.utils import timezone
from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from rest_framework.authtoken.models import Token
from datetime import datetime, timedelta

from .models import (
    ChecklistTemplate, ChecklistField, Checklist, ChecklistResponse,
    FieldType
)

User = get_user_model()


class ChecklistModelTests(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        
        self.template = ChecklistTemplate.objects.create(
            name='Test Template',
            description='A test checklist template',
            category='Testing',
            created_by=self.user
        )
        
        self.field1 = ChecklistField.objects.create(
            template=self.template,
            label='Test Field 1',
            field_type=FieldType.TEXT,
            is_required=True,
            order=1
        )
        
        self.field2 = ChecklistField.objects.create(
            template=self.template,
            label='Test Field 2',
            field_type=FieldType.CHECKBOX,
            is_required=False,
            order=2
        )
    
    def test_template_creation(self):
        """Test creating a checklist template"""
        template = ChecklistTemplate.objects.create(
            name='New Template',
            description='Another test template',
            created_by=self.user
        )
        
        self.assertEqual(template.name, 'New Template')
        self.assertEqual(template.created_by, self.user)
        self.assertFalse(template.is_frozen)
        self.assertEqual(template.usage_count, 0)
    
    def test_template_freeze_unfreeze(self):
        """Test freezing and unfreezing templates"""
        self.assertFalse(self.template.is_frozen)
        
        # Freeze template
        self.template.freeze(self.user)
        self.assertTrue(self.template.is_frozen)
        self.assertEqual(self.template.frozen_by, self.user)
        self.assertIsNotNone(self.template.frozen_at)
        
        # Unfreeze template
        self.template.unfreeze()
        self.assertFalse(self.template.is_frozen)
        self.assertIsNone(self.template.frozen_by)
        self.assertIsNone(self.template.frozen_at)
    
    def test_template_usage_increment(self):
        """Test incrementing template usage count"""
        initial_count = self.template.usage_count
        self.template.increment_usage()
        self.assertEqual(self.template.usage_count, initial_count + 1)
    
    def test_checklist_creation(self):
        """Test creating a checklist from template"""
        checklist = Checklist.objects.create(
            template=self.template,
            name='Test Checklist',
            assigned_to=self.user,
            created_by=self.user
        )
        
        self.assertEqual(checklist.name, 'Test Checklist')
        self.assertEqual(checklist.template, self.template)
        self.assertEqual(checklist.status, 'draft')
        self.assertEqual(checklist.completion_percentage, 0)
    
    def test_checklist_progress_calculation(self):
        """Test checklist progress calculation"""
        checklist = Checklist.objects.create(
            template=self.template,
            name='Progress Test',
            assigned_to=self.user,
            created_by=self.user
        )
        
        # Create responses
        response1 = ChecklistResponse.objects.create(
            checklist=checklist,
            field=self.field1,
            value={'text': 'Test response'},
            is_completed=True
        )
        
        response2 = ChecklistResponse.objects.create(
            checklist=checklist,
            field=self.field2,
            value={'checked': False},
            is_completed=False
        )
        
        # Update progress
        checklist.update_progress()
        
        self.assertEqual(checklist.total_fields, 2)
        self.assertEqual(checklist.completed_fields, 1)
        self.assertEqual(checklist.get_progress_percentage(), 50)
    
    def test_field_validation(self):
        """Test field validation for select/radio fields"""
        # Test valid select field
        select_field = ChecklistField(
            template=self.template,
            label='Select Field',
            field_type=FieldType.SELECT,
            options=['Option 1', 'Option 2', 'Option 3']
        )
        
        try:
            select_field.full_clean()
        except Exception:
            self.fail("Valid select field should not raise validation error")
        
        # Test invalid select field (no options)
        invalid_field = ChecklistField(
            template=self.template,
            label='Invalid Select',
            field_type=FieldType.SELECT,
            options=[]
        )
        
        with self.assertRaises(Exception):
            invalid_field.full_clean()


class ChecklistAPITests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='apiuser',
            email='api@example.com',
            password='apipass123'
        )
        
        self.admin_user = User.objects.create_user(
            username='admin',
            email='admin@example.com',
            password='adminpass123',
            is_staff=True
        )
        
        self.token = Token.objects.create(user=self.user)
        self.admin_token = Token.objects.create(user=self.admin_user)
        
        self.client = APIClient()
        
        self.template = ChecklistTemplate.objects.create(
            name='API Test Template',
            description='Template for API testing',
            category='API',
            created_by=self.user
        )
        
        self.field = ChecklistField.objects.create(
            template=self.template,
            label='API Test Field',
            field_type=FieldType.TEXT,
            is_required=True,
            order=1
        )
    
    def authenticate(self, user_type='user'):
        """Helper method to authenticate requests"""
        if user_type == 'admin':
            self.client.credentials(HTTP_AUTHORIZATION='Token ' + self.admin_token.key)
        else:
            self.client.credentials(HTTP_AUTHORIZATION='Token ' + self.token.key)
    
    def test_create_template(self):
        """Test creating template via API"""
        self.authenticate()
        
        data = {
            'name': 'New API Template',
            'description': 'Created via API',
            'category': 'API Test',
            'fields': [
                {
                    'label': 'Name',
                    'field_type': 'text',
                    'is_required': True,
                    'order': 1
                },
                {
                    'label': 'Email',
                    'field_type': 'email',
                    'is_required': True,
                    'order': 2
                }
            ]
        }
        
        response = self.client.post('/api/checklists/templates/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['name'], 'New API Template')
        
        # Check that fields were created
        template = ChecklistTemplate.objects.get(id=response.data['id'])
        self.assertEqual(template.fields.count(), 2)
    
    def test_freeze_template(self):
        """Test freezing template via API"""
        self.authenticate()
        
        url = f'/api/checklists/templates/{self.template.id}/freeze/'
        response = self.client.post(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.template.refresh_from_db()
        self.assertTrue(self.template.is_frozen)
    
    def test_create_checklist_from_template(self):
        """Test creating checklist from template via API"""
        self.authenticate()
        
        data = {
            'template_id': self.template.id,
            'name': 'My Checklist',
            'description': 'Created from template',
            'priority': 'high',
            'due_date': (timezone.now() + timedelta(days=7)).isoformat()
        }
        
        response = self.client.post('/api/checklists/checklists/', data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['name'], 'My Checklist')
        
        # Check that responses were auto-created
        checklist = Checklist.objects.get(id=response.data['id'])
        self.assertEqual(checklist.responses.count(), 1)  # One field in template
    
    def test_submit_response(self):
        """Test submitting field response via API"""
        self.authenticate()
        
        # Create checklist first
        checklist = Checklist.objects.create(
            template=self.template,
            name='Response Test',
            assigned_to=self.user,
            created_by=self.user
        )
        
        # Create initial response
        ChecklistResponse.objects.create(
            checklist=checklist,
            field=self.field,
            value={}
        )
        
        # Submit response
        url = f'/api/checklists/checklists/{checklist.id}/submit_response/'
        data = {
            'field_id': self.field.id,
            'value': {'text': 'Test response value'},
            'is_completed': True,
            'comments': 'This is a test response'
        }
        
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Check that response was updated
        response_obj = ChecklistResponse.objects.get(checklist=checklist, field=self.field)
        self.assertTrue(response_obj.is_completed)
        self.assertEqual(response_obj.value['text'], 'Test response value')
    
    def test_get_checklist_progress(self):
        """Test getting checklist progress via API"""
        self.authenticate()
        
        # Create checklist with response
        checklist = Checklist.objects.create(
            template=self.template,
            name='Progress Test',
            assigned_to=self.user,
            created_by=self.user
        )
        
        ChecklistResponse.objects.create(
            checklist=checklist,
            field=self.field,
            value={'text': 'Done'},
            is_completed=True
        )
        
        checklist.update_progress()
        
        url = f'/api/checklists/checklists/{checklist.id}/progress/'
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['completion_percentage'], 100)
        self.assertEqual(response.data['completed_fields'], 1)
    
    def test_duplicate_template(self):
        """Test duplicating template via API"""
        self.authenticate()
        
        url = f'/api/checklists/templates/{self.template.id}/duplicate/'
        response = self.client.post(url)
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('Copy of', response.data['template']['name'])
        
        # Check that fields were copied
        new_template = ChecklistTemplate.objects.get(id=response.data['template']['id'])
        self.assertEqual(new_template.fields.count(), self.template.fields.count())
    
    def test_get_field_types(self):
        """Test getting available field types"""
        self.authenticate()
        
        url = '/api/checklists/templates/field_types/'
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIsInstance(response.data, list)
        self.assertTrue(len(response.data) > 0)
        
        # Check structure of field type data
        field_type = response.data[0]
        self.assertIn('value', field_type)
        self.assertIn('label', field_type)
    
    def test_unauthorized_access(self):
        """Test that unauthenticated requests are rejected"""
        # Don't authenticate
        
        response = self.client.get('/api/checklists/templates/')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        
        response = self.client.post('/api/checklists/templates/', {})
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
    
    def test_permissions(self):
        """Test user permissions for templates"""
        self.authenticate()
        
        # User should only see their own templates or public ones
        other_user = User.objects.create_user(
            username='other',
            email='other@example.com',
            password='otherpass'
        )
        
        private_template = ChecklistTemplate.objects.create(
            name='Private Template',
            description='Not visible to others',
            is_active=False,  # Not public
            created_by=other_user
        )
        
        response = self.client.get('/api/checklists/templates/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Should only see own template, not the private one
        template_ids = [t['id'] for t in response.data['results']]
        self.assertIn(self.template.id, template_ids)
        self.assertNotIn(private_template.id, template_ids)
