/* eslint-disable no-console */
import { IClock, IEnvConfig, ILogContext, ILogEntry, ILogger, LogLevel } from '@/interfaces';

/**
 * Logger service implementation with structured logging
 * @export
 * @class LoggerService
 * @implements {ILogger}
 */
export class LoggerService implements ILogger {
  private readonly service = 'oauth2';
  private defaultContext: Partial<ILogContext> = {};
  private readonly logLevels: Record<LogLevel, number> = { debug: 0, info: 1, warn: 2, error: 3 };

  /**
   * Creates an instance of LoggerService.
   * @param {IEnvConfig} config
   * @param {IClock} clock
   * @memberof LoggerService
   */
  constructor(
    private readonly config: IEnvConfig,
    private readonly clock: IClock
  ) {}

  /**
   * Log debug message
   * @param {string} message
   * @param {ILogContext} [context]
   * @memberof LoggerService
   */
  public debug(message: string, context?: ILogContext): void {
    this.log('debug', message, context);
  }

  /**
   * Log info message
   * @param {string} message
   * @param {ILogContext} [context]
   * @memberof LoggerService
   */
  info(message: string, context?: ILogContext): void {
    this.log('info', message, context);
  }

  /**
   * Log warning message
   * @param {string} message
   * @param {ILogContext} [context]
   * @memberof LoggerService
   */
  public warn(message: string, context?: ILogContext): void {
    this.log('warn', message, context);
  }

  /**
   * Generic log method with level filtering
   * @param {string} message
   * @param {(Error | ILogContext)} [errorOrContext]
   * @param {ILogContext} [context]
   * @memberof LoggerService
   */
  public error(message: string, errorOrContext?: Error | ILogContext, context?: ILogContext): void {
    if (errorOrContext instanceof Error) {
      const errorContext = {
        ...context,
        error: {
          name: errorOrContext.name,
          message: errorOrContext.name,
          stack: errorOrContext.stack,
        },
      };
      this.log('error', message, errorContext);
    } else {
      this.log('error', message, errorOrContext as ILogContext);
    }
  }

  /**
   * Generic log method with level filtering
   * @param {LogLevel} level
   * @param {string} message
   * @param {ILogContext} [context]
   * @return {*}  {void}
   * @memberof LoggerService
   */
  log(level: LogLevel, message: string, context?: ILogContext): void {
    if (!this.shouldLog(level)) return;

    const logEntry = this.createLogEntry(level, message, context);

    if (this.config.isProduction()) {
      this.logJson(logEntry);
    } else {
      this.logHumanReadable(logEntry);
    }
  }

  /**
   * Check if message should be logged based on level
   * @private
   * @param {LogLevel} level
   * @return {*}  {boolean}
   * @memberof LoggerService
   */
  private shouldLog(level: LogLevel): boolean {
    const messageLevel = this.logLevels[level];
    const configuredLevel = this.logLevels[this.config.logLevel];
    return messageLevel >= configuredLevel;
  }

  /**
   * Create structured log entry
   * @private
   * @param {LogLevel} level
   * @param {string} message
   * @param {ILogContext} [context]
   * @return {*}  {ILogEntry}
   * @memberof LoggerService
   */
  private createLogEntry(level: LogLevel, message: string, context?: ILogContext): ILogEntry {
    const mergedContext = { ...this.defaultContext, ...context };

    const logEntry: ILogEntry = {
      timestamp: this.clock.now().toISOString(),
      level,
      service: this.service,
      message,
      requestId: mergedContext.requestId,
    };

    // Add additional data if present
    const { _requestId, _service, ...additionalData } = mergedContext;
    if (Object.keys(additionalData).length > 0) {
      logEntry.data = additionalData;
    }

    return logEntry;
  }

  /**
   * Output JSON formatted log (production)
   * @private
   * @param {*} logEntry
   * @memberof LoggerService
   */
  private logJson(logEntry: ILogEntry) {
    console.log(JSON.stringify(logEntry));
  }

  /**
   * Output human readable log (development)
   * @private
   * @param {*} logEntry
   * @memberof LoggerService
   */
  private logHumanReadable(logEntry: ILogEntry) {
    const timestamp = logEntry.timestamp;
    const level = logEntry.level.toUpperCase().padEnd(5);
    const service = `[${logEntry.service}]`;
    const requestId = logEntry.requestId ? `[${logEntry.requestId}]` : '';
    const message = logEntry.message;

    let logLine = `${timestamp} ${level} ${service}${requestId} ${message}`;

    if (logEntry.data) {
      logLine += ` ${JSON.stringify(logEntry.data)}`;
    }

    // Use appropriate console method based on level
    switch (logEntry.level) {
      case 'debug':
        console.debug(logLine);
        break;
      case 'info':
        console.info(logLine);
        break;
      case 'warn':
        console.warn(logLine);
        break;
      case 'error':
        console.error(logLine);
        break;
      default:
        console.log(logLine);
    }
  }

  /**
   * Set default context for all log entries
   * @param {Partial<ILogContext>} context
   * @memberof LoggerService
   */
  public setDefaultContext(context: Partial<ILogContext>): void {
    this.defaultContext = { ...this.defaultContext, ...context };
  }
}
