// src/services/api/hooks.ts
/**
 * React hooks for API service integration
 */
import { useState, useCallback, useEffect, useRef } from 'react';
import qaApiService from './qaService';
import { getUserFriendlyErrorMessage, getRetryStrategy } from './errorHandling';
import { ModelsResponse, QAResponse, FileUploadOptions } from './types';

/**
 * Hook for fetching available QA models
 * @returns State and functions for model data
 */
export const useModels = () => {
  const [models, setModels] = useState<ModelsResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Track component mount state to prevent state updates after unmount
  const isMounted = useRef(true);
  
  useEffect(() => {
    // Set up mount status tracking
    return () => {
      isMounted.current = false;
    };
  }, []);

  const fetchModels = useCallback(async (retry = true, retryAttempt = 0) => {
    if (loading) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const data = await qaApiService.getModels();
      
      if (isMounted.current) {
        setModels(data);
        setLoading(false);
      }
    } catch (err) {
      // Only update state if component is still mounted
      if (isMounted.current) {
        const errorMessage = getUserFriendlyErrorMessage(err);
        setError(errorMessage);
        setLoading(false);
        
        // Handle automatic retry for certain errors
        if (retry && retryAttempt < 3) {
          const { shouldRetry, delay } = getRetryStrategy(err);
          
          if (shouldRetry) {
            const retryTimer = setTimeout(() => {
              fetchModels(true, retryAttempt + 1);
            }, delay);
            
            return () => clearTimeout(retryTimer);
          }
        }
      }
    }
  }, [loading]);

  // Auto-fetch models on first render
  useEffect(() => {
    fetchModels();
  }, [fetchModels]);

  return {
    models,
    defaultModel: models?.default_model || null,
    loading,
    error,
    refetch: () => fetchModels(true, 0),
  };
};

/**
 * Hook for asking questions with text context
 * @returns State and functions for question answering
 */
export const useQuestionAnswering = () => {
  const [answer, setAnswer] = useState<QAResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const controller = useRef<AbortController | null>(null);

  const askQuestion = useCallback(
    async (question: string, context: string, modelName?: string) => {
      // Cancel previous request if exists
      if (controller.current) {
        controller.current.abort();
      }
      
      // Create new controller
      controller.current = new AbortController();
      
      setLoading(true);
      setError(null);
      
      try {
        const response = await qaApiService.askQuestion(
          question,
          context,
          modelName,
          controller.current.signal
        );
        setAnswer(response);
        setLoading(false);
        return response;
      } catch (err) {
        // Don't update state if aborted
        if (err instanceof Error && err.name === 'AbortError') {
          return null;
        }
        
        const errorMessage = getUserFriendlyErrorMessage(err);
        setError(errorMessage);
        setLoading(false);
        throw err;
      }
    },
    []
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (controller.current) {
        controller.current.abort();
      }
    };
  }, []);

  return {
    answer,
    loading,
    error,
    askQuestion,
    reset: () => {
      setAnswer(null);
      setError(null);
    },
    cancel: () => {
      if (controller.current) {
        controller.current.abort();
        controller.current = null;
        setLoading(false);
      }
    }
  };
};

/**
 * Hook for file upload and question answering
 * @returns State and functions for file processing
 */
export const useFileQuestionAnswering = () => {
  const [answer, setAnswer] = useState<QAResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const controller = useRef<AbortController | null>(null);

  const processFile = useCallback(
    async (file: File, question: string, modelName?: string, timeout?: number) => {
      // Cancel previous request if exists
      if (controller.current) {
        controller.current.abort();
      }
      
      // Create new controller
      controller.current = new AbortController();
      
      setLoading(true);
      setError(null);
      setUploadProgress(0);
      
      try {
        const options: FileUploadOptions = {
          question,
          modelName,
          onProgress: (progress) => {
            setUploadProgress(progress);
          },
        };
        
        const response = await qaApiService.uploadFileAndAsk(
          file, 
          options, 
          timeout,
          controller.current.signal
        );
        setAnswer(response);
        setLoading(false);
        return response;
      } catch (err) {
        // Don't update state if aborted
        if (err instanceof Error && err.name === 'AbortError') {
          return null;
        }
        
        const errorMessage = getUserFriendlyErrorMessage(err);
        setError(errorMessage);
        setLoading(false);
        throw err;
      }
    },
    []
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (controller.current) {
        controller.current.abort();
      }
    };
  }, []);

  return {
    answer,
    loading,
    error,
    uploadProgress,
    processFile,
    reset: () => {
      setAnswer(null);
      setError(null);
      setUploadProgress(0);
    },
    cancel: () => {
      if (controller.current) {
        controller.current.abort();
        controller.current = null;
        setLoading(false);
      }
    }
  };
};