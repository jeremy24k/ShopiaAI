/**
 * Professional Logging System for Backend
 * Configurable logging levels based on environment
 */

const LOG_LEVELS = {
  DEBUG: 'DEBUG',
  INFO: 'INFO',
  WARN: 'WARN',
  ERROR: 'ERROR'
};

const isDevelopment = process.env.NODE_ENV !== 'production';

class Logger {
  constructor(context = 'Server') {
    this.context = context;
  }

  _log(level, message, ...args) {
    // In production, only log WARN and ERROR
    if (!isDevelopment && (level === LOG_LEVELS.DEBUG || level === LOG_LEVELS.INFO)) {
      return;
    }

    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${level}] [${this.context}]`;

    const logMessage = typeof message === 'object' ? JSON.stringify(message) : message;

    switch (level) {
      case LOG_LEVELS.DEBUG:
        console.log(prefix, logMessage, ...args);
        break;
      case LOG_LEVELS.INFO:
        console.log(prefix, logMessage, ...args);
        break;
      case LOG_LEVELS.WARN:
        console.warn(prefix, logMessage, ...args);
        break;
      case LOG_LEVELS.ERROR:
        console.error(prefix, logMessage, ...args);
        break;
      default:
        console.log(prefix, logMessage, ...args);
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

  // Create a logger with a specific context
  static create(context) {
    return new Logger(context);
  }
}

// Default logger instance
export const logger = new Logger();

// Export Logger class for custom contexts
export default Logger;
