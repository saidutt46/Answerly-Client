/* eslint-disable @typescript-eslint/no-explicit-any */
// src/utils/errorHandling.ts
/**
 * Centralized error handling utilities for the QA application
 * Provides consistent error handling, classification, and reporting
 */

import logger from './logger';

// Define error categories for better classification
export enum ErrorCategory {
  NETWORK = 'network',
  API = 'api',
  VALIDATION = 'validation',
  AUTH = 'authentication',
  PERMISSION = 'permission',
  INPUT = 'input',
  NOT_FOUND = 'not_found',
  TIMEOUT = 'timeout',
  SERVER = 'server',
  UNKNOWN = 'unknown',
}

// Application error class
export class AppError extends Error {
  public readonly category: ErrorCategory;
  public readonly code?: string;
  public readonly originalError?: Error;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public readonly context?: Record<string, any>;
  public readonly timestamp: Date;
  
  constructor(
    message: string,
    category: ErrorCategory = ErrorCategory.UNKNOWN,
    options: {
      code?: string;
      originalError?: Error;
      context?: Record<string, any>;
    } = {}
  ) {
    super(message);
    
    this.name = 'AppError';
    this.category = category;
    this.code = options.code;
    this.originalError = options.originalError;
    this.context = options.context;
    this.timestamp = new Date();
    
    // // Preserve stack trace
    // if (Error.captureStackTrace) {
    //   Error.captureStackTrace(this, AppError);
    // }
  }
}

// Regular expression patterns for identifying error types
const networkErrorPatterns = [
  /network error/i,
  /failed to fetch/i,
  /network request failed/i,
  /cannot connect to server/i,
  /offline/i,
];

const timeoutPatterns = [
  /timeout/i,
  /timed out/i,
  /request timed out/i,
];

const authPatterns = [
  /unauthorized/i,
  /unauthenticated/i,
  /invalid token/i,
  /expired token/i,
  /forbidden/i,
  /access denied/i,
  /not authorized/i,
];

// Define a type that represents properties we expect to find on error objects
interface ErrorLike {
  message?: string;
  toString?: () => string;
  status?: number;
  statusCode?: number;
  code?: string;
  errorCode?: string;
  response?: {
    status?: number;
  };
}

/**
 * Categorize an error based on error message or status code
 */
export const categorizeError = (error: unknown): ErrorCategory => {
  // Cast to ErrorLike type to safely access potential properties
  const errorObj = error as ErrorLike;
  
  const errorString = String(
    errorObj?.message || 
    (typeof errorObj?.toString === 'function' ? errorObj.toString() : null) || 
    'Unknown error'
  );
  
  const statusCode = errorObj?.status || errorObj?.statusCode || errorObj?.response?.status;
  
  // Check for network errors
  if (networkErrorPatterns.some(pattern => pattern.test(errorString))) {
    return ErrorCategory.NETWORK;
  }
  
  // Check for timeout errors
  if (timeoutPatterns.some(pattern => pattern.test(errorString))) {
    return ErrorCategory.TIMEOUT;
  }
  
  // Check for authentication/authorization errors
  if (authPatterns.some(pattern => pattern.test(errorString)) || 
      statusCode === 401 || 
      statusCode === 403) {
    return statusCode === 403 ? ErrorCategory.PERMISSION : ErrorCategory.AUTH;
  }
  
  // Status code-based categorization
  if (statusCode) {
    if (statusCode === 400) return ErrorCategory.VALIDATION;
    if (statusCode === 404) return ErrorCategory.NOT_FOUND;
    if (statusCode >= 500) return ErrorCategory.SERVER;
    if (statusCode >= 400) return ErrorCategory.API;
  }
  
  return ErrorCategory.UNKNOWN;
};

// Type for error context
type ErrorContext = Record<string, unknown>;

/**
 * Create a standard AppError from any error type
 */
export const createAppError = (
  error: unknown,
  defaultMessage = 'An unexpected error occurred',
  context?: ErrorContext
): AppError => {
  // If already an AppError, just return it
  if (error instanceof AppError) {
    return error;
  }
  
  // Cast to access potential properties
  const errorObj = error as ErrorLike;
  
  // Extract message
  const message = errorObj?.message || 
    (typeof errorObj?.toString === 'function' ? errorObj.toString() : null) || 
    defaultMessage;
  
  // Categorize the error
  const category = categorizeError(error);
  
  // Extract error code if available
  const code = errorObj?.code as string || 
               (errorObj as any)?.errorCode as string || 
               (errorObj?.status !== undefined ? String(errorObj.status) : undefined);
  
  // Create AppError with original error reference
  return new AppError(message, category, {
    code,
    originalError: error instanceof Error ? error : undefined,
    context,
  });
};

/**
 * Get a user-friendly error message
 */
export const getUserFriendlyMessage = (error: unknown): string => {
  const appError = error instanceof AppError ? error : createAppError(error);
  
  // Customize messages based on error category
  switch (appError.category) {
    case ErrorCategory.NETWORK:
      return 'Unable to connect to the server. Please check your internet connection and try again.';
    
    case ErrorCategory.TIMEOUT:
      return 'The request took too long to complete. Please try again later.';
    
    case ErrorCategory.AUTH:
      return 'You need to sign in to access this feature.';
    
    case ErrorCategory.PERMISSION:
      return 'You don\'t have permission to perform this action.';
    
    case ErrorCategory.VALIDATION:
      return appError.message || 'The information provided is invalid. Please check your input and try again.';
    
    case ErrorCategory.NOT_FOUND:
      return 'The requested information could not be found.';
    
    case ErrorCategory.SERVER:
      return 'The server encountered an error. Our team has been notified, and we\'re working to fix it.';
    
    case ErrorCategory.INPUT:
      return appError.message || 'Please check your input and try again.';
    
    default:
      return appError.message || 'An unexpected error occurred. Please try again.';
  }
};

/**
 * Log an error with appropriate severity and context
 */
export const logAndReportError = (
  error: unknown,
  context: string = 'Application Error',
  additionalData?: ErrorContext
): void => {
  const appError = error instanceof AppError ? error : createAppError(error);
  
  // Create data object with proper typing
  const logData: Record<string, unknown> = {
    category: appError.category,
    code: appError.code
  };
  
  // Only spread additionalData if it exists
  if (additionalData) {
    Object.entries(additionalData).forEach(([key, value]) => {
      logData[key] = value;
    });
  }
  
  // Different logging based on category
  switch (appError.category) {
    case ErrorCategory.NETWORK:
    case ErrorCategory.TIMEOUT:
      // Less severe - warning level
      logger.warn(`${context}: ${appError.message}`, logData);
      break;
    
    case ErrorCategory.VALIDATION:
    case ErrorCategory.INPUT:
    case ErrorCategory.AUTH:
    case ErrorCategory.PERMISSION:
      // User-related issues - info level with some details
      logger.info(`${context}: ${appError.message}`, logData);
      break;
    
    case ErrorCategory.SERVER:
    case ErrorCategory.NOT_FOUND:
    case ErrorCategory.UNKNOWN:
    default:
      // More severe - error level with full details
      { const errorContext: Record<string, unknown> = {
        category: appError.category,
        code: appError.code
      };
      
      // Add appError.context if it exists
      if (appError.context) {
        Object.entries(appError.context).forEach(([key, value]) => {
          errorContext[key] = value;
        });
      }
      
      // Add additionalData if it exists
      if (additionalData) {
        Object.entries(additionalData).forEach(([key, value]) => {
          errorContext[key] = value;
        });
      }
      
      logger.logError(
        `${context}: ${appError.message}`,
        appError.originalError || appError,
        errorContext
      ); }
  }
};

/**
 * Determine if an error should trigger an automatic retry
 */
export const shouldRetryOnError = (error: unknown): boolean => {
  const appError = error instanceof AppError ? error : createAppError(error);
  
  // Retry on network issues, timeouts, and server errors
  return [
    ErrorCategory.NETWORK,
    ErrorCategory.TIMEOUT,
    ErrorCategory.SERVER,
  ].includes(appError.category);
};

/**
 * Get recommended retry delay based on error type and retry count
 */
export const getRetryDelay = (error: unknown, retryCount: number): number => {
  const appError = error instanceof AppError ? error : createAppError(error);
  
  // Base delay in milliseconds
  const baseDelay = 1000;
  
  // Exponential backoff with jitter
  const exponentialDelay = baseDelay * Math.pow(1.5, retryCount);
  
  // Add some randomness (jitter) to avoid thundering herd problem
  const jitter = 0.5 + Math.random(); // Random multiplier between 0.5 and 1.5
  
  // Different delays for different error categories
  let multiplier = 1;
  
  switch (appError.category) {
    case ErrorCategory.NETWORK:
      multiplier = 0.7; // Shorter delay for network issues
      break;
    case ErrorCategory.TIMEOUT:
      multiplier = 1.5; // Longer delay for timeouts
      break;
    case ErrorCategory.SERVER:
      multiplier = 2.0; // Even longer delay for server errors
      break;
  }
  
  return Math.min(
    Math.floor(exponentialDelay * jitter * multiplier),
    30000 // Cap at 30 seconds
  );
};

// Create a namespaced error handling utility
const errorHandler = {
  AppError,
  ErrorCategory,
  categorizeError,
  createAppError,
  getUserFriendlyMessage,
  logAndReportError,
  shouldRetryOnError,
  getRetryDelay,
};

export default errorHandler;