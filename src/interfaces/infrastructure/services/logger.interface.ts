import { LogLevel } from '@/interfaces';

/**
 * Structured context attached to a log entry.
 *
 * This interface captures optional, searchable metadata to provide context for logs
 * across services and requests. Fields are intentionally optional so callers can
 * supply only the data that is relevant for a given log entry.
 *
 * @interface ILogContext
 *
 * @property requestId - Correlation or request identifier used to tie related log entries to a single request or transaction.
 * @property userId - Identifier of the user or principal that initiated the action producing the log entry.
 * @property service - Logical name of the service, application, or component that emitted the log.
 * @property method - HTTP method or application-specific operation name (for example "GET", "POST", "processOrder").
 * @property url - Full or relative URL associated with the request or resource involved in the log.
 * @property statusCode - HTTP status code or application-specific status represented as a string.
 * @property duration - Human- or machine-readable duration for the operation (e.g. "120ms", "1.2s").
 * @property error - Short error message or serialized error details; prefer structured error objects when available.
 *
 * @remarks
 * Additional arbitrary properties may be included to convey more context. Those properties
 * are typed as unknown to encourage explicit validation or casting before use.
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
 * Structured log entry representing a single event emitted by a service.
 *
 * Provides consistent fields for timestamping, severity, origin, message content,
 * optional contextual data, and a request-scoped correlation identifier.
 *
 * @remarks
 * - timestamp: ISO 8601 timestamp indicating when the event occurred.
 * - level: Severity level (for example: "debug", "info", "warn", "error").
 * - service: Logical name of the service or component that produced the log.
 * - message: Human-readable description of the event.
 * - context: Optional structured object with additional metadata (caller info, stack, tags, etc.).
 * - requestId: Correlation identifier used to trace the request across components.
 *
 * @public
 * @interface ILogEntry
 * @property {string} timestamp - ISO 8601 timestamp of the log event.
 * @property {string} level - Severity level of the log entry.
 * @property {string} service - Name of the originating service or component.
 * @property {string} message - Descriptive message for the log entry.
 * @property {ILogContext} [context] - Optional additional structured context.
 * @property {string} requestId - Correlation ID used for tracing requests.
 */

export interface ILogEntry {
  timestamp: string;
  level: string;
  service: string;
  message: string;
  context?: ILogContext;
  requestId: string;
}

/**
 * ILogger is an abstraction for structured logging used throughout the application.
 *
 * Provides convenience methods for common log levels (info, debug, warn, error)
 * as well as a generic log method that accepts an explicit {@link LogLevel}.
 * Implementations are expected to record or emit logs and may enrich messages
 * with optional context data.
 *
 * The {@link child} method produces a derived logger that automatically includes
 * the provided {@link ILogContext} on every subsequent log call, which is useful
 * for attaching request- or operation-scoped metadata (for example, requestId,
 * userId, or session information).
 *
 * @remarks
 * - Shorthand methods (info/debug/warn/error) should behave like calling
 *   `log(level, message, context)` with the corresponding level.
 * - Context objects are records of arbitrary key/value pairs and should be
 *   merged or augmented by implementations when creating child loggers.
 *
 * @example
 * const baseLogger: ILogger = ...;
 * const reqLogger = baseLogger.child({ requestId: 'abc123' });
 * reqLogger.info('Handler started', { route: '/users' });
 *
 * @see {@link ILogContext}
 * @see {@link LogLevel}
 */

export interface ILogger {
  /**
   * Logs an informational message with optional context.
   *
   * @param {string} message - The message to log.
   * @param {Record<string, unknown>} [context] - Optional additional context for the log entry.
   * @memberof ILogger
   */

  info(message: string, context?: Record<string, unknown>): void;

  /**
   * Logs a debug message with optional context.
   *
   * @param {string} message - The message to log.
   * @param {Record<string, unknown>} [context] - Optional additional context for the log entry.
   * @memberof ILogger
   */

  debug(message: string, context?: Record<string, unknown>): void;

  /**
   * Logs an error message with optional context.
   *
   * @param {string} message - The message to log.
   * @param {Record<string, unknown>} [context] - Optional additional context for the log entry.
   * @memberof ILogger
   */

  error(message: string, context?: Record<string, unknown>): void;

  /**
   * Logs a warning message with optional context.
   *
   * @param {string} message - The message to log.
   * @param {Record<string, unknown>} [context] - Optional additional context for the log entry.
   * @memberof ILogger
   */

  warn(message: string, context?: Record<string, unknown>): void;

  /**
   * Creates a child logger that includes the specified context with every log entry.
   *
   * @param {ILogContext} context - The context to include with each log entry.
   * @return {*}  {ILogger} - A new ILogger instance that includes the provided context.
   * @memberof ILogger
   */

  child(context: ILogContext): ILogger;

  /**
   * Logs a message at the specified log level with optional context.
   *
   * @param {LogLevel} level - The severity level of the log entry.
   * @param {string} message - The message to log.
   * @param {Record<string, unknown>} [context] - Optional additional context for the log entry.
   * @memberof ILogger
   */

  log(level: LogLevel, message: string, context?: Record<string, unknown>): void;
}
