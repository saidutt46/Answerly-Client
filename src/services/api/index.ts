// src/services/api/index.ts
/**
 * Main API service export file
 * Centralizes all API-related exports
 */

// Export types
export * from './types';

// Export services
export { qaApiService as default } from './qaService';
export { qaApiService } from './qaService';

// Export client for custom configurations
export { apiClient, default as createApiClient } from './client';

// Export logging utilities for potential custom logging implementations
export * from './logging';