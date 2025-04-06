// src/utils/logger.ts
/**
 * Centralized logging utility for the QA application
 * Provides consistent logging across the application with support for
 * different log levels and environments
 */

// Log levels in order of severity
export enum LogLevel {
    DEBUG = 0,
    INFO = 1,
    WARN = 2,
    ERROR = 3,
    NONE = 4, // Used to disable logging
  }
  
  // Configuration options for the logger
  interface LoggerConfig {
    level: LogLevel;
    enableConsole: boolean;
    enableRemote: boolean;
    remoteEndpoint?: string;
    appPrefix?: string;
  }
  
  // Default configuration based on environment
  const getDefaultConfig = (): LoggerConfig => {
    const isDevelopment = import.meta.env.DEV;
    
    return {
      level: isDevelopment ? LogLevel.DEBUG : LogLevel.WARN,
      enableConsole: true,
      enableRemote: !isDevelopment,
      appPrefix: 'QA-App',
    };
  };
  
  // Logger instance and state
  let config: LoggerConfig = getDefaultConfig();
  let debugEnabled = config.level <= LogLevel.DEBUG;
  let infoEnabled = config.level <= LogLevel.INFO;
  let warnEnabled = config.level <= LogLevel.WARN;
  let errorEnabled = config.level <= LogLevel.ERROR;
  
  /**
   * Configure the logger
   * @param customConfig Optional custom configuration to override defaults
   */
  export const configureLogger = (customConfig: Partial<LoggerConfig> = {}): void => {
    // Merge with default config
    config = {
      ...getDefaultConfig(),
      ...customConfig,
    };
    
    // Update enabled flags
    debugEnabled = config.level <= LogLevel.DEBUG;
    infoEnabled = config.level <= LogLevel.INFO;
    warnEnabled = config.level <= LogLevel.WARN;
    errorEnabled = config.level <= LogLevel.ERROR;
  };
  
  /**
   * Format a log message with a timestamp and optional prefix
   */
  const formatMessage = (message: string): string => {
    const timestamp = new Date().toISOString();
    return config.appPrefix 
      ? `[${config.appPrefix}] ${timestamp} - ${message}`
      : `${timestamp} - ${message}`;
  };
  
  // Type for log data
  type LogData = Record<string, unknown>;
  
  /**
   * Send logs to a remote endpoint for production monitoring
   * This is a basic implementation that can be extended with more features
   */
  const sendRemoteLog = async (level: string, message: string, data?: LogData): Promise<void> => {
    if (!config.enableRemote || !config.remoteEndpoint) {
      return;
    }
    
    try {
      // Simple implementation using fetch
      await fetch(config.remoteEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          level,
          message,
          timestamp: new Date().toISOString(),
          data,
        }),
        // Don't wait for response or handle errors in the client
        // to avoid affecting the user experience
        keepalive: true,
      });
    } catch {
      // Silent fail for remote logging - don't cause cascading errors
    }
  };
  
  // Type for log data
  type LogItem = unknown;
  
  /**
   * Debug level logging - only enabled in development
   */
  export const debug = (message: string, ...data: LogItem[]): void => {
    if (!debugEnabled) return;
    
    if (config.enableConsole) {
      console.debug(formatMessage(message), ...data);
    }
    
    if (config.enableRemote) {
        const logData = data.reduce<LogData>((obj, item, index) => {
          const newObj = { ...obj } as LogData;
          newObj[`item_${index}`] = item;
          return newObj;
        }, {} as LogData);
        sendRemoteLog('warn', message, data.length > 0 ? logData : undefined);
      }
  };
  
  /**
   * Info level logging
   */
  export const info = (message: string, ...data: LogItem[]): void => {
    if (!infoEnabled) return;
    
    if (config.enableConsole) {
      console.info(formatMessage(message), ...data);
    }
    
    if (config.enableRemote) {
        const logData = data.reduce<LogData>((obj, item, index) => {
          const newObj = { ...obj } as LogData;
          newObj[`item_${index}`] = item;
          return newObj;
        }, {} as LogData);
        sendRemoteLog('warn', message, data.length > 0 ? logData : undefined);
      }
  };
  
  /**
   * Warning level logging
   */
  export const warn = (message: string, ...data: LogItem[]): void => {
    if (!warnEnabled) return;
    
    if (config.enableConsole) {
      console.warn(formatMessage(message), ...data);
    }
    
    if (config.enableRemote) {
      const logData = data.reduce<LogData>((obj, item, index) => {
        const newObj = { ...obj } as LogData;
        newObj[`item_${index}`] = item;
        return newObj;
      }, {} as LogData);
      sendRemoteLog('warn', message, data.length > 0 ? logData : undefined);
    }
  };
  
  /**
   * Error level logging
   */
  export const error = (message: string, ...data: LogItem[]): void => {
    if (!errorEnabled) return;
    
    if (config.enableConsole) {
      console.error(formatMessage(message), ...data);
    }
    
    if (config.enableRemote) {
        const logData = data.reduce<LogData>((obj, item, index) => {
          const newObj = { ...obj } as LogData;
          newObj[`item_${index}`] = item;
          return newObj;
        }, {} as LogData);
        sendRemoteLog('warn', message, data.length > 0 ? logData : undefined);
      }
  };
  
  // Type for context data
  type LogContext = Record<string, unknown>;
  
  /**
   * Log an error with stack trace and additional context
   */
  export const logError = (message: string, error: unknown, context?: LogContext): void => {
    if (!errorEnabled) return;
    
    const errorObj = error instanceof Error ? error : new Error(String(error));
    
    if (config.enableConsole) {
      console.error(formatMessage(message), {
        error: errorObj,
        message: errorObj.message,
        stack: errorObj.stack,
        ...context,
      });
    }
    
    if (config.enableRemote) {
      sendRemoteLog('error', message, {
        errorMessage: errorObj.message,
        stack: errorObj.stack,
        ...context,
      });
    }
  };
  
  /**
   * Create a scoped logger with a prefix
   * Useful for component-specific logging
   */
  export const createScopedLogger = (scope: string) => {
    const scopePrefix = `[${scope}]`;
    
    return {
      debug: (message: string, ...data: LogItem[]) => 
        debug(`${scopePrefix} ${message}`, ...data),
      
      info: (message: string, ...data: LogItem[]) => 
        info(`${scopePrefix} ${message}`, ...data),
      
      warn: (message: string, ...data: LogItem[]) => 
        warn(`${scopePrefix} ${message}`, ...data),
      
      error: (message: string, ...data: LogItem[]) => 
        error(`${scopePrefix} ${message}`, ...data),
      
      logError: (message: string, error: unknown, context?: LogContext) => 
        logError(`${scopePrefix} ${message}`, error, context),
    };
  };
  
  // Default logger instance
  export default {
    debug,
    info,
    warn,
    error,
    logError,
    createScopedLogger,
    configureLogger,
  };