import { apiPost, apiGet } from './axios_api';

export interface User {
  id: number;
  username: string;
  email: string;
  name: string;
  is_impersonate: boolean;
  is_superuser: boolean;
  language: string;
  groups: string[];
  department: string;
  title: string;
  permissions: Record<string, number>;
  picture_url: string | null;
}

interface LoginResponse {
  user: User;
}

class AuthService {
  private static instance: AuthService;
  private isAuthenticatedFlag: boolean = false;
  private currentUser: User | null = null;
  private readonly LOGIN_URL = 'http://localhost:8000/login/';  // Django login URL with trailing slash
  private readonly LOGOUT_URL = 'http://localhost:8000/logout/'; // Django logout URL with trailing slash
  private isInitialized: boolean = false;
  private static whoamiInProgress: boolean = false;
  private static lastWhoamiTime: number = 0;
  private static whoamiDebounceDelay: number = 2000; // 2 second debounce

  private constructor() {
    this.initializeAuth();
  }



  private isLoggedIn(): boolean {
    const wasLoggedIn = localStorage.getItem('wasLoggedIn');
    return wasLoggedIn !== null && wasLoggedIn === 'true';
  }

  private async initializeAuth() {
    if (this.isInitialized) return;

    console.log('Initializing AuthService...', {
      cookies: document.cookie,
      currentPath: window.location.pathname,
      wasLoggedIn: localStorage.getItem('wasLoggedIn'),
      sessionId: localStorage.getItem('sessionId')
    });

    try {
      // Check for session cookie or previous login state
      const hasSession = this.hasValidSessionCookie();
      const wasLoggedIn = this.isLoggedIn();
      console.log('Session check:', { hasSession, wasLoggedIn });

      if (hasSession || wasLoggedIn) {
        // Try to get user info
        try {
        const user = await this.whoami();
        console.log('Initial auth successful:', { user });
        this.isAuthenticatedFlag = true;
        this.currentUser = user;
          localStorage.setItem('wasLoggedIn', 'true');
        } catch (error) {
          console.error('Failed to get user info:', error);
          if (!wasLoggedIn) {
            // Only clear auth state if we weren't previously logged in
            this.clearAuthState();
          }
        }
      } else {
        console.log('No valid session or previous login found');
        this.clearAuthState();
      }
    } catch (error) {
      console.error('Auth initialization failed:', error);
      this.clearAuthState();
    } finally {
      this.isInitialized = true;
    }
  }

  private hasValidSessionCookie(): boolean {
    const cookies = document.cookie.split(';');
    const sessionCookie = cookies.find(cookie => cookie.trim().startsWith('sessionid='));
    const storedSessionId = localStorage.getItem('sessionId');
    
    if (!sessionCookie && !storedSessionId) {
      console.log('No session cookie or stored session ID found');
      return false;
    }

    // Check if the session cookie has a value
    const sessionValue = sessionCookie ? sessionCookie.split('=')[1] || '' : '';
    const isValid = sessionValue.length > 0 || (storedSessionId !== null && storedSessionId.length > 0);
    
    console.log('Session check:', { 
      hasCookie: !!sessionCookie, 
      hasStoredSession: !!storedSessionId,
      isValid 
    });

    return isValid;
  }

  private clearAuthState() {
    this.isAuthenticatedFlag = false;
    this.currentUser = null;
    localStorage.removeItem('redirectAfterLogin');
    localStorage.removeItem('isRedirecting');
    localStorage.removeItem('sessionId');
    localStorage.removeItem('wasLoggedIn');
  }

  private storeSessionId() {
    const cookies = document.cookie.split(';');
    const sessionCookie = cookies.find(cookie => cookie.trim().startsWith('sessionid='));
    if (sessionCookie) {
      const sessionId = sessionCookie.split('=')[1];
      localStorage.setItem('sessionId', sessionId);
      localStorage.setItem('wasLoggedIn', 'true');
    }
  }

  public static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  private logHeaders(headers: Headers): string {
    const headerMap: Record<string, string> = {};
    headers.forEach((value, key) => {
      headerMap[key] = value;
    });
    return JSON.stringify(headerMap, null, 2);
  }

  private async getCsrfToken(): Promise<string> {
    try {
      console.log('Getting CSRF token...');
      console.log('Current cookies:', document.cookie);
      
      // First try to get the token from the cookie
      const cookies = document.cookie.split(';');
      const csrfCookie = cookies.find(cookie => cookie.trim().startsWith('csrftoken='));
      
      if (csrfCookie) {
        const cookieToken = csrfCookie.split('=')[1];
        console.log('Found CSRF token in cookie:', cookieToken.substring(0, 10) + '...');
        return cookieToken;
      }

      console.log('No CSRF token in cookie, fetching from API...');
      // If no cookie token, fetch from API endpoint
      const response = await fetch(this.LOGIN_URL, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest'
        }
      });

      console.log('API response:', {
        status: response.status,
        statusText: response.statusText,
        headers: this.logHeaders(response.headers),
        cookies: document.cookie
      });

      if (!response.ok) {
        console.error('API response:', {
          status: response.status,
          statusText: response.statusText,
          headers: this.logHeaders(response.headers)
        });
        throw new Error(`Failed to fetch CSRF token: ${response.status} ${response.statusText}`);
      }

      // Get the JSON response
      const data = await response.json();
      console.log('API response data:', data);

      if (!data.csrf_token) {
        console.error('API response data:', data);
        throw new Error('CSRF token not found in API response');
      }

      // Get the cookie token from the new cookie
      const newCookies = document.cookie.split(';');
      const newCsrfCookie = newCookies.find(cookie => cookie.trim().startsWith('csrftoken='));
      if (!newCsrfCookie) {
        console.error('Available cookies:', newCookies);
        throw new Error('CSRF token not found in cookies after API call');
      }

      const cookieToken = newCsrfCookie.split('=')[1];

      console.log('CSRF tokens retrieved:', {
        cookieToken: cookieToken.substring(0, 10) + '...',
        cookies: document.cookie
      });

      return cookieToken;
    } catch (error) {
      console.error('Error getting CSRF token:', error);
      if (error instanceof Error) {
        throw new Error(`Failed to get CSRF token: ${error.message}`);
      }
      throw new Error('Failed to get CSRF token: Unknown error');
    }
  }

  public async login(username: string, password: string, adChoice: string = 'local'): Promise<LoginResponse> {
    try {
      console.log('Starting login process...', {
        cookies: document.cookie,
        currentPath: window.location.pathname
      });

      // Get CSRF token first
      const csrfToken = await this.getCsrfToken();
      console.log('Got CSRF token:', csrfToken.substring(0, 10) + '...');

      // Make login request
      const formData = new FormData();
      formData.append('username', username);
      formData.append('password', password);
      formData.append('ad_choice', adChoice);

      const response = await fetch(this.LOGIN_URL, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
          'X-CSRFToken': csrfToken
        },
        body: formData
      });

      console.log('Login response:', {
        status: response.status,
        statusText: response.statusText,
        headers: this.logHeaders(response.headers),
        url: response.url,
        type: response.type,
        cookies: document.cookie,
        redirected: response.redirected
      });

      if (response.status === 0) {
        throw new Error('Login request was blocked. This may be due to CORS or cookie restrictions.');
      }

      // Check for successful login (either 302 redirect or 200 OK)
      if (response.status !== 302 && response.status !== 200) {
        throw new Error(`Login failed: ${response.status} ${response.statusText}`);
      }

      // Store session ID in localStorage
      this.storeSessionId();

      // After successful login, get the user info using whoami
      console.log('Login successful, getting user info...');
      const user = await this.whoami();
      console.log('Got user info:', user);
      
      // Set authentication flag and user
      this.isAuthenticatedFlag = true;
      this.currentUser = user;
      
      return { user };
    } catch (error) {
      console.error('Login error:', error);
      this.clearAuthState();
      
      if (error instanceof Error) {
        throw new Error(`Login failed: ${error.message}`);
      }
      throw new Error('Login failed: Unknown error');
    }
  }

  public async whoami(): Promise<User> {
    // Prevent multiple simultaneous whoami calls
    if (AuthService.whoamiInProgress) {
      console.log('Whoami already in progress, waiting...');
      // Wait for current call to complete
      while (AuthService.whoamiInProgress) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      // Return cached user if available
      if (this.currentUser) {
        return this.currentUser;
      }
    }

    // Debounce whoami calls
    const now = Date.now();
    if (now - AuthService.lastWhoamiTime < AuthService.whoamiDebounceDelay) {
      console.log('Whoami debounced, returning cached user...');
      if (this.currentUser) {
        return this.currentUser;
      }
    }

    AuthService.whoamiInProgress = true;
    AuthService.lastWhoamiTime = now;

    try {
      console.log('Making whoami request...', {
        cookies: document.cookie,
        currentPath: window.location.pathname
      });

      const response = await apiGet<User>('/api/users/whoami');
      console.log('Whoami response:', response);
      
      this.isAuthenticatedFlag = true;
      this.currentUser = response;
      localStorage.setItem('wasLoggedIn', 'true');
      
      return response;
    } catch (error) {
      console.error('Whoami error:', error);
      // Only clear auth state if we're not in the process of logging in
      if (!this.getLocalStorageBoolean('isRedirecting')) {
        this.clearAuthState();
      }
      if (error instanceof Error) {
        throw new Error(`Failed to get user info: ${error.message}`);
      }
      throw new Error('Failed to get user info: Unknown error');
    } finally {
      AuthService.whoamiInProgress = false;
    }
  }

  public async logout(): Promise<void> {
    try {
      console.log('Starting logout process...', {
        cookies: document.cookie,
        currentPath: window.location.pathname
      });

      // Get CSRF token for logout
      const csrfToken = await this.getCsrfToken();
      console.log('Got CSRF token for logout:', csrfToken.substring(0, 10) + '...');

      await fetch(this.LOGOUT_URL, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Accept': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
          'X-CSRFToken': csrfToken
        }
      });

      console.log('Logout successful');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      this.clearAuthState();
      // Redirect to Django login page
      window.location.href = this.LOGIN_URL;
    }
  }

  private getLocalStorageBoolean(key: string): boolean {
    const value = localStorage.getItem(key);
    return value !== null && value === 'true';
  }

  private getLocalStorageString(key: string): string | null {
    return localStorage.getItem(key);
  }

  public isAuthenticated(): boolean {
    // Ensure auth state is initialized
    if (!this.isInitialized) {
      console.log('Auth not initialized, checking session...');
      return this.hasValidSessionCookie();
    }

    const hasSession = this.hasValidSessionCookie();
    const isRedirecting = this.getLocalStorageBoolean('isRedirecting');
    const wasLoggedIn = this.getLocalStorageBoolean('wasLoggedIn');
    const storedSessionId = this.getLocalStorageString('sessionId');
    
    console.log('Auth check:', { 
      hasSession, 
      isAuthenticatedFlag: this.isAuthenticatedFlag,
      currentUser: this.currentUser,
      isRedirecting,
      wasLoggedIn,
      hasStoredSession: !!storedSessionId,
      isInitialized: this.isInitialized,
      currentPath: window.location.pathname
    });

    // If we're redirecting after login, consider ourselves authenticated
    if (isRedirecting) {
      return true;
    }

    // Consider authenticated if:
    // 1. We have a valid session cookie OR stored session ID
    // 2. AND either:
    //    - We have a current user and auth flag is true
    //    - OR we were previously logged in
    return (hasSession || (storedSessionId !== null && storedSessionId.length > 0)) && 
           ((this.isAuthenticatedFlag && this.currentUser !== null) || wasLoggedIn);
  }

  public getCurrentUser(): User | null {
    return this.currentUser;
  }
}

export default AuthService; 