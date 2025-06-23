from django.test import TestCase
from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework.test import APITestCase, APIClient
from rest_framework import status
from django.contrib.auth.models import Group, Permission

User = get_user_model()


class UserModelTests(TestCase):
    def setUp(self):
        self.user_data = {
            'username': 'testuser',
            'email': 'test@example.com',
            'first_name': 'Test',
            'last_name': 'User',
            'department': 'IT',
            'title': 'Developer'
        }

    def test_create_user(self):
        """Test creating a regular user"""
        user = User.objects.create_user(
            password='testpass123',
            **self.user_data
        )
        self.assertEqual(user.username, 'testuser')
        self.assertEqual(user.email, 'test@example.com')
        self.assertTrue(user.check_password('testpass123'))
        self.assertTrue(user.is_active)
        self.assertFalse(user.is_staff)
        self.assertFalse(user.is_superuser)

    def test_create_superuser(self):
        """Test creating a superuser"""
        admin_user = User.objects.create_superuser(
            username='admin',
            email='admin@example.com',
            password='adminpass123'
        )
        self.assertTrue(admin_user.is_staff)
        self.assertTrue(admin_user.is_superuser)

    def test_user_str_method(self):
        """Test the user string representation"""
        user = User.objects.create_user(**self.user_data, password='testpass123')
        self.assertEqual(str(user), 'testuser')

    def test_get_full_name(self):
        """Test the get_full_name method"""
        user = User.objects.create_user(**self.user_data, password='testpass123')
        self.assertEqual(user.get_full_name(), 'Test User')


class UserAPITests(APITestCase):
    def setUp(self):
        self.client = APIClient()
        
        # Create a superuser for authenticated requests
        self.admin_user = User.objects.create_superuser(
            username='admin',
            email='admin@example.com',
            password='adminpass123'
        )
        
        # Create a regular user
        self.regular_user = User.objects.create_user(
            username='regular',
            email='regular@example.com',
            password='regularpass123',
            first_name='Regular',
            last_name='User'
        )

    def test_create_user_as_admin(self):
        """Test creating a user as an admin"""
        self.client.force_authenticate(user=self.admin_user)
        
        url = reverse('create_user')
        data = {
            'username': 'newuser',
            'email': 'newuser@example.com',
            'first_name': 'New',
            'last_name': 'User',
            'password': 'newuserpass123',
            'password_confirm': 'newuserpass123',
            'department': 'HR',
            'title': 'Manager'
        }
        
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('message', response.data)
        self.assertIn('user', response.data)
        
        # Verify the user was created
        new_user = User.objects.get(username='newuser')
        self.assertEqual(new_user.email, 'newuser@example.com')
        self.assertTrue(new_user.check_password('newuserpass123'))

    def test_create_user_unauthenticated(self):
        """Test creating a user without authentication"""
        url = reverse('create_user')
        data = {
            'username': 'newuser',
            'email': 'newuser@example.com',
            'password': 'newuserpass123',
            'password_confirm': 'newuserpass123'
        }
        
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_create_user_as_regular_user(self):
        """Test creating a user as a regular user (should fail)"""
        self.client.force_authenticate(user=self.regular_user)
        
        url = reverse('create_user')
        data = {
            'username': 'newuser',
            'email': 'newuser@example.com',
            'password': 'newuserpass123',
            'password_confirm': 'newuserpass123'
        }
        
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_create_user_with_existing_email(self):
        """Test creating a user with an existing email"""
        self.client.force_authenticate(user=self.admin_user)
        
        url = reverse('create_user')
        data = {
            'username': 'newuser',
            'email': 'admin@example.com',  # This email already exists
            'password': 'newuserpass123',
            'password_confirm': 'newuserpass123'
        }
        
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('email', response.data)

    def test_create_user_with_mismatched_passwords(self):
        """Test creating a user with mismatched passwords"""
        self.client.force_authenticate(user=self.admin_user)
        
        url = reverse('create_user')
        data = {
            'username': 'newuser',
            'email': 'newuser@example.com',
            'password': 'newuserpass123',
            'password_confirm': 'differentpass123'
        }
        
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('password_confirm', response.data)

    def test_get_user(self):
        """Test retrieving a specific user"""
        self.client.force_authenticate(user=self.admin_user)
        
        url = reverse('get_user', kwargs={'pk': self.regular_user.pk})
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['username'], 'regular')
        self.assertEqual(response.data['email'], 'regular@example.com')

    def test_update_user(self):
        """Test updating a user"""
        self.client.force_authenticate(user=self.admin_user)
        
        url = reverse('update_user', kwargs={'pk': self.regular_user.pk})
        data = {
            'first_name': 'Updated',
            'last_name': 'Name',
            'department': 'Finance'
        }
        
        response = self.client.patch(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('message', response.data)
        self.assertIn('user', response.data)
        
        # Verify the user was updated
        updated_user = User.objects.get(pk=self.regular_user.pk)
        self.assertEqual(updated_user.first_name, 'Updated')
        self.assertEqual(updated_user.department, 'Finance')

    def test_delete_user(self):
        """Test soft deleting a user"""
        self.client.force_authenticate(user=self.admin_user)
        
        # Create a user to delete
        user_to_delete = User.objects.create_user(
            username='deleteme',
            email='delete@example.com',
            password='deletepass123'
        )
        
        url = reverse('delete_user', kwargs={'pk': user_to_delete.pk})
        response = self.client.delete(url)
        
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        
        # Verify the user was soft deleted
        user_to_delete.refresh_from_db()
        self.assertTrue(user_to_delete.is_deleted)
        self.assertIsNotNone(user_to_delete.deleted_at)
        self.assertEqual(user_to_delete.deleted_by, self.admin_user)

    def test_delete_superuser_forbidden(self):
        """Test that deleting a superuser is forbidden"""
        self.client.force_authenticate(user=self.admin_user)
        
        url = reverse('delete_user', kwargs={'pk': self.admin_user.pk})
        response = self.client.delete(url)
        
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        self.assertIn('error', response.data)

    def test_list_users(self):
        """Test listing users"""
        self.client.force_authenticate(user=self.admin_user)
        
        url = reverse('list_users')
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('results', response.data)
        self.assertTrue(len(response.data['results']) >= 2)  # At least admin and regular user
