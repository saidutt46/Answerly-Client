// src/services/api/client.ts
/**
 * Base API client configuration
 */
import axios, { AxiosInstance, AxiosRequestConfig, AxiosError } from 'axios';
import { logApiRequest, logApiResponse, logApiError } from './logging';
import { ApiError } from './types';
import { AxiosHeaders } from 'axios';

interface ErrorResponseData {
  detail?: string;
  message?: string;
  errors?: Record<string, string[]>;
}

// Create axios instance with default config
const createApiClient = (config?: AxiosRequestConfig): AxiosInstance => {
  const defaultConfig: AxiosRequestConfig = {
    baseURL: import.meta.env.VITE_API_URL || '/api',
    timeout: 30000, // 30 second timeout
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
  };

  const client = axios.create({
    ...defaultConfig,
    ...config,
  });

  // Request interceptor for logging and other preprocessing
  client.interceptors.request.use(
    (config) => {
      // Add request ID for tracking
      const requestId = `req_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      config.headers = new AxiosHeaders({
        ...config.headers,
        'X-Request-ID': requestId,
        'X-Request-Start': Date.now().toString(),
      });
      
      logApiRequest(config);
      return config;
    },
    (error) => {
      logApiError(error);
      return Promise.reject(error);
    }
  );

  // Response interceptor for logging and error handling
  client.interceptors.response.use(
    (response) => {
      logApiResponse(response);
      return response;
    },
    (error: AxiosError) => {
      logApiError(error);
      
      // Transform error to our standard API error format
      const apiError: ApiError = {
        status: error.response?.status || 0,
        message: getErrorMessage(error),
        details: error.response?.data || error,
      };

      return Promise.reject(apiError);
    }
  );

  return client;
};

// Helper function to extract meaningful error messages
const getErrorMessage = (error: AxiosError): string => {
  // Network errors
  if (error.code === 'ECONNABORTED') {
    return 'Request timed out. Please try again.';
  }
  
  if (error.code === 'ERR_NETWORK') {
    return 'Network error. Please check your internet connection.';
  }

  // Server errors
  if (error.response) {
    const status = error.response.status;
    const data = error.response.data as ErrorResponseData;
    
    // If the server returned a specific error message, use it
    if (data && data.detail) {
      return data.detail;
    }

    // Generic messages based on status code
    if (status >= 500) {
      return 'Server error. Please try again later.';
    }
    
    if (status === 404) {
      return 'The requested resource was not found.';
    }
    
    if (status === 403) {
      return 'You don\'t have permission to access this resource.';
    }
    
    if (status === 401) {
      return 'Authentication required. Please sign in.';
    }
    
    if (status === 400) {
      return 'Invalid request. Please check your input.';
    }
  }

  // Default fallback message
  return error.message || 'An unexpected error occurred. Please try again.';
};

// Export a singleton instance for general use
export const apiClient = createApiClient();

// Export the factory function for cases where custom config is needed
export default createApiClient;