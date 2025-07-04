# Language Synchronization Verification Guide

## Overview
This guide helps you verify that the language synchronization between React and Django is working correctly.

## What Should Work Now

### 1. React → Django Language Updates
When you change the language in React (using the language dropdown), it should:
- Send a POST request to `/api/setlang` with the new language code
- Update the Django session language
- Set the `django_language` cookie
- Update the user's language preference in the database
- Update React's Redux store

### 2. Django → React Language Sync
When Django's language changes (via admin, API, or other means), React should:
- Detect the change in the `django_language` cookie
- Update React's Redux store to match
- Change the UI language and direction

## Testing Steps

### Step 1: Test React → Django Language Change
1. Open the React app in your browser
2. Open browser developer tools (F12)
3. Go to the Network tab
4. Change the language using the language dropdown in React
5. Verify in the Network tab that a POST request is sent to `/api/setlang`
6. Check the response - it should return `{"status": "success", "language": "ar"}` or `{"status": "success", "language": "en"}`
7. Check the Application tab → Cookies to see if `django_language` cookie is set

### Step 2: Test Django → React Language Sync
1. In Django admin, change a user's language preference
2. Refresh the React app
3. Verify that React automatically detects the change and updates the UI

### Step 3: Test Cross-Tab Synchronization
1. Open the React app in two browser tabs
2. Change language in one tab
3. Switch to the other tab
4. Verify that the language change is reflected in the second tab

## Debug Information

### Browser Console Debug
Open browser console and run:
```javascript
// Check current language state
LanguageSyncService.getInstance().debugLanguageState();

// Force sync from Django
LanguageSyncService.getInstance().forceSyncFromDjango();

// Check if languages are synchronized
LanguageSyncService.getInstance().isLanguageSynchronized();
```

### Django Debug
In Django shell:
```python
python manage.py shell
from apps.user.models import User
user = User.objects.get(username='your_username')
print(f"User language: {user.language}")
```

## Common Issues and Solutions

### Issue: Language change not working
**Symptoms**: Language dropdown doesn't change the language
**Debug Steps**:
1. Check browser console for errors
2. Check Network tab for failed API requests
3. Verify CSRF token is being sent
4. Check Django logs for errors

### Issue: Django session not updating
**Symptoms**: React changes but Django admin still shows old language
**Debug Steps**:
1. Check if user is authenticated
2. Verify API endpoint is accessible
3. Check Django logs for permission errors

### Issue: React not syncing from Django
**Symptoms**: Django language changes but React doesn't update
**Debug Steps**:
1. Check if `django_language` cookie exists
2. Verify cookie monitoring is working
3. Check browser console for sync errors

## Expected Behavior

### Successful Language Change Flow:
1. User clicks language dropdown in React
2. React sends POST to `/api/setlang` with language code
3. Django updates user.language and sets cookie
4. Django returns success response
5. React updates Redux store and UI
6. Language change is complete

### Successful Sync Flow:
1. Django language changes (via admin, API, etc.)
2. `django_language` cookie is updated
3. React detects cookie change
4. React updates Redux store to match
5. UI reflects the new language

## API Endpoints

### POST /api/setlang
**Purpose**: Change language in Django session
**Request Body**: `{"language": "en"}` or `{"language": "ar"}`
**Response**: `{"status": "success", "language": "en"}`

### GET /api/users/me/
**Purpose**: Get current user info including language
**Response**: User object with language field

## Cookie Names
- `django_language`: Django's language cookie
- `csrftoken`: CSRF token for API requests
- `sessionid`: Django session ID 