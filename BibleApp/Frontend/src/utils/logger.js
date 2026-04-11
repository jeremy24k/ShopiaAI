/**
 * Professional Logging System
 * Only logs in development mode to avoid console pollution in production
 */

const isDevelopment = import.meta.env.MODE === 'development';

const LOG_LEVELS = {
  DEBUG: 'DEBUG',
  INFO: 'INFO',
  WARN: 'WARN',
  ERROR: 'ERROR'
};

const LOG_COLORS = {
  DEBUG: '#6B7280',
  INFO: '#3B82F6',
  WARN: '#F59E0B',
  ERROR: '#EF4444'
};

class Logger {
  constructor(context = 'App') {
    this.context = context;
  }

  _log(level, message, ...args) {
    if (!isDevelopment && level !== LOG_LEVELS.ERROR) {
      return; // Only log errors in production
    }

    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${level}] [${this.context}]`;

    switch (level) {
      case LOG_LEVELS.DEBUG:
        console.log(`%c${prefix}`, `color: ${LOG_COLORS.DEBUG}`, message, ...args);
        break;
      case LOG_LEVELS.INFO:
        console.log(`%c${prefix}`, `color: ${LOG_COLORS.INFO}`, message, ...args);
        break;
      case LOG_LEVELS.WARN:
        console.warn(`%c${prefix}`, `color: ${LOG_COLORS.WARN}`, message, ...args);
        break;
      case LOG_LEVELS.ERROR:
        console.error(`%c${prefix}`, `color: ${LOG_COLORS.ERROR}`, message, ...args);
        break;
      default:
        console.log(prefix, message, ...args);
    }
  }

  debug(message, ...args) {
    this._log(LOG_LEVELS.DEBUG, message, ...args);
  }

  info(message, ...args) {
    this._log(LOG_LEVELS.INFO, message, ...args);
  }

  warn(message, ...args) {
    this._log(LOG_LEVELS.WARN, message, ...args);
  }

  error(message, ...args) {
    this._log(LOG_LEVELS.ERROR, message, ...args);
  }

  // Utility method to create a logger with a specific context
  static create(context) {
    return new Logger(context);
  }
}

// Default logger instance
export const logger = new Logger();

// Export Logger class for custom contexts
export default Logger;
