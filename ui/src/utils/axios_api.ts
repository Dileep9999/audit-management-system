// mockApi.ts
import axios, { AxiosError } from 'axios';

interface ApiErrorResponse {
  message: string;
  errors?: Record<string, string[]>;
}

// Create a base axios instance
const api = axios.create({
  baseURL: "http://localhost:8000",
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true,  // Important for session cookies
  xsrfCookieName: 'csrftoken',
  xsrfHeaderName: 'X-CSRFToken',
});

// Request interceptor
api.interceptors.request.use(
  async (config) => {
    // Get CSRF token from cookie
    const cookies = document.cookie.split(';');
    const csrfCookie = cookies.find(cookie => cookie.trim().startsWith('csrftoken='));
    if (csrfCookie) {
      const csrfToken = csrfCookie.split('=')[1];
      config.headers['X-CSRFToken'] = csrfToken;
    }

    // Handle FormData - remove Content-Type header to let browser set it with boundary
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }

    // Log request details for debugging
    console.log('API Request:', {
      url: config.url,
      method: config.method,
      headers: config.headers,
      cookies: document.cookie,
      withCredentials: config.withCredentials,
      isFormData: config.data instanceof FormData
    });

    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    // Log response details for debugging
    console.log('API Response:', {
      url: response.config.url,
      status: response.status,
      headers: response.headers,
      cookies: document.cookie,
      data: response.data
    });
    return response;
  },
  async (error: AxiosError<ApiErrorResponse>) => {
    // Log error details for debugging
    console.error('API Error:', {
      url: error.config?.url,
      status: error.response?.status,
      headers: error.response?.headers,
      cookies: document.cookie,
      data: error.response?.data
    });

    // Handle 401 Unauthorized errors
    if (error.response?.status === 401) {
      // Get the current path
      const currentPath = window.location.pathname;
      
      // Only redirect if we're not already on the login page
      if (!currentPath.includes('/login')) {
        // Store the current path to redirect back after login
        localStorage.setItem('redirectAfterLogin', currentPath);
        
        // Clear any existing auth state
        localStorage.removeItem('isRedirecting');
        
        // Redirect to Django login page
        const nextParam = encodeURIComponent(`/#${currentPath}`);
        window.location.href = `http://localhost:8000/login/?next=${nextParam}`;
      }
    }
    
    // Handle other errors
    const errorMessage = error.response?.data?.message || error.message || 'An error occurred';
    console.error('API Error Message:', errorMessage);
    
    return Promise.reject(error);
  }
);

export const apiGet = <T>(url: string) => api.get<T>(url).then(response => response.data);
export const apiPost = <T>(url: string, data?: any) => api.post<T>(url, data).then(response => response.data);
export const apiPut = <T>(url: string, data?: any) => api.put<T>(url, data).then(response => response.data);
export const apiDelete = <T>(url: string) => api.delete<T>(url).then(response => response.data);

export default api;
