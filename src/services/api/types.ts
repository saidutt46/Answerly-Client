// src/services/api/types.ts
/**
 * Type definitions for API requests and responses
 */

// Model information returned by the API
export interface ModelInfo {
    name: string;
    model_id: string;
    is_loaded: boolean;
    description?: string;
  }
  
  // Response from /api/models endpoint
  export interface ModelsResponse {
    models: Record<string, ModelInfo>;
    default_model: string;
  }
  
  // Request payload for /api/qa endpoint
  export interface QARequest {
    question: string;
    context: string;
    model_name?: string;
  }
  
  // Response from /api/qa and /api/upload endpoints
  export interface QAResponse {
    answer: string;
    confidence: number;
    context: string;
    model_used: string;
    processing_time: number;
  }
  
  // Custom error structure for API errors
  export interface ApiError {
    status: number;
    message: string;
    details?: unknown;
  }
  
  // File upload options
  export interface FileUploadOptions {
    question: string;
    modelName?: string;
    onProgress?: (progress: number) => void;
  }