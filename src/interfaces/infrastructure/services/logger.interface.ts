import { LogLevel } from '@/interfaces/config/config.interface';

/**
 * Interface defining the structure for logging context information.
 *
 * This interface provides a standardized way to capture and pass contextual
 * information for logging purposes across the application. It includes common
 * fields for request tracking, user identification, service information,
 * and error handling.
 *
 * @interface ILogContext
 *
 * @property {string} [requestId] - Optional unique identifier for the request
 * @property {string} [userId] - Optional identifier for the user making the request
 * @property {string} [service] - Optional name of the service handling the request
 * @property {string} [method] - Optional HTTP method or operation name
 * @property {string} [url] - Optional URL or endpoint being accessed
 * @property {string} [statusCode] - Optional HTTP status code or operation result code
 * @property {string} [duration] - Optional execution time or duration of the operation
 * @property {string} [error] - Optional error message or description
 * @property {unknown} [key: string] - Additional custom properties for extensibility
 *
 * @example
 * ```typescript
 * const logContext: ILogContext = {
 *   requestId: 'req-123',
 *   userId: 'user-456',
 *   service: 'auth-service',
 *   method: 'POST',
 *   url: '/api/login',
 *   statusCode: '200',
 *   duration: '150ms'
 * };
 * ```
 */

export interface ILogContext {
  requestId?: string;
  userId?: string;
  service?: string;
  method?: string;
  url?: string;
  statusCode?: string;
  duration?: string;
  error?: string;
  [key: string]: unknown;
}

/**
 * Describes a structured log record produced by application services.
 *
 * Captures when the event occurred, its severity, the emitting service,
 * a human-readable description, and optional correlation/context data for tracing.
 *
 * Fields:
 * - `timestamp`: ISO 8601 timestamp (prefer UTC) indicating when the event occurred.
 * - `level`: Severity of the event (e.g., "debug", "info", "warn", "error", "fatal").
 * - `service`: Name or identifier of the emitting service or component.
 * - `message`: Human-readable description of the event.
 * - `context` (optional): Additional structured details or serialized context.
 * - `requestId` (optional): Correlation/trace identifier to link related logs.
 *
 * @public
 * @remarks
 * Use a consistent, machine-parseable timestamp format (e.g., new Date().toISOString()).
 * Standardize the allowed values for `level` to support filtering, metrics, and alerting.
 *
 * @example
 * ```ts
 * const entry: ILogEntry = {
 *   timestamp: new Date().toISOString(),
 *   level: "info",
 *   service: "oauth2",
 *   message: "Token issued successfully",
 *   requestId: "req-7c2b1",
 *   context: JSON.stringify({ clientId: "abc123", grantType: "client_credentials" })
 * };
 * ```
 */

export interface ILogEntry {
  timestamp: string;
  level: string;
  service: string;
  message: string;
  context?: ILogContext;
  requestId?: string;
}

/**
 * Interface for a logger service that provides different logging levels and contextual logging capabilities.
 *
 * @interface ILogger
 * @description Defines the contract for logging operations with support for structured logging,
 * child loggers with context, and multiple log levels (info, debug, error, warn).
 *
 * @example
 * ```typescript
 * const logger: ILogger = new Logger();
 * logger.info('User logged in', { userId: '123', timestamp: Date.now() });
 *
 * const childLogger = logger.child({ service: 'auth' });
 * childLogger.error('Authentication failed', { reason: 'invalid_token' });
 * ```
 */
export interface ILogger {
  /**
   * Logs an informational message with optional context.
   *
   * @param {string} message - The message to log.
   * @param {Record<string, unknown>} [context] - Optional additional context to include with the log.
   * @memberof ILogger
   */

  info(message: string, context?: Record<string, unknown>): void;

  /**
   * Logs a debug-level message with optional context.
   *
   * @param {string} message - The debug message to log.
   * @param {Record<string, unknown>} [context] - Optional additional context to include with the log.
   * @memberof ILogger
   */

  debug(message: string, context?: Record<string, unknown>): void;

  /**
   * Logs an error message with optional context.
   *
   * @param {string} message - The error message to log.
   * @param {Record<string, unknown>} [context] - Optional additional context to include with the log.
   * @memberof ILogger
   */

  error(message: string, context?: Record<string, unknown>): void;

  /**
   * Logs a warning message with optional context.
   *
   * @param {string} message - The warning message to log.
   * @param {Record<string, unknown>} [context] - Optional additional context to include with the log.
   * @memberof ILogger
   */

  warn(message: string, context?: Record<string, unknown>): void;

  /**
   * Creates a child logger that inherits from the current logger, adding the provided context to all log entries.
   *
   * @param {ILogContext} context - The context to associate with the child logger.
   * @return {*}  {ILogger} - A new logger instance with the specified context.
   * @memberof ILogger
   */

  child(context: ILogContext): ILogger;

  /**
   * Logs a message at the specified log level with optional context.
   *
   * @param {LogLevel} logLevel - The severity level of the log (e.g., info, debug, error, warn).
   * @param {string} message - The message to log.
   * @param {Record<string, unknown>} [context] - Optional additional context to include with the log.
   * @memberof ILogger
   */

  log(level: LogLevel, message: string, context?: Record<string, unknown>): void;
}
