import store from '../slices/reducer';
import { changeLayoutLanguage, changeDirection } from '../slices/thunk';
import { LAYOUT_LANGUAGES, LAYOUT_DIRECTION } from '../components/constants/layout';
import AuthService from './auth_service';
import { clearTranslationCache } from '../hooks/useTranslation';

/**
 * Service to synchronize language settings from Django sessions to React
 * Focuses on reading Django language cookies and user preferences
 */
class LanguageSyncService {
  private static instance: LanguageSyncService;
  private authService: AuthService;
  private readonly DJANGO_LANGUAGE_COOKIE = 'django_language';
  private isInitialized = false;
  private syncInProgress = false;
  private lastSyncTime = 0;
  private syncDebounceDelay = 3000; // 3 second debounce to prevent rapid syncs
  private monitoringInterval: NodeJS.Timeout | null = null;
  private syncAfterLoginInProgress = false;
  private lastTranslationLoadTime = 0;
  private translationLoadDebounce = 5000; // 5 second debounce for translation loads
  private static translationLoadingInProgress = false;
  private reloadAttempts = 0;
  private maxReloadAttempts = 2;

  private constructor() {
    this.authService = AuthService.getInstance();
    this.setupLanguageSync();
  }

  public static getInstance(): LanguageSyncService {
    if (!LanguageSyncService.instance) {
      LanguageSyncService.instance = new LanguageSyncService();
    }
    return LanguageSyncService.instance;
  }

  /**
   * Read Django language cookie from browser
   */
  private getDjangoLanguageCookie(): string | null {
    console.log('=== Checking Django Language Cookie ===');
    console.log('All cookies:', document.cookie);
    
    const cookies = document.cookie.split(';');
    const languageCookie = cookies.find(cookie => 
      cookie.trim().startsWith(`${this.DJANGO_LANGUAGE_COOKIE}=`)
    );
    
    if (languageCookie) {
      const cookieValue = languageCookie.split('=')[1]?.trim();
      console.log('Found Django language cookie:', cookieValue);
      return cookieValue || null;
    }
    
    // Also check for the standard Django language cookie name
    const standardCookie = cookies.find(cookie => 
      cookie.trim().startsWith('django_language=')
    );
    
    if (standardCookie) {
      const cookieValue = standardCookie.split('=')[1]?.trim();
      console.log('Found standard Django language cookie:', cookieValue);
      return cookieValue || null;
    }
    
    // Check for any language-related cookies
    const allCookies = cookies.map(c => c.trim());
    const languageCookies = allCookies.filter(c => 
      c.toLowerCase().includes('language') || 
      c.toLowerCase().includes('lang')
    );
    
    if (languageCookies.length > 0) {
      console.log('Found other language-related cookies:', languageCookies);
    }
    
    console.log('No Django language cookie found');
    console.log('Available cookies:', allCookies);
    console.log('=====================================');
    return null;
  }

  /**
   * Convert Django language code to React LAYOUT_LANGUAGES enum
   */
  private djangoLanguageToReactLanguage(djangoLang: string): LAYOUT_LANGUAGES {
    switch (djangoLang.toLowerCase()) {
      case 'ar':
        return LAYOUT_LANGUAGES.ARABIC;
      case 'en':
      default:
        return LAYOUT_LANGUAGES.ENGLISH;
    }
  }

  /**
   * Convert React LAYOUT_LANGUAGES enum to Django language code
   */
  private reactLanguageToDjangoLanguage(reactLang: LAYOUT_LANGUAGES): string {
    switch (reactLang) {
      case LAYOUT_LANGUAGES.ARABIC:
        return 'ar';
      case LAYOUT_LANGUAGES.ENGLISH:
      default:
        return 'en';
    }
  }

  /**
   * Get appropriate direction for language
   */
  private getDirectionForLanguage(language: LAYOUT_LANGUAGES): LAYOUT_DIRECTION {
    return language === LAYOUT_LANGUAGES.ARABIC 
      ? LAYOUT_DIRECTION.RTL 
      : LAYOUT_DIRECTION.LTR;
  }

  /**
   * Sync Django language to React Redux store
   */
  private syncDjangoLanguageToReact(djangoLanguage: string): void {
    console.log('Syncing Django language to React:', djangoLanguage);
    
    const reactLanguage = this.djangoLanguageToReactLanguage(djangoLanguage);
    const direction = this.getDirectionForLanguage(reactLanguage);
    
    // Check if language actually needs to change
    const currentLanguage = store.getState().Layout.layoutLanguages;
    if (currentLanguage === reactLanguage) {
      console.log('Language already matches, no change needed');
      return;
    }
    
    console.log(`Language change: ${currentLanguage} -> ${reactLanguage}`);
    
    // Clear translation cache for both old and new language to force fresh loading
    const oldDjangoLang = this.reactLanguageToDjangoLanguage(currentLanguage);
    const newDjangoLang = this.reactLanguageToDjangoLanguage(reactLanguage);
    clearTranslationCache(oldDjangoLang);
    clearTranslationCache(newDjangoLang);
    
    // Dispatch Redux actions to update language and direction
    store.dispatch(changeLayoutLanguage(reactLanguage));
    store.dispatch(changeDirection(direction));
    
    // Force reload translations for the new language
    this.reloadTranslationsForLanguage(reactLanguage);
    
    // Update document attributes
    this.updateDocumentAttributes(reactLanguage);
    
    console.log('Language synced to React:', { reactLanguage, direction });
  }

  /**
   * Reload translations for a specific language
   */
  private reloadTranslationsForLanguage(language: LAYOUT_LANGUAGES): void {
    // Prevent multiple translation loads for the same language
    const now = Date.now();
    if (now - this.lastTranslationLoadTime < this.translationLoadDebounce) {
      console.log('Translation load debounced, skipping...');
      return;
    }
    
    this.lastTranslationLoadTime = now;
    console.log('Reloading translations for language:', language);
    
    // Clear translation cache to force fresh loading
    const djangoLang = this.reactLanguageToDjangoLanguage(language);
    clearTranslationCache(djangoLang);
    
    // Trigger translation reload by dispatching a custom action or calling the translation service
    // This will force the useTranslation hook to reload translations
    const event = new CustomEvent('languageChanged', { 
      detail: { language: language } 
    });
    window.dispatchEvent(event);
    
    // Force a Redux state update to trigger translation reload (only if needed)
    setTimeout(() => {
      const currentLang = store.getState().Layout.layoutLanguages;
      if (currentLang !== language) {
        console.log('Redux state not updated, dispatching again...');
        store.dispatch(changeLayoutLanguage(language));
      }
    }, 100);
    
    // Update localStorage to trigger useTranslation hook (gentle approach)
    setTimeout(() => {
      const currentStoredLang = localStorage.getItem('currentLanguage');
      if (currentStoredLang !== language) {
        localStorage.setItem('currentLanguage', language);
        console.log('Updated localStorage language:', language);
      }
    }, 150);
    
    // Only force page refresh as absolute last resort after longer delay
    setTimeout(() => {
      console.log('Final check if language change was applied...');
      const currentLang = store.getState().Layout.layoutLanguages;
      const currentDir = document.documentElement.getAttribute('dir');
      const expectedDir = language === LAYOUT_LANGUAGES.ARABIC ? 'rtl' : 'ltr';
      
      if (currentLang !== language || currentDir !== expectedDir) {
        this.reloadAttempts += 1;
        if (this.reloadAttempts > this.maxReloadAttempts) {
          console.warn('Max reload attempts reached, not reloading again.');
          return;
        }
        console.log('Language change not fully applied, forcing page refresh... (attempt', this.reloadAttempts, ')');
        window.location.reload();
      } else {
        this.reloadAttempts = 0; // Reset on success
        console.log('Language change applied successfully, no refresh needed');
      }
    }, 5000); // Increased delay to 5 seconds
  }

  /**
   * Update document attributes for language
   */
  private updateDocumentAttributes(language: LAYOUT_LANGUAGES): void {
    const isRTL = language === LAYOUT_LANGUAGES.ARABIC;
    
    // Update document direction
    document.documentElement.setAttribute('dir', isRTL ? 'rtl' : 'ltr');
    
    // Update body classes
    if (isRTL) {
      document.body.classList.add('rtl');
      document.body.classList.remove('ltr');
    } else {
      document.body.classList.add('ltr');
      document.body.classList.remove('rtl');
    }
    
    console.log('Document attributes updated for language:', language);
  }

  /**
   * Check and sync language from Django session/cookie
   */
  public syncFromDjangoSession(): void {
    // Prevent multiple simultaneous syncs
    if (this.syncInProgress) {
      console.log('Sync already in progress, skipping...');
      return;
    }

    // Debounce sync calls
    const now = Date.now();
    if (now - this.lastSyncTime < this.syncDebounceDelay) {
      console.log('Sync debounced, skipping...');
      return;
    }

    this.syncInProgress = true;
    this.lastSyncTime = now;
    
    console.log('Syncing language from Django session...');
    
    try {
      // First check Django language cookie
      const cookieLanguage = this.getDjangoLanguageCookie();
      if (cookieLanguage) {
        console.log('Using language from cookie:', cookieLanguage);
        this.syncDjangoLanguageToReact(cookieLanguage);
        return;
      }

      // Then check user language from authentication
      const userLanguage = this.getCurrentDjangoLanguage();
      if (userLanguage) {
        console.log('Using language from user profile:', userLanguage);
        this.syncDjangoLanguageToReact(userLanguage);
        return;
      }

      // Fallback to browser language or default
      const browserLanguage = navigator.language?.split('-')[0];
      if (browserLanguage && ['en', 'ar'].includes(browserLanguage)) {
        console.log('Using browser language as fallback:', browserLanguage);
        this.syncDjangoLanguageToReact(browserLanguage);
        return;
      }

      console.log('No language found, using default English');
      this.syncDjangoLanguageToReact('en');
    } finally {
      this.syncInProgress = false;
    }
  }

  /**
   * Quick sync check without full processing
   */
  public quickSyncCheck(): boolean {
    const cookieLanguage = this.getDjangoLanguageCookie();
    const currentLanguage = store.getState().Layout.layoutLanguages;
    const expectedLanguage = cookieLanguage ? this.djangoLanguageToReactLanguage(cookieLanguage) : LAYOUT_LANGUAGES.ENGLISH;
    
    return currentLanguage === expectedLanguage;
  }

  /**
   * Setup language synchronization monitoring
   */
  private setupLanguageSync(): void {
    // Prevent multiple initializations
    if (this.isInitialized) {
      console.log('Language sync already initialized, skipping...');
      return;
    }

    console.log('Setting up language synchronization...');
    
    // Check for Django language cookie changes periodically
    this.monitorDjangoLanguageCookie();

    // Single initial sync after auth is ready
    setTimeout(() => {
      this.syncFromDjangoSession();
    }, 1000);

    // Also sync when the page becomes visible (user returns to tab)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        console.log('Page became visible, syncing language...');
        setTimeout(() => {
          this.syncFromDjangoSession();
        }, 200);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Special handling for login page language changes
    this.handleLoginPageLanguageSync();
    
    this.isInitialized = true;
  }

  /**
   * Handle language changes from Django login page
   */
  private handleLoginPageLanguageSync(): void {
    // Check if we're coming from login page by looking at referrer
    const referrer = document.referrer;
    const currentUrl = window.location.href;
    const isFromLoginPage = referrer.includes('/login') || 
                           referrer.includes('localhost:8000/login') ||
                           referrer.includes('localhost:8001/login') ||
                           referrer.includes('localhost:8002/login') ||
                           referrer.includes('localhost:8003/login');
    
    // Also check if we're on dashboard after login
    const isOnDashboardAfterLogin = currentUrl.includes('/#/dashboard') && 
                                   (isFromLoginPage || this.isFreshLogin());
    
    console.log('Login page sync check:', {
      referrer,
      currentUrl,
      isFromLoginPage,
      isOnDashboardAfterLogin
    });
    
    if (isFromLoginPage || isOnDashboardAfterLogin) {
      console.log('Detected navigation from login page or fresh login, checking for language changes...');
      
      // Use the enhanced post-login sync method
      this.syncAfterLogin();
    } else {
      // Even if not from login page, check for language changes on initial load
      console.log('Initial load, checking for language changes...');
      setTimeout(() => {
        this.syncFromDjangoSession();
      }, 1000);
    }
  }

  /**
   * Check if this is a fresh login (within last 30 seconds)
   */
  private isFreshLogin(): boolean {
    const loginTime = localStorage.getItem('lastLoginTime');
    if (!loginTime) return false;
    
    const now = Date.now();
    const timeSinceLogin = now - parseInt(loginTime);
    const isFresh = timeSinceLogin < 30000; // 30 seconds
    
    console.log('Fresh login check:', {
      loginTime,
      now,
      timeSinceLogin,
      isFresh
    });
    
    return isFresh;
  }

  /**
   * Check if we're coming from login page
   */
  public isFromLoginPage(): boolean {
    const referrer = document.referrer;
    return referrer.includes('/login') || 
           referrer.includes('localhost:8000/login') ||
           referrer.includes('localhost:8001/login') ||
           referrer.includes('localhost:8002/login') ||
           referrer.includes('localhost:8003/login');
  }

  /**
   * Monitor Django language cookie for changes
   */
  private monitorDjangoLanguageCookie(): void {
    let lastLanguage = this.getDjangoLanguageCookie();

    const checkLanguageChange = () => {
      const currentLanguage = this.getDjangoLanguageCookie();
      if (currentLanguage && currentLanguage !== lastLanguage) {
        console.log('Django language cookie changed:', lastLanguage, '->', currentLanguage);
        this.syncDjangoLanguageToReact(currentLanguage);
        lastLanguage = currentLanguage;
      }
    };

    // Check for language changes every 5 seconds (reduced frequency)
    this.monitoringInterval = setInterval(checkLanguageChange, 5000);

    // Also check on focus events (when user returns to tab) - debounced
    const handleFocus = () => {
      setTimeout(checkLanguageChange, 100);
    };
    window.addEventListener('focus', handleFocus);

    // Check when storage changes (for cross-tab synchronization)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'django_language' || e.key === this.DJANGO_LANGUAGE_COOKIE) {
        console.log('Language changed in another tab:', e.newValue);
        setTimeout(() => {
          this.syncFromDjangoSession();
        }, 100);
      }
    };
    window.addEventListener('storage', handleStorageChange);
  }

  /**
   * Get current language from Django user
   */
  public getCurrentDjangoLanguage(): string | null {
    const user = this.authService.getCurrentUser();
    return user?.language || null;
  }

  /**
   * Get current React language from Redux store
   */
  public getCurrentReactLanguage(): LAYOUT_LANGUAGES {
    const state = store.getState();
    return state.Layout.layoutLanguages;
  }

  /**
   * Check if Django and React languages are synchronized
   */
  public isLanguageSynchronized(): boolean {
    const djangoLanguage = this.getCurrentDjangoLanguage();
    const reactLanguage = this.getCurrentReactLanguage();
    
    if (!djangoLanguage) return true; // No Django language set, consider synchronized
    
    const expectedReactLanguage = this.djangoLanguageToReactLanguage(djangoLanguage);
    return reactLanguage === expectedReactLanguage;
  }

  /**
   * Change language in Django and sync to React
   */
  public async changeLanguage(reactLanguage: LAYOUT_LANGUAGES): Promise<void> {
    const djangoLanguage = this.reactLanguageToDjangoLanguage(reactLanguage);
    
    // Prevent multiple simultaneous language changes
    if (this.syncInProgress) {
      console.log('Language change already in progress, skipping...');
      return;
    }

    this.syncInProgress = true;
    
    try {
      console.log('Changing language to Django:', djangoLanguage);
      
      // Send language change to Django API
      const response = await fetch('/api/setlang', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': this.getCsrfToken(),
        },
        credentials: 'include',
        body: JSON.stringify({ language: djangoLanguage })
      });

      if (!response.ok) {
        throw new Error(`Failed to update Django language: ${response.status}`);
      }

      const result = await response.json();
      console.log('Django language update result:', result);

      // Update React state
      const direction = this.getDirectionForLanguage(reactLanguage);
      store.dispatch(changeLayoutLanguage(reactLanguage));
      store.dispatch(changeDirection(direction));
      
      console.log('Language change completed:', { reactLanguage, djangoLanguage, direction });
    } catch (error) {
      console.error('Failed to change language:', error);
      throw error;
    } finally {
      this.syncInProgress = false;
    }
  }

  /**
   * Get CSRF token from cookies
   */
  private getCsrfToken(): string {
    const cookies = document.cookie.split(';');
    const csrfCookie = cookies.find(cookie => 
      cookie.trim().startsWith('csrftoken=')
    );
    
    if (csrfCookie) {
      return csrfCookie.split('=')[1]?.trim() || '';
    }
    
    return '';
  }

  /**
   * Force synchronization from Django to React
   */
  public forceSyncFromDjango(): void {
    this.syncFromDjangoSession();
  }

  /**
   * Force sync with multiple attempts (for login page language changes)
   */
  public forceSyncWithRetries(): void {
    console.log('Force syncing language with retries...');
    
    // Immediate sync
    this.syncFromDjangoSession();
    
    // Retry syncs with delays
    setTimeout(() => {
      this.syncFromDjangoSession();
    }, 500);
    
    setTimeout(() => {
      this.syncFromDjangoSession();
    }, 1500);
    
    setTimeout(() => {
      this.syncFromDjangoSession();
    }, 3000);
  }

  /**
   * Manual trigger for Django → React sync (for debugging)
   */
  public manualDjangoToReactSync(): void {
    console.log('Manual Django → React sync triggered...');
    console.log('Current cookies:', document.cookie);
    console.log('Current referrer:', document.referrer);
    
    // Force sync with multiple attempts
    this.forceSyncWithRetries();
    
    // Additional sync after longer delay
    setTimeout(() => {
      console.log('Additional manual sync attempt...');
      this.syncFromDjangoSession();
    }, 4000);
  }

  /**
   * Enhanced sync specifically for post-login scenarios
   */
  public syncAfterLogin(): void {
    // Prevent multiple simultaneous post-login syncs
    if (this.syncAfterLoginInProgress) {
      console.log('Post-login sync already in progress, skipping...');
      return;
    }

    this.syncAfterLoginInProgress = true;
    console.log('Post-login language sync triggered...');
    
    // Initial sync after a short delay
    setTimeout(() => {
      this.syncFromDjangoSession();
    }, 200);
    
    // Second sync attempt if needed
    setTimeout(() => {
      this.syncFromDjangoSession();
    }, 1000);
    
    // Final sync attempt
    setTimeout(() => {
      this.syncFromDjangoSession();
      this.syncAfterLoginInProgress = false; // Reset flag
    }, 3000);
  }

  /**
   * Cleanup method to prevent memory leaks
   */
  public cleanup(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
    this.isInitialized = false;
    this.syncInProgress = false;
    console.log('Language sync service cleaned up');
  }

  /**
   * Debug method to check current language state
   */
  public debugLanguageState(): void {
    console.log('=== Language Sync Debug Info ===');
    console.log('Django cookie:', this.getDjangoLanguageCookie());
    console.log('User language:', this.getCurrentDjangoLanguage());
    console.log('React language:', this.getCurrentReactLanguage());
    console.log('Browser language:', navigator.language);
    console.log('All cookies:', document.cookie);
    console.log('Redux state:', store.getState().Layout);
    console.log('Sync in progress:', this.syncInProgress);
    console.log('Last sync time:', this.lastSyncTime);
    console.log('Is from login page:', this.isFromLoginPage());
    console.log('Document referrer:', document.referrer);
    console.log('Current URL:', window.location.href);
    console.log('================================');
  }

  /**
   * Check if language change was successfully applied
   */
  public isLanguageChangeApplied(targetLanguage: LAYOUT_LANGUAGES): boolean {
    const currentReduxLanguage = store.getState().Layout.layoutLanguages;
    const currentDocumentDir = document.documentElement.getAttribute('dir');
    const expectedDir = targetLanguage === LAYOUT_LANGUAGES.ARABIC ? 'rtl' : 'ltr';
    
    const isApplied = currentReduxLanguage === targetLanguage && currentDocumentDir === expectedDir;
    
    console.log('Language change check:', {
      targetLanguage,
      currentReduxLanguage,
      currentDocumentDir,
      expectedDir,
      isApplied
    });
    
    return isApplied;
  }

  /**
   * Check if translation loading is in progress globally
   */
  public static isTranslationLoading(): boolean {
    return LanguageSyncService.translationLoadingInProgress;
  }

  /**
   * Set translation loading status globally
   */
  public static setTranslationLoading(loading: boolean): void {
    LanguageSyncService.translationLoadingInProgress = loading;
    console.log('Translation loading status:', loading);
  }
}

export default LanguageSyncService; 