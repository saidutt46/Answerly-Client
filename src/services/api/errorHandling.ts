// src/services/api/errorHandling.ts
/**
 * Utilities for handling and displaying API errors
 */
import { ApiError } from './types';

/**
 * Extract a user-friendly error message from an API error
 * @param error - The error object from API call
 * @returns A user-friendly error message
 */
export const getUserFriendlyErrorMessage = (error: unknown): string => {
  // If it's already our standard ApiError format
  if (isApiError(error)) {
    return error.message;
  }
  
  // If it's a standard Error object
  if (error instanceof Error) {
    return error.message;
  }
  
  // If it's a string
  if (typeof error === 'string') {
    return error;
  }
  
  // Default fallback
  return 'An unexpected error occurred. Please try again.';
};

/**
 * Check if an error is an ApiError
 * @param error - The error to check
 * @returns True if the error is an ApiError
 */
export const isApiError = (error: unknown): error is ApiError => {
  return (
    typeof error === 'object' &&
    error !== null &&
    'status' in error &&
    'message' in error
  );
};

/**
 * Get HTTP status code from error object
 * @param error - The error object
 * @returns The HTTP status code or 0 if not available
 */
export const getErrorStatusCode = (error: unknown): number => {
  if (isApiError(error)) {
    return error.status;
  }
  return 0;
};

/**
 * Check if error is a network error (no connection)
 * @param error - The error object
 * @returns True if it's a network error
 */
export const isNetworkError = (error: unknown): boolean => {
  if (isApiError(error)) {
    return error.status === 0;
  }
  return false;
};

/**
 * Check if error is a server error (5xx)
 * @param error - The error object
 * @returns True if it's a server error
 */
export const isServerError = (error: unknown): boolean => {
  if (isApiError(error)) {
    return error.status >= 500 && error.status < 600;
  }
  return false;
};

/**
 * Check if error is a client error (4xx)
 * @param error - The error object
 * @returns True if it's a client error
 */
export const isClientError = (error: unknown): boolean => {
  if (isApiError(error)) {
    return error.status >= 400 && error.status < 500;
  }
  return false;
};

/**
 * Get appropriate retry strategy for an error
 * @param error - The error object
 * @returns Object with shouldRetry flag and recommended delay
 */
export const getRetryStrategy = (error: unknown): { shouldRetry: boolean; delay: number } => {
  // Network errors can be retried
  if (isNetworkError(error)) {
    return { shouldRetry: true, delay: 2000 }; // 2 seconds
  }
  
  // Server errors can be retried with exponential backoff
  if (isServerError(error)) {
    return { shouldRetry: true, delay: 5000 }; // 5 seconds
  }
  
  // Client errors should not be retried
  if (isClientError(error)) {
    return { shouldRetry: false, delay: 0 };
  }
  
  // Default: don't retry
  return { shouldRetry: false, delay: 0 };
};