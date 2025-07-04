# Django Session Language Integration with React

This implementation synchronizes React language state with Django session language preferences, focusing on reading Django language settings without modifying the SignIn component.

## Overview

The system reads language preferences from Django sessions and syncs them to React:
1. Reads Django language cookies (`django_language`) 
2. Reads user language from Django user profile
3. Syncs language to React Redux store automatically
4. Monitors Django language changes and updates React accordingly
5. Loads translations from both Django API and JSON files

## Recent Fixes Applied

### 🔧 **Django Middleware Order Fix**
- **Issue**: `UserLanguageMiddleware` was placed before `LocaleMiddleware`
- **Fix**: Reordered middleware to ensure proper language detection
- **Impact**: Django language cookies now properly set and detected

### 🔧 **Language Cookie Setting**
- **Issue**: `SetLanguageAPIView` wasn't setting language cookies
- **Fix**: Added cookie setting in API response
- **Impact**: Language changes now persist in browser cookies

### 🔧 **Enhanced Language Detection**
- **Issue**: Limited cookie detection methods
- **Fix**: Added fallback detection for standard Django cookie names
- **Impact**: More robust language detection across different scenarios

### 🔧 **Improved Sync Timing**
- **Issue**: Language sync happening too early before auth completion
- **Fix**: Added delays and better timing for language synchronization
- **Impact**: Language sync now happens after authentication is complete

## Implementation Flow

### On App Initialization
1. LanguageSyncService initializes and monitors Django language cookie
2. Service checks for existing Django language cookie
3. If found, syncs language to React Redux store immediately
4. Sets up periodic monitoring for Django language changes

### On User Authentication
1. User authenticates via Django login
2. Django sets language cookie based on user profile
3. AuthProvider detects successful authentication
4. LanguageSyncService.syncFromDjangoSession() called with delay
5. React UI immediately updates to user's preferred language

### Language Cookie Monitoring
1. Service monitors `django_language` cookie every 3 seconds
2. Detects changes when Django language is updated
3. Automatically syncs new language to React Redux store
4. UI components re-render with new language immediately

## Key Components

### Django Backend (Updated)
- User language stored in `User.language` field
- `django_language` cookie set during login and language changes
- `/api/users/whoami/` returns user language
- `/api/setlang` changes language and sets cookie
- `/api/translation/{code}` serves translations from database

### React Frontend

#### LanguageSyncService (`ui/src/utils/language_sync_service.ts`)
- **Primary Purpose**: Bidirectional language synchronization between Django and React
- Monitors `django_language` cookie for changes
- Converts Django language codes to React LAYOUT_LANGUAGES
- Updates Redux store when Django language changes
- **NEW**: Sends language changes from React to Django via API
- **NEW**: Handles CSRF token for secure API communication
- Includes fallback detection for browser language
- Debug method for troubleshooting

#### AuthProvider (`ui/src/components/AuthProvider.tsx`)
- Triggers language sync after successful authentication
- Calls `languageSyncService.syncFromDjangoSession()` with delay
- Ensures cookies are properly set before sync

#### useTranslation Hook (`ui/src/hooks/useTranslation.ts`)
- Loads translations from Django API + JSON files
- Django translations take priority, JSON as fallback
- Automatically reloads when language changes

## Features
✅ **Read Django Language**: Automatically detects Django session language  
✅ **Cookie Monitoring**: Real-time detection of Django language changes  
✅ **Authentication Sync**: Language synced immediately after login  
✅ **Database + JSON Translations**: Hybrid translation loading system  
✅ **RTL Support**: Automatic direction detection for Arabic  
✅ **Non-invasive**: No changes to SignIn component  
✅ **Real-time Updates**: Language changes reflect immediately  
✅ **Fallback Detection**: Browser language fallback when no Django language  
✅ **Debug Tools**: Development debugging for language state  
✅ **Cross-tab Sync**: Language changes sync across browser tabs  
✅ **React → Django Updates**: Language changes in React update Django sessions  
✅ **Bidirectional Sync**: Complete two-way language synchronization  

## Configuration

### Django Settings (Updated)
```python
MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.locale.LocaleMiddleware",  # Must be before UserLanguageMiddleware
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "apps.user.middlewares.UserLanguageMiddleware",  # After LocaleMiddleware
    # ... other middleware
]

LANGUAGES = [("ar", "Arabic"), ("en", "English")]
LANGUAGE_COOKIE_NAME = 'django_language'
LANGUAGE_COOKIE_HTTPONLY = False  # Required for JavaScript access
```

### React Usage
```typescript
// Initialize in App.tsx (already implemented)
const languageSyncService = LanguageSyncService.getInstance();

// Force sync from Django (if needed)
languageSyncService.syncFromDjangoSession();

// Debug language state (development only)
languageSyncService.debugLanguageState();
```

## Monitoring and Detection

### Language Cookie Detection
- Monitors `django_language` cookie every 3 seconds
- Detects changes when Django admin or other sources change language
- Automatically updates React Redux state
- Fallback to browser language if no Django language found

### Authentication Integration
- AuthProvider triggers sync after successful login
- Ensures user's saved language preference is applied immediately
- Delayed sync to ensure cookies are properly set

### Focus Event Detection
- Monitors browser focus events
- Syncs language when user returns to tab
- Handles cases where Django language changed in another tab

## Troubleshooting

### Debug Language State
```typescript
// In browser console
const languageSyncService = LanguageSyncService.getInstance();
languageSyncService.debugLanguageState();
```

### Common Issues and Solutions

1. **Language not syncing after login**
   - Check middleware order in Django settings
   - Verify `LANGUAGE_COOKIE_HTTPONLY = False`
   - Check browser console for debug logs

2. **Language cookie not found**
   - Ensure user has language set in profile
   - Check if Django is setting cookies properly
   - Verify cookie domain and path settings

3. **React not updating language**
   - Check Redux DevTools for state changes
   - Verify useTranslation hook is reloading
   - Check for JavaScript errors in console

## Benefits

🔒 **Security**: Only reads from Django, doesn't modify session  
⚡ **Performance**: Efficient cookie monitoring with minimal overhead  
🔄 **Real-time**: Immediate language updates without page refresh  
🎯 **Targeted**: Focused on Django session integration only  
🛡️ **Non-breaking**: Preserves existing UI component functionality  
📱 **Responsive**: Works across tabs and browser sessions  
🔧 **Robust**: Multiple fallback mechanisms for language detection  
🐛 **Debuggable**: Built-in debugging tools for development  

## How It Works

### Django → React Sync
1. **Cookie Reading**: Service reads `django_language` cookie value
2. **User Profile Fallback**: If no cookie, reads from authenticated user profile  
3. **Browser Fallback**: If no user language, uses browser language
4. **Redux Sync**: Updates React Redux store with Django language
5. **UI Update**: All components using `useSelector` re-render automatically
6. **Translation Loading**: useTranslation hook reloads with new language
7. **Direction Update**: RTL/LTR direction updated based on language

### React → Django Sync
1. **User Action**: User clicks language dropdown in React
2. **API Call**: Service sends POST to `/api/setlang` with language code
3. **CSRF Protection**: Includes CSRF token for secure communication
4. **Django Update**: Django updates user.language and sets cookie
5. **Response**: Django returns success response
6. **React Update**: React updates Redux store and UI
7. **Synchronization Complete**: Both Django and React are in sync

This approach ensures React always reflects the current Django session language while maintaining complete separation of concerns and not interfering with existing authentication flows. 