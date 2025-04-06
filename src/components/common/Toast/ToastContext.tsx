// src/components/common/Toast/ToastContext.tsx
import React, { createContext, useContext, useReducer, useCallback } from 'react';

// Toast types for different visual styles
export type ToastType = 'info' | 'success' | 'warning' | 'error';

// Toast notification item structure
export interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration?: number; // Duration in milliseconds
  isPersistent?: boolean; // Whether the toast requires manual dismissal
}

// Toast context state
interface ToastContextState {
  toasts: Toast[];
}

// Toast context actions
type ToastAction =
  | { type: 'ADD_TOAST'; payload: Toast }
  | { type: 'REMOVE_TOAST'; payload: string }
  | { type: 'CLEAR_ALL_TOASTS' };

// Toast context value interface
interface ToastContextValue extends ToastContextState {
  addToast: (
    message: string,
    type?: ToastType,
    options?: { duration?: number; isPersistent?: boolean }
  ) => string;
  removeToast: (id: string) => void;
  clearAllToasts: () => void;
}

// Initial state
const initialState: ToastContextState = {
  toasts: [],
};

// Context creation
const ToastContext = createContext<ToastContextValue | undefined>(undefined);

// Reducer for toast state management
const toastReducer = (state: ToastContextState, action: ToastAction): ToastContextState => {
  switch (action.type) {
    case 'ADD_TOAST':
      return {
        ...state,
        toasts: [...state.toasts, action.payload],
      };
      
    case 'REMOVE_TOAST':
      return {
        ...state,
        toasts: state.toasts.filter((toast) => toast.id !== action.payload),
      };
      
    case 'CLEAR_ALL_TOASTS':
      return {
        ...state,
        toasts: [],
      };
      
    default:
      return state;
  }
};

// Default toast durations by type (in milliseconds)
const DEFAULT_DURATIONS: Record<ToastType, number> = {
  info: 5000,
  success: 3000,
  warning: 5000,
  error: 8000,
};

// Generate unique ID for toasts
const generateId = (): string => {
  return `toast-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
};

// Provider component
export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(toastReducer, initialState);

  // Add a new toast notification
  const addToast = useCallback(
    (
      message: string,
      type: ToastType = 'info',
      options?: { duration?: number; isPersistent?: boolean }
    ): string => {
      const id = generateId();
      const duration = options?.duration ?? DEFAULT_DURATIONS[type];
      const isPersistent = options?.isPersistent ?? type === 'error';

      const toast: Toast = {
        id,
        message,
        type,
        duration,
        isPersistent,
      };

      dispatch({ type: 'ADD_TOAST', payload: toast });

      // Auto-dismiss non-persistent toasts
      if (!isPersistent && duration !== Infinity) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }

      return id;
    },
    []
  );

  // Remove a toast notification by ID
  const removeToast = useCallback((id: string) => {
    dispatch({ type: 'REMOVE_TOAST', payload: id });
  }, []);

  // Clear all toast notifications
  const clearAllToasts = useCallback(() => {
    dispatch({ type: 'CLEAR_ALL_TOASTS' });
  }, []);

  // Context value
  const value: ToastContextValue = {
    toasts: state.toasts,
    addToast,
    removeToast,
    clearAllToasts,
  };

  return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>;
};

// Custom hook to use the toast context
export const useToast = (): ToastContextValue => {
  const context = useContext(ToastContext);
  
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  
  return context;
};