# User Creation API Documentation

This document provides comprehensive information about the User Creation API endpoints in the Audit Management System.

## Overview

The User Creation API provides full CRUD (Create, Read, Update, Delete) operations for user management. All endpoints require proper authentication and authorization.

## Authentication

All user management endpoints require authentication using Token Authentication:

```http
Authorization: Token <your-token-here>
```

Get your token by calling the authentication endpoint:

```http
POST /api/users/api-token/
Content-Type: application/json

{
    "username": "your_username",
    "password": "your_password"
}
```

## API Endpoints

### 1. Create User

Create a new user account.

**Endpoint:** `POST /api/users/create/`

**Permissions:** Requires `IsAuthenticated` and `IsAdminUser`

**Request Body:**
```json
{
    "username": "newuser",
    "email": "newuser@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "password": "SecurePassword123!",
    "password_confirm": "SecurePassword123!",
    "department": "IT",
    "title": "Developer",
    "language": "en",
    "is_active": true,
    "is_staff": false
}
```

**Response (201 Created):**
```json
{
    "message": "User created successfully.",
    "user": {
        "id": 123,
        "username": "newuser",
        "email": "newuser@example.com",
        "first_name": "John",
        "last_name": "Doe",
        "full_name": "John Doe",
        "is_active": true,
        "is_staff": false,
        "is_superuser": false,
        "department": "IT",
        "title": "Developer",
        "language": "en",
        "picture_url": null,
        "date_joined": "2024-01-15T10:30:00Z",
        "last_login": null,
        "created_at": "2024-01-15T10:30:00Z",
        "updated_at": "2024-01-15T10:30:00Z"
    }
}
```

**Validation Rules:**
- Username must be unique
- Email must be unique and valid
- Password must meet Django's password validation requirements
- Password confirmation must match password
- Language must be one of the configured languages ('en', 'ar')

---

### 2. Get User

Retrieve details of a specific user.

**Endpoint:** `GET /api/users/{user_id}/`

**Permissions:** Requires `IsAuthenticated`

**Response (200 OK):**
```json
{
    "id": 123,
    "username": "newuser",
    "email": "newuser@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "full_name": "John Doe",
    "is_active": true,
    "is_staff": false,
    "is_superuser": false,
    "department": "IT",
    "title": "Developer",
    "language": "en",
    "picture_url": null,
    "date_joined": "2024-01-15T10:30:00Z",
    "last_login": "2024-01-15T14:20:00Z",
    "created_at": "2024-01-15T10:30:00Z",
    "updated_at": "2024-01-15T10:30:00Z"
}
```

---

### 3. Update User

Update an existing user's information.

**Endpoint:** `PATCH /api/users/{user_id}/update/`

**Permissions:** Requires `IsAuthenticated` and `IsAdminUser`

**Request Body (all fields optional):**
```json
{
    "first_name": "Jane",
    "last_name": "Smith",
    "department": "Finance",
    "title": "Senior Developer",
    "language": "ar",
    "is_active": false,
    "is_staff": true,
    "password": "NewPassword123!",
    "password_confirm": "NewPassword123!"
}
```

**Response (200 OK):**
```json
{
    "message": "User updated successfully.",
    "user": {
        "id": 123,
        "username": "newuser",
        "email": "newuser@example.com",
        "first_name": "Jane",
        "last_name": "Smith",
        "full_name": "Jane Smith",
        "is_active": false,
        "is_staff": true,
        "is_superuser": false,
        "department": "Finance",
        "title": "Senior Developer",
        "language": "ar",
        "picture_url": null,
        "date_joined": "2024-01-15T10:30:00Z",
        "last_login": "2024-01-15T14:20:00Z",
        "created_at": "2024-01-15T10:30:00Z",
        "updated_at": "2024-01-15T15:45:00Z"
    }
}
```

**Notes:**
- Username and email cannot be updated (read-only)
- Password is optional; if provided, password_confirm is required
- Only provided fields will be updated (partial update)

---

### 4. List Users

Get a paginated list of users with optional search and filtering.

**Endpoint:** `GET /api/users/`

**Permissions:** Requires `IsAuthenticated`

**Query Parameters:**
- `search`: Search by first name, last name, email, or username
- `ordering`: Order by fields (e.g., `id`, `-id`, `is_active`)
- `limit`: Number of results per page (default: 50)
- `offset`: Pagination offset
- `include`: Include specific user IDs (comma-separated)
- `exclude`: Exclude specific user IDs (comma-separated)

**Examples:**
```http
GET /api/users/?search=john&limit=10
GET /api/users/?ordering=-created_at&limit=20
GET /api/users/?include=1,2,3
GET /api/users/?exclude=4,5,6
```

**Response (200 OK):**
```json
{
    "count": 50,
    "next": "http://localhost:8000/api/users/?limit=10&offset=10",
    "previous": null,
    "results": [
        {
            "id": 123,
            "username": "user1",
            "email": "user1@example.com",
            "first_name": "John",
            "last_name": "Doe",
            "full_name": "John Doe",
            "is_active": true,
            "is_staff": false,
            "is_superuser": false,
            "department": "IT",
            "title": "Developer",
            "language": "en",
            "picture_url": null,
            "date_joined": "2024-01-15T10:30:00Z",
            "last_login": "2024-01-15T14:20:00Z",
            "created_at": "2024-01-15T10:30:00Z",
            "updated_at": "2024-01-15T10:30:00Z"
        }
    ]
}
```

---

### 5. Delete User (Soft Delete)

Soft delete a user account (sets `is_deleted=True`).

**Endpoint:** `DELETE /api/users/{user_id}/delete/`

**Permissions:** Requires `IsAuthenticated` and `IsAdminUser`

**Response (204 No Content):**
```json
{
    "message": "User deleted successfully."
}
```

**Restrictions:**
- Cannot delete superuser accounts
- Cannot delete your own account
- User is soft deleted (can be restored if needed)

---

### 6. Get Current User

Get information about the currently authenticated user.

**Endpoint:** `GET /api/users/whoami/`

**Permissions:** Requires `IsAuthenticated`

**Response (200 OK):**
```json
{
    "id": 1,
    "email": "admin@example.com",
    "username": "admin",
    "name": "Admin User",
    "is_impersonate": false,
    "is_superuser": true,
    "language": "en",
    "groups": ["Administrators"],
    "department": "IT",
    "title": "System Administrator",
    "permissions": {
        "add_user": 1,
        "change_user": 1,
        "delete_user": 1,
        "view_user": 1
    },
    "picture_url": null
}
```

---

## Error Responses

### 400 Bad Request
```json
{
    "email": ["A user with this email already exists."],
    "password_confirm": ["The two password fields didn't match."]
}
```

### 401 Unauthorized
```json
{
    "detail": "Authentication credentials were not provided."
}
```

### 403 Forbidden
```json
{
    "detail": "You do not have permission to perform this action."
}
```

### 404 Not Found
```json
{
    "detail": "Not found."
}
```

---

## Usage Examples

### Python (using requests)

```python
import requests

# Authentication
auth_response = requests.post('http://localhost:8000/api/users/api-token/', {
    'username': 'admin',
    'password': 'admin123'
})
token = auth_response.json()['token']

headers = {'Authorization': f'Token {token}'}

# Create user
user_data = {
    'username': 'newuser',
    'email': 'newuser@example.com',
    'first_name': 'John',
    'last_name': 'Doe',
    'password': 'SecurePassword123!',
    'password_confirm': 'SecurePassword123!',
    'department': 'IT',
    'title': 'Developer'
}

response = requests.post(
    'http://localhost:8000/api/users/create/',
    json=user_data,
    headers=headers
)

if response.status_code == 201:
    print("User created successfully!")
    user = response.json()['user']
    print(f"User ID: {user['id']}")
```

### JavaScript (using fetch)

```javascript
// Authentication
const authResponse = await fetch('http://localhost:8000/api/users/api-token/', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
    },
    body: JSON.stringify({
        username: 'admin',
        password: 'admin123'
    })
});

const { token } = await authResponse.json();

// Create user
const userData = {
    username: 'newuser',
    email: 'newuser@example.com',
    first_name: 'John',
    last_name: 'Doe',
    password: 'SecurePassword123!',
    password_confirm: 'SecurePassword123!',
    department: 'IT',
    title: 'Developer'
};

const response = await fetch('http://localhost:8000/api/users/create/', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${token}`
    },
    body: JSON.stringify(userData)
});

if (response.ok) {
    const result = await response.json();
    console.log('User created successfully!', result.user);
}
```

### cURL

```bash
# Get token
TOKEN=$(curl -X POST http://localhost:8000/api/users/api-token/ \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "admin123"}' \
  | jq -r '.token')

# Create user
curl -X POST http://localhost:8000/api/users/create/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Token $TOKEN" \
  -d '{
    "username": "newuser",
    "email": "newuser@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "password": "SecurePassword123!",
    "password_confirm": "SecurePassword123!",
    "department": "IT",
    "title": "Developer"
  }'
```

---

## Testing

Run the test suite to verify all functionality:

```bash
# Run all user tests
python manage.py test apps.user.tests

# Run specific test
python manage.py test apps.user.tests.UserAPITests.test_create_user_as_admin

# Run with verbose output
python manage.py test apps.user.tests -v 2
```

---

## Security Considerations

1. **Authentication Required**: All endpoints require valid authentication tokens
2. **Admin Permissions**: User creation, update, and deletion require admin privileges
3. **Password Security**: Passwords are validated using Django's built-in validators
4. **Soft Delete**: Users are soft deleted to maintain data integrity
5. **Permission Checks**: Proper permission checks prevent unauthorized access
6. **Input Validation**: All inputs are validated and sanitized

---

## Migration Notes

When deploying the user creation functionality:

1. Ensure migrations are applied:
   ```bash
   python manage.py makemigrations
   python manage.py migrate
   ```

2. Create a superuser if needed:
   ```bash
   python manage.py createsuperuser
   ```

3. Test the API endpoints in your environment
4. Update your frontend to use the new endpoints

---

## Support

For issues or questions about the User Creation API:

1. Check the test files for examples: `apps/user/tests.py`
2. Review the example script: `example_user_creation.py`
3. Consult the Django REST framework documentation
4. Check the application logs for error details 