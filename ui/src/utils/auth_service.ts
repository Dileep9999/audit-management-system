import { apiPost, apiGet } from './axios_api';

export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  is_staff: boolean;
  is_active: boolean;
  date_joined: string;
}

interface LoginResponse {
  user: User;
}

class AuthService {
  private static instance: AuthService;
  private isAuthenticatedFlag: boolean = false;
  private readonly LOGIN_URL = 'http://localhost:8000/login';  // Django expects 'login' without trailing slash
  private readonly LOGOUT_URL = 'http://localhost:8000/logout'; // Django expects 'logout' without trailing slash

  private constructor() {
    // Check if we have a session cookie
    this.isAuthenticatedFlag = document.cookie.includes('sessionid=');
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

  private async getCsrfToken(): Promise<{ cookieToken: string; formToken: string }> {
    try {
      // First try to get the token from the cookie
      const cookies = document.cookie.split(';');
      const csrfCookie = cookies.find(cookie => cookie.trim().startsWith('csrftoken='));
      
      if (csrfCookie) {
        const cookieToken = csrfCookie.split('=')[1];
        // If we have a cookie token, we can use it as both tokens
        // Django's CSRF protection allows this in some cases
        return { cookieToken, formToken: cookieToken };
      }

      // If no cookie token, fetch the login page
      const response = await fetch(this.LOGIN_URL, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Accept': 'text/html',
          'X-Requested-With': 'XMLHttpRequest'
        }
      });

      if (!response.ok) {
        console.error('Login page response:', {
          status: response.status,
          statusText: response.statusText,
          headers: this.logHeaders(response.headers)
        });
        throw new Error(`Failed to fetch login page: ${response.status} ${response.statusText}`);
      }

      // Get the HTML content
      const html = await response.text();

      // Extract the form token using regex
      const formTokenMatch = html.match(/name="csrfmiddlewaretoken" value="([^"]+)"/);
      if (!formTokenMatch) {
        console.error('Login page HTML:', html);
        throw new Error('CSRF token not found in form HTML');
      }

      // Get the cookie token from the new cookie
      const newCookies = document.cookie.split(';');
      const newCsrfCookie = newCookies.find(cookie => cookie.trim().startsWith('csrftoken='));
      if (!newCsrfCookie) {
        console.error('Available cookies:', newCookies);
        throw new Error('CSRF token not found in cookies after fetching login page');
      }

      const cookieToken = newCsrfCookie.split('=')[1];
      const formToken = formTokenMatch[1];

      console.log('CSRF tokens retrieved:', {
        cookieToken: cookieToken.substring(0, 10) + '...',
        formToken: formToken.substring(0, 10) + '...'
      });

      return { cookieToken, formToken };
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
      // Get both CSRF tokens
      const { cookieToken, formToken } = await this.getCsrfToken();

      // Now perform login
      const formData = new FormData();
      formData.append('username', username);
      formData.append('password', password);
      formData.append('ad_choice', adChoice);
      formData.append('csrfmiddlewaretoken', formToken);

      // First try a simple fetch to check if the server is accessible
      try {
        const testResponse = await fetch(this.LOGIN_URL, {
          method: 'HEAD',
          credentials: 'include',
          headers: {
            'Accept': 'text/html',
            'X-Requested-With': 'XMLHttpRequest',
            'Origin': 'http://localhost:5174'  // Explicitly set origin
          }
        });
        console.log('Server accessibility test:', {
          status: testResponse.status,
          statusText: testResponse.statusText,
          headers: this.logHeaders(testResponse.headers),
          cookies: document.cookie
        });
      } catch (error) {
        console.error('Server accessibility test failed:', error);
        throw new Error('Cannot connect to the server. Please ensure the server is running at ' + this.LOGIN_URL);
      }

      // Now try the actual login
      const response = await fetch(this.LOGIN_URL, {
        method: 'POST',
        body: formData,
        credentials: 'include',
        headers: {
          'X-CSRFToken': cookieToken,
          'Referer': this.LOGIN_URL,
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'X-Requested-With': 'XMLHttpRequest',
          'Origin': 'http://localhost:5174',  // Explicitly set origin
          'Content-Type': 'application/x-www-form-urlencoded'  // Django expects this for form data
        },
        mode: 'cors',  // Explicitly set CORS mode
        redirect: 'follow'  // Follow redirects instead of manual
      });

      console.log('Login response details:', {
        status: response.status,
        statusText: response.statusText,
        headers: this.logHeaders(response.headers),
        url: response.url,
        type: response.type,
        cookies: document.cookie,
        redirected: response.redirected
      });

      if (response.status === 0) {
        console.error('CORS or cookie details:', {
          origin: window.location.origin,
          cookies: document.cookie,
          headers: this.logHeaders(response.headers)
        });
        throw new Error('Login request was blocked. This may be due to CORS or cookie restrictions. Please ensure the server allows requests from ' + window.location.origin);
      }

      // Check for successful login (either 302 redirect or 200 OK)
      if (response.status !== 302 && response.status !== 200) {
        throw new Error(`Login failed: ${response.status} ${response.statusText}`);
      }

      // After successful login, get the user info using whoami
      const user = await this.whoami();
      
      return { user };
    } catch (error) {
      console.error('Login error:', error);
      this.isAuthenticatedFlag = false;
      if (error instanceof Error) {
        throw new Error(`Login failed: ${error.message}`);
      }
      throw new Error('Login failed: Unknown error');
    }
  }

  public async whoami(): Promise<User> {
    try {
      const response = await apiGet<{ user: User }>('/api/users/whoami');
      this.isAuthenticatedFlag = true;
      return response.user;
    } catch (error) {
      console.error('Whoami error:', error);
      this.isAuthenticatedFlag = false;
      if (error instanceof Error) {
        throw new Error(`Failed to get user info: ${error.message}`);
      }
      throw new Error('Failed to get user info: Unknown error');
    }
  }

  public async logout(): Promise<void> {
    try {
      // Get both CSRF tokens
      const { cookieToken, formToken } = await this.getCsrfToken();

      // Call Django's logout endpoint
      const formData = new FormData();
      formData.append('csrfmiddlewaretoken', formToken);

      await fetch(this.LOGOUT_URL, {
        method: 'POST',
        body: formData,
        credentials: 'include',
        headers: {
          'X-CSRFToken': cookieToken,
          'Referer': this.LOGIN_URL,
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'X-Requested-With': 'XMLHttpRequest'
        },
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      this.isAuthenticatedFlag = false;
      // Redirect to login page
      window.location.href = '/login';
    }
  }

  public isAuthenticated(): boolean {
    return this.isAuthenticatedFlag;
  }
}

export default AuthService; 