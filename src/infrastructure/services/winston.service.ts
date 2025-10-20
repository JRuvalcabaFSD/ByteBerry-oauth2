import winston, { Logger as WinstonLogger } from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

import { IClock, IConfig, ILogContext, ILogEntry, ILogger, LogLevel } from '@/interfaces';

/**
 * WinstonLoggerService
 *
 * A concrete ILogger implementation that wraps a Winston logger and provides
 * structured logging with environment-specific formatting and transport setup.
 *
 * This service:
 * - Injects and configures a Winston logger instance on construction.
 * - Merges a per-instance default context (including a service name) with
 *   each log call's context.
 * - Emits timestamped log entries containing: timestamp, level, service, message,
 *   optional requestId and an optional context object containing all context
 *   keys except `service`.
 * - Uses a compact, colorized human-friendly format in non-production and a
 *   JSON + timestamp + stack trace format in production.
 * - Configures daily-rotated file transports for combined logs and, in
 *   production, a separate error-only rotated file.
 *
 * Important behavior notes:
 * - The defaultContext passed to the constructor is merged with the configured
 *   service name: { service: config.serviceName, ...defaultContext }.
 * - When logging, the effective context is { ...defaultContext, ...context }.
 *   The `service` key is extracted to the top-level `service` log field and is
 *   omitted from the nested `context` field (if any).
 * - If a requestId exists on the merged context it is assigned to the top-level
 *   requestId field in the log entry. In development, requestId is abbreviated
 *   to its first 8 characters in the pretty-printed output.
 * - Stack traces are preserved for Error objects via Winston's errors formatter.
 * - The underlying Winston logger is created with:
 *     - level: config.logLevel
 *     - exitOnError: false
 *     - handleExceptions: false
 *     - handleRejections: false
 *
 * Constructor
 * @param config - Runtime configuration providing serviceName, logLevel and environment helpers (e.g. isProduction).
 * @param clock - Clock abstraction used to produce ISO timestamps for log entries (clock.isoString()).
 * @param defaultContext - Optional per-instance default context merged into every log entry (defaults to {}).
 *
 * Methods
 * @param message - The message to log.
 * @param context - Optional additional contextual properties to include with the log entry.
 *
 * info(message: string, context?: Record<string, unknown>): void
 * @remarks Shorthand for log('info', ...). Emits an info-level entry.
 *
 * debug(message: string, context?: Record<string, unknown>): void
 * @remarks Shorthand for log('debug', ...). Emits a debug-level entry.
 *
 * warn(message: string, context?: Record<string, unknown>): void
 * @remarks Shorthand for log('warn', ...). Emits a warn-level entry.
 *
 * error(message: string, context?: Record<string, unknown>): void
 * @remarks Shorthand for log('error', ...). Emits an error-level entry and
 * preserves error stacks when an Error is provided as part of the context or message.
 *
 * child(context: ILogContext): ILogger
 * @returns A new WinstonLoggerService instance with the same config and clock,
 * but with its defaultContext extended by the provided context. Useful for
 * creating scoped loggers (for example, per-module or per-request).
 *
 * log(level: LogLevel, message: string, context?: Record<string, unknown>): void
 * @remarks Core logging method. Produces a Partial<ILogEntry> containing:
 * - timestamp: clock.isoString()
 * - level: provided level
 * - service: mergeContext.service || config.serviceName
 * - message: provided message
 * - requestId: included if present on the merged context
 * - context: an object of merged context keys excluding `service` (omitted if empty)
 *
 * Private helpers (high level)
 * - createWinstonLogger(): Initializes and returns the configured Winston logger
 *   using the selected format and transports.
 * - createProductionFormat(): Returns a production-ready JSON format combined
 *   with timestamps and error stack inclusion.
 * - createDevelopmentFormat(): Returns a human-friendly colorized printf format
 *   that includes timestamps, abbreviated requestId (first 8 chars), and pretty-printed
 *   context/meta fields.
 * - createTransports(): Builds and returns an array of Winston transports,
 *   including DailyRotateFile transports for combined logs and, when in production,
 *   a separate error-only rotated file. Files are rotated daily and controlled
 *   via maxSize/maxFiles settings.
 *
 * Example
 * @example
 * const logger = new WinstonLoggerService(config, clock);
 * logger.info('Service started', { requestId: 'abcd1234', feature: 'auth' });
 * const reqLogger = logger.child({ requestId: 'req-1' });
 * reqLogger.debug('handling request');
 */

export class WinstonLoggerService implements ILogger {
  private readonly winston: WinstonLogger;
  private readonly defaultContext: ILogContext;

  /**
   * Constructs the Winston logging service.
   *
   * Initializes the internal default logging context (merging the provided
   * defaultContext with a `service` field derived from the configuration),
   * registers Winston's npm color scheme, and creates the underlying Winston logger instance.
   *
   * Note: properties in the provided defaultContext will override the `service`
   * field produced from the configuration when keys collide.
   *
   * @param config - Application configuration used to obtain the service name and other logging settings.
   * @param clock - Clock abstraction used by the logger for timestamping log entries.
   * @param defaultContext - Optional additional default context to attach to every log entry. Defaults to an empty object.
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
   * Logs an informational message with optional contextual metadata.
   *
   * @param message - The message to record.
   * @param context - Optional key/value pairs providing additional metadata to attach to the log entry.
   * @returns void
   *
   * @remarks
   * Delegates to the internal log method with level 'info'. Context values should be JSON-serializable if they are to be emitted by the logger or transmitted to external systems.
   *
   * @example
   * this.info('User created', { userId: 123, plan: 'pro' });
   */

  public info(message: string, context?: Record<string, unknown>): void {
    this.log('info', message, context);
  }

  /**
   * Logs a message at the "debug" level.
   *
   * Use this method to record verbose diagnostic information useful during development
   * and troubleshooting. The optional `context` object can include additional structured
   * data (for example objects or metadata) to be attached to the log entry.
   *
   * @param message - The message to log.
   * @param context - Optional contextual information to include with the log.
   * @returns void
   */

  public debug(message: string, context?: Record<string, unknown>): void {
    this.log('debug', message, context);
  }

  /**
   * Logs an error-level message with optional contextual data.
   *
   * @param message - The error message to record.
   * @param context - Optional key/value pairs providing additional context for the log entry.
   *
   * @remarks
   * This method delegates to the internal logging mechanism at the 'error' level.
   * Use this for errors that should be tracked or investigated.
   *
   * @returns Nothing.
   */

  public error(message: string, context?: Record<string, unknown>): void {
    this.log('error', message, context);
  }

  /**
   * Log a warning-level message.
   *
   * This method records a message with severity "warn" and optional structured
   * context metadata. It delegates to the internal logger implementation using
   * the "warn" level.
   *
   * @param message - The message to log.
   * @param context - Optional key/value metadata to include with the log entry.
   *                  Keys should be strings and values can be any serializable
   *                  data (e.g., numbers, strings, booleans, objects).
   *
   * @returns void
   *
   * @example
   * // Log a warning with additional context
   * logger.warn('Cache miss for user profile', { userId: 123, cacheKey: 'profile:123' });
   */

  public warn(message: string, context?: Record<string, unknown>): void {
    this.log('warn', message, context);
  }

  /**
   * Create a child logger that inherits this service's configuration and clock,
   * while extending (and overriding) the parent's default logging context with the provided context.
   *
   * The merge is shallow: properties in the provided context override properties
   * with the same keys from the parent's default context.
   *
   * @param context - Contextual properties to attach to the child logger (merged with the parent's default context).
   * @returns A new ILogger instance that shares configuration and clock with the parent but uses the merged context.
   */

  public child(context: ILogContext): ILogger {
    return new WinstonLoggerService(this.config, this.clock, { ...this.defaultContext, ...context });
  }

  /**
   * Logs a message to the configured Winston logger.
   *
   * The method shallow-merges this.defaultContext with the optional context argument (the provided context overrides defaults).
   * It builds a partial ILogEntry with:
   * - timestamp: produced by this.clock.isoString()
   * - level: the provided LogLevel
   * - service: taken from the merged context's "service" property or, if absent, from this.config.serviceName
   * - message: the provided message
   *
   * Special handling for merged context:
   * - If a requestId property exists, it is promoted to logEntry.requestId.
   * - The "service" key is removed from the context payload; any remaining keys are attached as logEntry.context.
   * - If there are no remaining context keys after removing "service", the logEntry.context property is omitted.
   *
   * The completed log entry is then forwarded to the Winston logger via this.winston.log(level, logEntry).
   *
   * @param level - The severity level for the log entry.
   * @param message - The human-readable log message.
   * @param context - Optional additional key/value context to include with the log. The "service" key overrides the configured service
   *                  name but is not included in the context payload; a "requestId" key (if present) is elevated to the top level.
   * @returns void
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
      .filter(([key]) => key !== 'service')
      .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});

    if (Object.keys(contextWithoutService).length > 0) {
      logEntry.context = contextWithoutService;
    }

    this.winston.log(level, logEntry as ILogEntry);
  }

  /**
   * Creates and returns a configured Winston logger instance.
   *
   * The logger's format is chosen based on the current environment (production vs development),
   * transports are obtained from createTransports(), and the log level is taken from the service config.
   * The logger is created with error/exception/rejection handling disabled so callers may opt-in to
   * their own handling strategies.
   *
   * @private
   * @returns {WinstonLogger} A fully configured Winston logger ready for use.
   * @throws May rethrow errors raised by winston.createLogger or by the transport/format creation routines
   *         if configuration is invalid or underlying transport initialization fails.
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
   * Create a production-ready Winston format that produces structured JSON logs.
   *
   * Combines the following formatters:
   * - `timestamp` with the pattern `YYYY-MM-DDTHH:mm:ss.SSSZ` for consistent, sortable timestamps,
   * - `errors` with `stack: true` to preserve error stack traces,
   * - `json` to emit a single JSON object per log entry for downstream parsing.
   *
   * The emitted log object will normally include keys such as `timestamp`, `level`, `message`,
   * and `stack` (when an Error is logged).
   *
   * @private
   * @returns {winston.Logform.Format} A combined Winston format configured for production logging.
   */

  private createProductionFormat(): winston.Logform.Format {
    const { combine, timestamp, errors, json } = winston.format;
    return combine(timestamp({ format: 'YYYY-MM-DDTHH:mm:ss.SSSZ' }), errors({ stack: true }), json());
  }

  /**
   * Creates a Winston log format tailored for development environments.
   *
   * The returned format combines:
   * - timestamp formatted as "HH:mm:ss.SSS"
   * - inclusion of error stack traces (errors({ stack: true }))
   * - colorized log levels using `winston.config.npm.colors`
   * - a custom `printf` formatter that renders a compact, human-readable log line
   *
   * Formatter behavior:
   * - Expects the log `info` object to contain (optionally) `service`, `requestId`, `context`, and additional metadata.
   * - `requestId` (when a string) is truncated to the first 8 characters and wrapped in brackets (`[abcd1234]`) to keep output concise.
   * - `context` and any remaining metadata are pretty-printed via `JSON.stringify(..., null, 2)` and appended below the main log line when present.
   * - The main line is formatted as:
   *   `{timestamp} [{service}] {level} {reqId}: {message}`
   *   followed by a newline and the pretty-printed `context` or metadata if available.
   *
   * Example output:
   * 12:34:56.789 [auth-service] info [abcd1234]: User authenticated
   * {
   *   "userId": "123",
   *   "roles": ["admin"]
   * }
   *
   * @private
   * @returns {winston.Logform.Format} A combined Winston format suitable for development (timestamp, stack traces, colors, and structured printf output).
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
   * Creates and configures Winston transports for logging.
   *
   * - In production, adds a daily rotating file transport for error-level logs:
   *   - Filename: 'logs/error-%DATE%.log'
   *   - Date pattern: 'YYYY-MM-DD'
   *   - Level: 'error'
   *   - maxSize: '20m', maxFiles: '14d'
   *   - handleExceptions: false
   *   - Format: combine(timestamp(), errors({ stack: true }), json())
   *
   * - Always adds a daily rotating file transport for combined logs:
   *   - Filename: 'logs/combined-%DATE%.log'
   *   - Date pattern: 'YYYY-MM-DD'
   *   - maxSize: '20m', maxFiles: '14d'
   *   - handleExceptions: false
   *   - Format: combine(timestamp(), errors({ stack: true }), json())
   *
   * Returns the array of configured Winston transports ready to be attached to a logger.
   *
   * @private
   * @returns {winston.transport[]} Configured Winston transport instances.
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
