// mockApi.ts
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from "axios";

interface ApiErrorResponse {
  message?: string;
  [key: string]: any;
}

// Create a base axios instance
const api = axios.create({
  baseURL: "http://localhost:8000",
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true  // Important for session cookies
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
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiErrorResponse>) => {
    // Handle 401 Unauthorized errors
    if (error.response?.status === 401) {
      // Get the current path
      const currentPath = window.location.pathname;
      
      // Only redirect if we're not already on the login page
      if (!currentPath.includes('/login')) {
        // Store the current path to redirect back after login
        sessionStorage.setItem('redirectAfterLogin', currentPath);
        
        // Redirect to login page
        window.location.href = '/login';
      }
    }
    
    // Handle other errors
    const errorMessage = error.response?.data?.message || error.message || 'An error occurred';
    console.error('API Error:', errorMessage);
    
    return Promise.reject(error);
  }
);

// Helper functions for API calls
export const apiGet = async <T = any>(url: string, config?: AxiosRequestConfig): Promise<T> => {
  const response = await api.get<T>(url, config);
  return response.data;
};

export const apiPost = async <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
  const response = await api.post<T>(url, data, config);
  return response.data;
};

export const apiPut = async <T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> => {
  const response = await api.put<T>(url, data, config);
  return response.data;
};

export const apiDelete = async <T = any>(url: string, config?: AxiosRequestConfig): Promise<T> => {
  const response = await api.delete<T>(url, config);
  return response.data;
};

export default api;
