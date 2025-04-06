// src/contexts/QAContext.tsx
import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import { logAppError } from '../services/api/logging';
import { useModels, useQuestionAnswering, useFileQuestionAnswering } from '../services/api/hooks';
import { getUserFriendlyErrorMessage } from '../services/api/errorHandling';

// Define types for our context state
export interface ChatMessage {
  id: string;
  type: 'question' | 'answer' | 'error';
  content: string;
  timestamp: Date;
  metadata?: {
    confidence?: number;
    processingTime?: number;
    modelUsed?: string;
  };
}

export interface Model {
  id: string;
  name: string;
  description?: string;
}

export type ContextSource = 'file' | 'text' | null;

// Define the actions for our reducer
type QAAction =
  | { type: 'SET_MODELS'; payload: Model[] }
  | { type: 'SET_DEFAULT_MODEL'; payload: string }
  | { type: 'SET_SELECTED_MODEL'; payload: string }
  | { type: 'SET_CONTEXT'; payload: { text: string | null; source: ContextSource; file: File | null } }
  | { type: 'ADD_MESSAGE'; payload: ChatMessage }
  | { type: 'CLEAR_CHAT' }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_UPLOAD_PROGRESS'; payload: number };

// Define the state shape
interface QAState {
  models: Model[];
  defaultModelId: string;
  selectedModelId: string;
  context: string | null;
  contextSource: ContextSource;
  contextFile: File | null;
  chatHistory: ChatMessage[];
  isLoading: boolean;
  error: string | null;
  uploadProgress: number;
}

// Initial state
const initialState: QAState = {
  models: [],
  defaultModelId: '',
  selectedModelId: '',
  context: null,
  contextSource: null,
  contextFile: null,
  chatHistory: [],
  isLoading: false,
  error: null,
  uploadProgress: 0,
};

// Create a reducer to handle state updates
const qaReducer = (state: QAState, action: QAAction): QAState => {
  switch (action.type) {
    case 'SET_MODELS':
      return { ...state, models: action.payload };
      
    case 'SET_DEFAULT_MODEL':
      return { ...state, defaultModelId: action.payload };
      
    case 'SET_SELECTED_MODEL':
      return { ...state, selectedModelId: action.payload };
      
    case 'SET_CONTEXT':
      return { 
        ...state, 
        context: action.payload.text, 
        contextSource: action.payload.source,
        contextFile: action.payload.file
      };
      
    case 'ADD_MESSAGE':
      return { 
        ...state, 
        chatHistory: [...state.chatHistory, action.payload] 
      };
      
    case 'CLEAR_CHAT':
      return { ...state, chatHistory: [] };
      
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
      
    case 'SET_ERROR':
      return { ...state, error: action.payload };
      
    case 'SET_UPLOAD_PROGRESS':
      return { ...state, uploadProgress: action.payload };
      
    default:
      return state;
  }
};

// Define the context interface
interface QAContextInterface extends QAState {
  // Actions
  setSelectedModel: (modelId: string) => void;
  setContext: (text: string | null, source: ContextSource, file: File | null) => void;
  askQuestion: (question: string) => Promise<void>;
  clearChat: () => void;
  resetError: () => void;
}

// Create the context
const QAContext = createContext<QAContextInterface | undefined>(undefined);

// Create a provider component
export const QAProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Use our reducer for complex state management
  const [state, dispatch] = useReducer(qaReducer, initialState);
  
  // Use our custom hooks for API interactions
  const { 
    models: modelsData, 
    // defaultModel, // Removed unused variable
    loading: modelsLoading, 
    error: modelsError,
    refetch: refetchModels
  } = useModels();
  
  const {
    askQuestion: apiAskQuestion,
    loading: questionLoading,
    // error: questionError, // Removed unused variable
    // reset: resetQuestionState // Removed unused variable
  } = useQuestionAnswering();
  
  const {
    processFile: apiProcessFile,
    loading: fileLoading,
    // error: fileError, // Removed unused variable
    uploadProgress,
    // reset: resetFileState // Removed unused variable
  } = useFileQuestionAnswering();

  // Helper function to generate a unique ID for messages
  const generateMessageId = (): string => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  };

  // Initialize models when available
  useEffect(() => {
    if (modelsData && modelsData.models) {
      try {
        // Transform models data to our internal format
        const modelsList: Model[] = Object.entries(modelsData.models).map(([id, info]) => ({
          id,
          name: info.name,
          description: info.description,
        }));
        
        dispatch({ type: 'SET_MODELS', payload: modelsList });
        
        // Set default model from API
        if (modelsData.default_model) {
          dispatch({ type: 'SET_DEFAULT_MODEL', payload: modelsData.default_model });
          
          // If no model is currently selected, use the default
          if (!state.selectedModelId) {
            dispatch({ type: 'SET_SELECTED_MODEL', payload: modelsData.default_model });
          }
        }
      } catch (error) {
        const errorMessage = getUserFriendlyErrorMessage(error);
        dispatch({ type: 'SET_ERROR', payload: errorMessage });
        logAppError('Failed to process models data', error as Error);
      }
    }
  }, [modelsData, state.selectedModelId]);

  // Handle models loading errors
  useEffect(() => {
    if (modelsError) {
      dispatch({ type: 'SET_ERROR', payload: modelsError });
      
      // Attempt to refetch models after a delay
      const retryTimer = setTimeout(() => {
        refetchModels();
      }, 5000);
      
      return () => clearTimeout(retryTimer);
    }
  }, [modelsError, refetchModels]);

  // Update loading state based on various loading indicators
  useEffect(() => {
    const isLoading = modelsLoading || questionLoading || fileLoading;
    dispatch({ type: 'SET_LOADING', payload: isLoading });
  }, [modelsLoading, questionLoading, fileLoading]);

  // Update upload progress
  useEffect(() => {
    dispatch({ type: 'SET_UPLOAD_PROGRESS', payload: uploadProgress });
  }, [uploadProgress]);

  // Set selected model
  const setSelectedModel = useCallback((modelId: string) => {
    dispatch({ type: 'SET_SELECTED_MODEL', payload: modelId });
  }, []);

  // Set context
  const setContext = useCallback((text: string | null, source: ContextSource, file: File | null) => {
    dispatch({ 
      type: 'SET_CONTEXT', 
      payload: { text, source, file } 
    });
  }, []);

  // Handle asking a question
  const askQuestion = useCallback(async (question: string) => {
    // Validate inputs
    if (!question.trim()) {
      dispatch({ type: 'SET_ERROR', payload: 'Question cannot be empty' });
      return;
    }

    if (!state.context && !state.contextFile) {
      dispatch({ type: 'SET_ERROR', payload: 'Please provide context before asking a question' });
      return;
    }

    // Reset any previous errors
    dispatch({ type: 'SET_ERROR', payload: null });

    // Add question to chat history
    const questionMessage: ChatMessage = {
      id: generateMessageId(),
      type: 'question',
      content: question,
      timestamp: new Date(),
    };
    dispatch({ type: 'ADD_MESSAGE', payload: questionMessage });

    try {
      // Process based on context source
      if (state.contextSource === 'file' && state.contextFile) {
        // File-based question
        const fileAnswer = await apiProcessFile(
          state.contextFile,
          question,
          state.selectedModelId
        );
        
        if (fileAnswer && fileAnswer.answer) {
          // Add answer to chat history
          const answerMessage: ChatMessage = {
            id: generateMessageId(),
            type: 'answer',
            content: fileAnswer.answer,
            timestamp: new Date(),
            metadata: {
              confidence: fileAnswer.confidence,
              processingTime: fileAnswer.processing_time,
              modelUsed: fileAnswer.model_used,
            },
          };
          dispatch({ type: 'ADD_MESSAGE', payload: answerMessage });
        } else {
          throw new Error('Received empty response from the server');
        }
      } else if (state.contextSource === 'text' && state.context) {
        // Text-based question
        const textAnswer = await apiAskQuestion(
          question,
          state.context,
          state.selectedModelId
        );
        
        if (textAnswer && textAnswer.answer) {
          // Add answer to chat history
          const answerMessage: ChatMessage = {
            id: generateMessageId(),
            type: 'answer',
            content: textAnswer.answer,
            timestamp: new Date(),
            metadata: {
              confidence: textAnswer.confidence,
              processingTime: textAnswer.processing_time,
              modelUsed: textAnswer.model_used,
            },
          };
          dispatch({ type: 'ADD_MESSAGE', payload: answerMessage });
        } else {
          throw new Error('Received empty response from the server');
        }
      } else {
        throw new Error('Invalid context state');
      }
    } catch (error) {
      const errorMessage = getUserFriendlyErrorMessage(error);
      
      // Add error message to chat history
      const errorChatMessage: ChatMessage = {
        id: generateMessageId(),
        type: 'error',
        content: `I encountered an error: ${errorMessage}`,
        timestamp: new Date(),
      };
      dispatch({ type: 'ADD_MESSAGE', payload: errorChatMessage });
      
      // Set global error state
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      
      // Log the error
      logAppError('Error processing question', error instanceof Error ? error : new Error(String(error)));
    }
  }, [state.context, state.contextFile, state.contextSource, state.selectedModelId, apiAskQuestion, apiProcessFile]);

  // Clear chat history
  const clearChat = useCallback(() => {
    dispatch({ type: 'CLEAR_CHAT' });
  }, []);

  // Reset error state
  const resetError = useCallback(() => {
    dispatch({ type: 'SET_ERROR', payload: null });
  }, []);

  // Combined context value
  const contextValue: QAContextInterface = {
    ...state,
    setSelectedModel,
    setContext,
    askQuestion,
    clearChat,
    resetError,
  };

  return (
    <QAContext.Provider value={contextValue}>
      {children}
    </QAContext.Provider>
  );
};

// Custom hook for using the QA context
export const useQA = (): QAContextInterface => {
  const context = useContext(QAContext);
  
  if (context === undefined) {
    throw new Error('useQA must be used within a QAProvider');
  }
  
  return context;
};