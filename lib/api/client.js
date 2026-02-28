/**
 * API Client Configuration
 * Centralized axios instance with interceptors for request/response handling
 */

import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.medhaeclass.com/api';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 seconds
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add auth token to all requests
apiClient.interceptors.request.use(
  (config) => {
    // Get token from localStorage (for client-side) or cookies
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('access_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors globally
apiClient.interceptors.response.use(
  (response) => {
    return response.data;
  },
  async (error) => {
    const originalRequest = error.config;

    // Log error in development
    if (process.env.NODE_ENV === 'development') {
      console.error('[API Error Details]', {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        message: error.message,
        url: error.config?.url,
        baseURL: error.config?.baseURL,
        fullURL: error.config?.baseURL + error.config?.url,
        method: error.config?.method,
        headers: error.config?.headers,
      });
    }
    // Handle 401 Unauthorized - Token expired or invalid
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // CRITICAL: Don't refresh if user is logging out - prevents auto-relogin bug
      const isLoggingOut = typeof window !== 'undefined' && sessionStorage.getItem('logging_out');
      if (isLoggingOut) {
        return Promise.reject(error);
      }

      // SINGLE SESSION ENFORCEMENT: Handle SESSION_INVALID error
      // This happens when another device logs in and invalidates this session
      const errorCode = error.response?.data?.code;
      if (errorCode === 'SESSION_INVALID') {
        if (typeof window !== 'undefined') {
          // Store the reason for display on login page
          sessionStorage.setItem('force_logout_reason',
            error.response?.data?.msg || 'Your session was invalidated because your account was accessed from another device.'
          );
          sessionStorage.setItem('logging_out', 'true');

          // Clear all auth data
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('user');
          document.cookie = 'access_token=; path=/; max-age=0; SameSite=Strict';

          // Redirect to login
          window.location.replace('/login');
        }
        return Promise.reject(error);
      }

      try {
        // Attempt to refresh token
        const refreshToken = localStorage.getItem('refresh_token');
        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/auth/refresh-token`, {
            refreshToken: refreshToken,
          });

          // Backend returns { data: { accessToken: string, refreshToken: string } }
          const newAccessToken = response.data?.data?.accessToken;
          const newRefreshToken = response.data?.data?.refreshToken;

          if (newAccessToken) {
            localStorage.setItem('access_token', newAccessToken);
            document.cookie = `access_token=${newAccessToken}; path=/; max-age=${60 * 60 * 24}; SameSite=Strict`;

            // Also update refresh token if provided
            if (newRefreshToken) {
              localStorage.setItem('refresh_token', newRefreshToken);
            }

            // Retry original request with new token
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            return apiClient(originalRequest);
          }
        }
      } catch (refreshError) {
        // Refresh failed, logout user (only if not already logging out)
        if (typeof window !== 'undefined' && !sessionStorage.getItem('logging_out')) {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('user');
          document.cookie = 'access_token=; path=/; max-age=0; SameSite=Strict';
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      }
    }

    // Handle 403 Forbidden
    if (error.response?.status === 403) {
      // User doesn't have permission
      console.error('Access forbidden');
    }

    // Handle 404 Not Found
    if (error.response?.status === 404) {
      console.error('Resource not found');
    }

    // Handle 500 Server Error
    if (error.response?.status >= 500) {
      console.error('Server error occurred');
    }

    // Return standardized error
    // Note: Backend uses 'msg' field, some APIs use 'message'
    return Promise.reject({
      message: error.response?.data?.msg || error.response?.data?.message || error.message || 'An error occurred',
      status: error.response?.status,
      data: error.response?.data,
    });
  }
);

// Helper function for multipart/form-data requests (file uploads)
export const createMultipartConfig = () => ({
  headers: {
    'Content-Type': 'multipart/form-data',
  },
});

export default apiClient;
