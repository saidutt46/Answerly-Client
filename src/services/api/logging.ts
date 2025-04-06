// src/services/api/logging.ts
/**
 * API logging utilities
 */
import { AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';

// Enable/disable detailed API logging
const API_DEBUG = import.meta.env.VITE_API_DEBUG === 'true';

/**
 * Log API request details
 */
export const logApiRequest = (config: AxiosRequestConfig): void => {
  if (!API_DEBUG) return;

  const { method, baseURL, url, data } = config;
  const fullUrl = `${baseURL || ''}${url || ''}`;

  console.group(`🚀 API Request: ${method?.toUpperCase()} ${fullUrl}`);
  
  if (data && !isFileUpload(config)) {
    try {
      // Handle possible JSON strings
      const bodyData = typeof data === 'string' ? JSON.parse(data) : data;
      console.log('Request payload:', bodyData);
    } catch {
      console.log('Request payload:', data);
    }
  } else if (isFileUpload(config)) {
    console.log('Request payload: [File Upload]');
  }

  console.groupEnd();
};

/**
 * Log API response details
 */
export const logApiResponse = (response: AxiosResponse): void => {
  if (!API_DEBUG) return;

  const { config, status, data } = response;
  const { method, baseURL, url } = config;
  const fullUrl = `${baseURL || ''}${url || ''}`;

  console.group(`✅ API Response: ${method?.toUpperCase()} ${fullUrl} (${status})`);
  console.log('Response data:', data);
  console.log('Response time:', `${calculateResponseTime(response)}ms`);
  console.groupEnd();
};

/**
 * Log API error details
 */
export const logApiError = (error: AxiosError | Error): void => {
  // Always log errors, regardless of debug setting
  const prefix = '❌ API Error:';
  
  if ('isAxiosError' in error) {
    const { config, response, code } = error;
    
    if (config) {
      const { method, baseURL, url } = config;
      const fullUrl = `${baseURL || ''}${url || ''}`;
      
      console.error(
        `${prefix} ${method?.toUpperCase()} ${fullUrl} - ${code || 'ERROR'}`,
        {
          status: response?.status,
          statusText: response?.statusText,
          data: response?.data,
          error: error
        }
      );
    } else {
      console.error(`${prefix} Network Error`, error);
    }
  } else {
    console.error(`${prefix} ${error.message}`);
  }
};

/**
 * Calculate response time from Axios response
 */
const calculateResponseTime = (response: AxiosResponse): number => {
  if (response.config.headers) {
    const requestTime = response.config.headers['X-Request-Start'];
    if (requestTime && typeof requestTime === 'string') {
      return Date.now() - parseInt(requestTime, 10);
    }
  }
  return 0; // Unable to calculate
};

/**
 * Check if the request is a file upload
 */
const isFileUpload = (config: AxiosRequestConfig): boolean => {
  return config.headers?.['Content-Type']?.includes('multipart/form-data') || false;
};

/**
 * Log application error (not directly API-related)
 */
export const logAppError = (context: string, error: Error): void => {
  console.error(`❌ App Error: ${context}`, error);
};