import winston, { Logger as WinstonLogger } from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

import { IClock, IConfig, ILogContext, ILogEntry, ILogger, LogLevel } from '@/interfaces';

/**
 * Provides a thin, opinionated wrapper around Winston for structured, contextual,
 * environment-aware logging across the service.
 *
 * Summary
 * - Structured entries with ISO timestamps from an injected clock for testability and consistency.
 * - Merges a default context (e.g., service, requestId) with per-call context on each log.
 * - Environment-aware formats:
 *   - Development: colorized, human-friendly console output with compact requestId.
 *   - Production: JSON output suitable for log ingestion, plus daily-rotating files.
 * - Supports child loggers that inherit and extend context for request/job scoping.
 * - Delegates to Winston with a configured log level from application config.
 *
 * Dependencies
 * - {@link IConfig}: Supplies service identity (serviceName), logLevel, and environment checks (isProduction()).
 * - {@link IClock}: Supplies deterministic ISO timestamps via isoString() for reproducible logs in tests.
 *
 * Log Levels
 * - Supports the common levels: debug, info, warn, error (all routed through a single log() implementation).
 *
 * Context Semantics
 * - The effective context is the shallow merge of defaultContext and per-call context: { ...defaultContext, ...context }.
 * - The service field defaults to config.serviceName but can be overridden in context.
 * - If context.requestId is present, it is promoted onto the top-level log entry as requestId and remains in context.
 * - The full merged context is attached to each entry under the context property for structured analysis.
 *
 * Output and Transports
 * - Console transport is always enabled.
 * - In production:
 *   - JSON-formatted entries with timestamps and error stacks are emitted.
 *   - Daily-rotated files:
 *     - logs/error-%DATE%.log (level: error)
 *     - logs/combined-%DATE%.log (all levels)
 *     - Rotation policy: maxSize=20m, maxFiles=14d.
 * - In development:
 *   - Colorized, readable lines including timestamp, service, level, optional short requestId, and pretty-printed context.
 *
 * Error Handling
 * - Transport-level exception and rejection handling is disabled to allow central process-level handlers to manage them.
 *
 * Usage Examples
 * @example Basic usage
 * const logger = new WinstonLoggerService(config, clock);
 * logger.info("Server started", { port: 3000 });
 *
 * @example Request-scoped child logger
 * const requestLogger = logger.child({ requestId: req.id, userId: user.id });
 * requestLogger.debug("Fetching user profile");
 *
 * @example Override the service name for a downstream call
 * logger.warn("Downstream timeout", { service: "payments", timeoutMs: 5000 });
 *
 * @remarks
 * - Prefer creating a child logger per request/job to avoid repeatedly passing requestId and other contextual fields.
 * - Avoid large or circular objects in context; logs are serialized and may impact performance or fail to stringify.
 *
 * @see {@link ILogger} for the interface contract implemented by this service.
 * @see {@link winston.Logger} for the underlying logger behavior.
 */

export class WinstonLoggerService implements ILogger {
  private readonly winston: WinstonLogger;
  private readonly defaultContext: ILogContext;

  /**
   * Creates an instance of WinstonLoggerService.
   * @param {IConfig} config
   * @param {IClock} clock
   * @param {ILogContext} [defaultContext={}]
   * @memberof WinstonLoggerService
   */

  constructor(
    private readonly config: IConfig,
    private readonly clock: IClock,
    defaultContext: ILogContext = {}
  ) {
    this.defaultContext = {
      service: this.config.serviceName,
      ...defaultContext,
    };
    winston.addColors(winston.config.npm.colors);
    this.winston = this.createWinstonLogger();
  }

  /**
   * Logs a message at the 'info' level with optional context.
   *
   * @param {string} message - The log message.
   * @param {Record<string, unknown>} [context] - Optional additional context to include in the log entry.
   * @memberof WinstonLoggerService
   */

  public info(message: string, context?: Record<string, unknown>): void {
    this.log('info', message, context);
  }

  /**
   * Logs a message at the 'debug' level with optional context.
   *
   * @param {string} message - The log message.
   * @param {Record<string, unknown>} [context] - Optional additional context to include in the log entry.
   * @memberof WinstonLoggerService
   */

  public debug(message: string, context?: Record<string, unknown>): void {
    this.log('debug', message, context);
  }

  /**
   * Logs a message at the 'error' level with optional context.
   *
   * @param {string} message - The log message.
   * @param {Record<string, unknown>} [context] - Optional additional context to include in the log entry.
   * @memberof WinstonLoggerService
   */

  public error(message: string, context?: Record<string, unknown>): void {
    this.log('error', message, context);
  }
  /**
   * Logs a message at the 'warn' level with optional context.
   *
   * @param {string} message - The log message.
   * @param {Record<string, unknown>} [context] - Optional additional context to include in the log entry.
   * @memberof WinstonLoggerService
   */

  public warn(message: string, context?: Record<string, unknown>): void {
    this.log('warn', message, context);
  }

  /**
   * Creates a child logger that inherits the current context and merges in additional context.
   *
   * @param {ILogContext} context - Additional context to merge with the existing default context.
   * @return {*}  {ILogger} - A new ILogger instance with the combined context.
   * @memberof WinstonLoggerService
   */

  public child(context: ILogContext): ILogger {
    return new WinstonLoggerService(this.config, this.clock, {
      ...this.defaultContext,
      ...context,
    });
  }

  /**
   * Logs a message at the specified level with optional context.
   *
   * @param {LogLevel} level - The log level (e.g., 'info', 'debug', 'error', 'warn').
   * @param {string} message - The log message.
   * @param {Record<string, unknown>} [context] - Optional additional context to include in the log entry.
   * @memberof WinstonLoggerService
   */

  public log(level: LogLevel, message: string, context?: Record<string, unknown>): void {
    const mergesContext = {
      ...this.defaultContext,
      ...context,
    };

    const logEntry: Partial<ILogEntry> = {
      timestamp: this.clock.isoString(),
      level,
      service: mergesContext.service || this.config.serviceName,
      message,
    };

    if (mergesContext.requestId !== undefined) {
      logEntry.requestId = mergesContext.requestId;
    }

    const contextWithoutService = Object.entries(mergesContext)
      .filter(([key]) => key !== 'service')
      .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});

    if (Object.keys(contextWithoutService).length > 0) {
      logEntry.context = contextWithoutService;
    }

    this.winston.log(level, logEntry as ILogEntry);
  }

  /**
   * Creates and configures the underlying Winston logger instance.
   *
   * @private
   * @return {*}  {WinstonLogger} - The configured Winston logger.
   * @memberof WinstonLoggerService
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
   * Creates the log format for production environment (JSON with timestamp and error stack).
   *
   * @private
   * @return {*}  {winston.Logform.Format} - The production log format.
   * @memberof WinstonLoggerService
   */

  private createProductionFormat() {
    const { combine, timestamp, errors, json } = winston.format;
    return combine(timestamp({ format: 'YYYY-MM-DDTHH:mm:ss.SSSZ' }), errors({ stack: true }), json());
  }

  /**
   * Creates the log format for development environment (colorized, human-friendly).
   *
   * @private
   * @return {*}  {winston.Logform.Format} - The development log format.
   * @memberof WinstonLoggerService
   */

  private createDevelopmentFormat() {
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
   * Creates the array of Winston transports based on the environment (console always, plus files in production).
   *
   * @private
   * @return {*}  {winston.transport[]} - The array of configured Winston transports.
   * @memberof WinstonLoggerService
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

      transports.push(
        new DailyRotateFile({
          filename: 'logs/combined-%DATE%.log',
          datePattern: 'YYYY-MM-DD',
          handleExceptions: false,
          maxSize: '20m',
          maxFiles: '14d',
          format: combine(timestamp(), errors({ stack: true }), json()),
        })
      );
    }

    return transports;
  }
}
