// src/services/api/qaService.ts
/**
 * QA Application API Service
 * Provides methods for interacting with the QA backend API
 */
import { apiClient } from './client';
import { logAppError } from './logging';
import { ModelsResponse, QARequest, QAResponse, ApiError, FileUploadOptions } from './types';
import { AxiosProgressEvent, AxiosError } from 'axios';

class QAApiService {
  /**
   * Fetch available models from the API
   * @returns Promise with models information
   */
  async getModels(): Promise<ModelsResponse> {
    try {
      const response = await apiClient.get<ModelsResponse>('/models');
      return response.data;
    } catch (error) {
      logAppError('Failed to fetch models', error as Error);
      throw this.handleError(error, 'Unable to fetch available models');
    }
  }

  /**
   * Submit a question with text context
   * @param question - Question to ask
   * @param context - Text context to find the answer in
   * @param modelName - Optional model to use (will use default if not specified)
   * @param signal - Optional AbortSignal for request cancellation
   * @returns Promise with question answer and metadata
   */
  async askQuestion(
    question: string,
    context: string,
    modelName?: string,
    signal?: AbortSignal
  ): Promise<QAResponse> {
    // Input validation
    if (!question.trim()) {
      throw new Error('Question cannot be empty');
    }
    
    if (!context.trim()) {
      throw new Error('Context cannot be empty');
    }

    try {
      const requestData: QARequest = {
        question,
        context,
        ...(modelName && { model_name: modelName }),
      };

      const response = await apiClient.post<QAResponse>('/qa', requestData, { signal });
      return response.data;
    } catch (error) {
      logAppError('Failed to get answer', error as Error);
      throw this.handleError(error, 'Failed to process your question');
    }
  }

  /**
   * Upload a file and ask a question about its content
   * @param file - File to upload (PDF or text)
   * @param options - Upload options including question and model
   * @param timeout - Optional custom timeout for large files (in milliseconds)
   * @param signal - Optional AbortSignal for request cancellation
   * @returns Promise with question answer and metadata
   */
  async uploadFileAndAsk(
    file: File,
    options: FileUploadOptions,
    timeout?: number,
    signal?: AbortSignal
  ): Promise<QAResponse> {
    // Input validation
    if (!file) {
      throw new Error('No file provided');
    }
    
    if (!options.question.trim()) {
      throw new Error('Question cannot be empty');
    }

    // Validate file type
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    if (!fileExtension || !['pdf', 'txt'].includes(fileExtension)) {
      throw new Error('Invalid file type. Only PDF and TXT files are supported.');
    }

    // Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024; // 10MB in bytes
    if (file.size > maxSize) {
      throw new Error(`File too large. Maximum size: ${this.formatFileSize(maxSize)}`);
    }

    try {
      // Create form data for multipart request
      const formData = new FormData();
      formData.append('file', file);
      formData.append('question', options.question);
      
      if (options.modelName) {
        formData.append('model_name', options.modelName);
      }

      // Special config for file uploads
      const config = {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: timeout || 60000, // Allow custom timeout for large files (default 60s)
        onUploadProgress: (progressEvent: AxiosProgressEvent) => {
          if (options.onProgress && progressEvent.total) {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            options.onProgress(percentCompleted);
          }
        },
        signal
      };

      const response = await apiClient.post<QAResponse>('/upload', formData, config);
      return response.data;
    } catch (error) {
      logAppError('Failed to upload file and get answer', error as Error);
      throw this.handleError(error, 'Failed to process your file');
    }
  }

  /**
   * Format file size in a human-readable format
   * @param bytes - File size in bytes
   * @returns Formatted file size string
   */
  private formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} bytes`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  /**
   * Standardize error handling
   * @param error - Error object
   * @param fallbackMessage - Default message if error is not recognized
   * @returns Standardized ApiError
   */
  private handleError(error: unknown, fallbackMessage: string): ApiError {
    if (error instanceof AxiosError) {
      return {
        status: error.response?.status || 0,
        message: error.message,
        details: error.response?.data
      };
    }
    return {
      status: 0,
      message: error instanceof Error ? error.message : fallbackMessage,
      details: error
    };
  }
}

// Export a singleton instance
export const qaApiService = new QAApiService();

export default qaApiService;