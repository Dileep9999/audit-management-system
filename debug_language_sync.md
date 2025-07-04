# Language Sync Debugging Guide

## Issue: Login Page Language Change Not Syncing to React

### Problem Description
- User changes language on Django login page (backend HTML)
- User logs in and gets redirected to React app
- React app still shows Arabic instead of the changed language

### Debugging Steps

#### Step 1: Check Django Language Cookie
1. Open browser developer tools (F12)
2. Go to Application tab → Cookies
3. Look for `django_language` cookie
4. Check its value (should be 'en' or 'ar')

#### Step 2: Check Browser Console Logs
1. Open browser console
2. Look for these logs:
   - "Detected navigation from login page, checking for language changes..."
   - "Syncing language after login page navigation..."
   - "Force syncing language with retries..."
   - "Using language from cookie: [language]"

#### Step 3: Manual Debug Commands
Run these in browser console:

```javascript
// Check current language state
LanguageSyncService.getInstance().debugLanguageState();

// Check if coming from login page
LanguageSyncService.getInstance().isFromLoginPage();

// Force sync with retries
LanguageSyncService.getInstance().forceSyncWithRetries();

// Check Django cookie directly
document.cookie.split(';').find(c => c.trim().startsWith('django_language='));
```

#### Step 4: Check Network Tab
1. Go to Network tab in developer tools
2. Look for API calls to `/api/setlang`
3. Check if any language-related API calls are being made

### Common Issues and Solutions

#### Issue 1: Cookie Not Set
**Symptoms**: No `django_language` cookie in Application tab
**Solution**: 
- Check Django `set_language` view is working
- Verify `LANGUAGE_COOKIE_HTTPONLY = False` in Django settings

#### Issue 2: Cookie Set But Not Detected
**Symptoms**: Cookie exists but React doesn't detect it
**Solution**:
- Check cookie domain and path settings
- Verify cookie name matches `settings.LANGUAGE_COOKIE_NAME`

#### Issue 3: Sync Timing Issues
**Symptoms**: Language sync happens too early or too late
**Solution**:
- Check the timing of sync attempts
- Verify delays are appropriate for your setup

#### Issue 4: Referrer Detection Fails
**Symptoms**: Login page navigation not detected
**Solution**:
- Check if `document.referrer` contains login page URL
- Verify the login page URL pattern

### Testing Procedure

1. **Clear browser data** (cookies, localStorage)
2. **Go to login page** (http://localhost:8000/login/)
3. **Change language** using dropdown
4. **Check cookie** is set correctly
5. **Login** with credentials
6. **Monitor console** for sync logs
7. **Verify React app** reflects the language

### Expected Behavior

1. **Login page language change** → Sets `django_language` cookie
2. **Login redirect** → React app loads
3. **AuthProvider detects login page** → Triggers enhanced sync
4. **Multiple sync attempts** → Ensures language detection
5. **React app updates** → Shows correct language

### Debug Output Examples

**Successful sync:**
```
Detected navigation from login page, checking for language changes...
Force syncing language with retries...
Using language from cookie: en
Language synced to React: { reactLanguage: 'ENGLISH', direction: 'LTR' }
```

**Failed sync:**
```
Detected navigation from login page, checking for language changes...
Force syncing language with retries...
No Django language cookie found
Using browser language as fallback: en
```

### Manual Fix Commands

If automatic sync fails, you can manually trigger:

```javascript
// Force immediate sync
LanguageSyncService.getInstance().syncFromDjangoSession();

// Force sync with retries
LanguageSyncService.getInstance().forceSyncWithRetries();

// Check current state
LanguageSyncService.getInstance().debugLanguageState();
``` 