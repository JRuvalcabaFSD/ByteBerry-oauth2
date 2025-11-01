import winston, { LogEntry, Logger as WinstonLogger } from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

import { IClock, IConfig, ILogContext, ILogEntry, ILogger, LogLevel } from '@/interfaces';

/**
 * Winston-based logger service implementation that provides structured logging capabilities.
 *
 * This service implements the ILogger interface and wraps Winston logger functionality
 * with support for:
 * - Multiple log levels (info, debug, error, warn)
 * - Contextual logging with default and custom contexts
 * - Child logger creation for hierarchical logging
 * - Environment-specific formatting (development vs production)
 * - File rotation for log persistence
 * - Colored console output in development mode
 *
 * @remarks
 * In production mode, logs are formatted as JSON and include file rotation.
 * In development mode, logs are colorized and formatted for readability.
 *
 * @example
 * ```typescript
 * const logger = new WinstonLoggerService(config, clock, { component: 'AuthService' });
 * logger.info('User authenticated', { userId: '123', method: 'OAuth2' });
 *
 * const childLogger = logger.child({ requestId: 'abc-123' });
 * childLogger.debug('Processing request');
 * ```
 */

export class WinstonLoggerService implements ILogger {
  private readonly winston: WinstonLogger;
  private readonly defaultContext: ILogContext;

  /**
   * Creates a new instance of the Winston logger service.
   *
   * @param config - The configuration object containing service-level settings
   * @param clock - The clock service used for timestamping log entries
   * @param defaultContext - Optional default context to be included in all log entries. Defaults to an empty object
   *
   * @remarks
   * This constructor initializes the Winston logger with:
   * - Default context that includes the service name from config
   * - NPM color scheme for log levels
   * - A configured Winston logger instance
   */

  constructor(
    private readonly config: IConfig,
    private readonly clock: IClock,
    defaultContext: ILogContext = {}
  ) {
    this.defaultContext = { service: this.config.serviceName, ...defaultContext };
    winston.addColors(winston.config.npm.colors);
    this.winston = this.createWinstonLogger();
  }

  /**
   * Logs an informational message with optional context data.
   *
   * @param message - The informational message to log
   * @param context - Optional additional context data to include with the log entry
   * @returns void
   */

  public info(message: string, context?: Record<string, unknown>): void {
    this.log('info', message, context);
  }

  /**
   * Logs a debug-level message with optional context information.
   *
   * @param message - The debug message to log
   * @param context - Optional contextual data to include with the log entry
   * @returns void
   */

  public debug(message: string, context?: Record<string, unknown>): void {
    this.log('debug', message, context);
  }

  /**
   * Logs an error message with optional context information.
   *
   * @param message - The error message to be logged
   * @param context - Optional additional context information as key-value pairs
   * @returns void
   */

  public error(message: string, context?: Record<string, unknown>): void {
    this.log('error', message, context);
  }

  /**
   * Logs a warning message with optional context information.
   *
   * @param message - The warning message to be logged
   * @param context - Optional additional context data to include with the warning
   * @returns void
   */

  public warn(message: string, context?: Record<string, unknown>): void {
    this.log('warn', message, context);
  }

  /**
   * Creates a child logger instance with additional context.
   *
   * @param context - Additional logging context to merge with the default context
   * @returns A new logger instance with the combined context
   *
   * @remarks
   * The child logger inherits the parent's configuration and clock, while merging
   * the provided context with the parent's default context. Context properties from
   * the parameter will override any matching properties in the default context.
   */

  public child(context: ILogContext): ILogger {
    return new WinstonLoggerService(this.config, this.clock, { ...this.defaultContext, ...context });
  }

  /**
   * Logs a message with the specified level and optional context.
   *
   * This method creates a structured log entry by merging the default context with any
   * provided context, and formats it according to the ILogEntry interface before passing
   * it to the Winston logger.
   *
   * @param level - The severity level of the log entry (e.g., 'info', 'error', 'warn')
   * @param message - The main message to be logged
   * @param context - Optional additional context data to include in the log entry.
   *                  Special keys 'service' and 'requestId' are handled separately.
   *                  - 'service': Overrides the default service name
   *                  - 'requestId': Added as a top-level field if present
   *                  - Other keys: Grouped under a 'context' field in the log entry
   *
   * @remarks
   * The method performs the following operations:
   * - Merges default context with provided context
   * - Generates a timestamp using the configured clock
   * - Extracts service name from context or uses default from config
   * - Handles requestId as a separate field if present
   * - Groups remaining context properties under a 'context' field
   * - Only includes the context field if it contains properties
   */

  public log(level: LogLevel, message: string, context?: Record<string, unknown>): void {
    const mergeContext = { ...this.defaultContext, ...context };

    const logEntry: Partial<ILogEntry> = {
      timestamp: this.clock.isoString(),
      level,
      service: mergeContext.service || this.config.serviceName,
      message,
    };

    if (mergeContext.requestId !== undefined) {
      logEntry.requestId = mergeContext.requestId;
    }

    const contextWithoutService = Object.entries(mergeContext)
      .filter(([key]) => key !== 'service' && key !== 'requestId')
      .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});

    if (Object.keys(contextWithoutService).length > 0) {
      logEntry.context = contextWithoutService;
    }

    this.winston.log(level, logEntry as LogEntry);
  }

  /**
   * Creates and configures a Winston logger instance with appropriate format and transports.
   *
   * The logger configuration varies based on the environment:
   * - Production: Uses production-specific formatting
   * - Development: Uses development-specific formatting
   *
   * @private
   * @returns {WinstonLogger} A configured Winston logger instance with the following settings:
   * - Log level from configuration
   * - Environment-specific formatting
   * - Configured transports for output
   * - Exception and rejection handling disabled
   * - Exit on error disabled
   */

  private createWinstonLogger(): WinstonLogger {
    const format = this.config.isProduction() ? this.createProductionFormat() : this.createDevelopmentFormat();
    const transports = this.createTransports();

    return winston.createLogger({
      level: this.config.logLevel,
      format,
      transports,
      exitOnError: false,
      handleExceptions: false,
      handleRejections: false,
    });
  }

  /**
   * Creates the log format configuration for production environments.
   *
   * This method combines multiple Winston format transformers to produce structured JSON logs
   * with timestamps and error stack traces, optimized for production logging systems.
   *
   * @returns A combined Winston log format that includes:
   *  - ISO 8601 timestamps with timezone information
   *  - Error stack traces when logging Error objects
   *  - JSON-formatted output for structured logging
   *
   * @private
   */

  private createProductionFormat(): winston.Logform.Format {
    const { combine, timestamp, errors, json } = winston.format;
    return combine(timestamp({ format: 'YYYY-MM-DDTHH:mm:ss.SSSZ' }), errors({ stack: true }), json());
  }

  /**
   * Creates a Winston log format optimized for development environments.
   *
   * This format includes:
   * - Timestamp in HH:mm:ss.SSS format
   * - Error stack traces
   * - Colorized log levels
   * - Custom formatted output with service name, request ID, and additional metadata
   *
   * The output format is:
   * `timestamp [service] level [requestId]: message`
   *
   * Additional context and metadata are pretty-printed on subsequent lines when present.
   *
   * @returns A Winston log format configured for development use with enhanced readability
   * @private
   */

  private createDevelopmentFormat(): winston.Logform.Format {
    const { combine, timestamp, errors, colorize, printf } = winston.format;

    return combine(
      timestamp({ format: 'HH:mm:ss.SSS' }),
      errors({ stack: true }),
      colorize({ level: true, colors: winston.config.npm.colors }),
      printf(info => {
        const { timestamp, level, message, service, requestId, context, ...meta } = info;

        const reqId = typeof requestId === 'string' ? `[${requestId.slice(0, 8)}]` : '';

        const contextStr = context ? JSON.stringify(context, null, 2) : '';
        const metaStr = Object.keys(meta).length ? JSON.stringify(meta, null, 2) : '';
        const additionalInfo = contextStr || metaStr;

        return `${timestamp} [${service}] ${level} ${reqId}: ${message} ${additionalInfo ? '\n' + additionalInfo : ''}`;
      })
    );
  }

  /**
   * Creates and configures an array of Winston transport instances for logging.
   *
   * This method sets up different transport mechanisms based on the environment:
   * - Console transport: Always added for all environments
   * - Error log file (production only): Daily rotating file for error-level logs
   * - Combined log file: Daily rotating file for all log levels
   *
   * All file transports use daily rotation with the following characteristics:
   * - Date pattern: YYYY-MM-DD
   * - Maximum file size: 20MB
   * - Retention period: 14 days
   * - Format: JSON with timestamps and error stack traces
   *
   * @private
   * @returns {winston.transport[]} An array of configured Winston transport instances
   */

  private createTransports(): winston.transport[] {
    const transports: winston.transport[] = [];
    const { combine, timestamp, errors, json } = winston.format;

    transports.push(new winston.transports.Console({ handleExceptions: false, handleRejections: false }));

    if (this.config.isProduction()) {
      transports.push(
        new DailyRotateFile({
          filename: 'logs/error-%DATE%.log',
          datePattern: 'YYYY-MM-DD',
          level: 'error',
          handleExceptions: false,
          maxSize: '20m',
          maxFiles: '14d',
          format: combine(timestamp(), errors({ stack: true }), json()),
        })
      );
    }

    transports.push(
      new DailyRotateFile({
        filename: 'logs/combined-%DATE%.log',
        datePattern: 'YYYY-MM-DD',
        handleExceptions: false,
        maxFiles: '14d',
        maxSize: '20m',
        format: combine(timestamp(), errors({ stack: true }), json()),
      })
    );

    return transports;
  }
}
