import { LogLevel } from '@/interfaces/config/envs.interface';

/**
 * Interface for Logger Context implementation
 * @export
 * @interface ILogContext
 */
export interface ILogContext {
  requestId?: string;
  userId?: string;
  service?: string;
  [key: string]: unknown;
}

/**
 * Registration entrance for interface
 * @export
 * @interface ILogEntry
 */
export interface ILogEntry {
  timestamp: string;
  level: LogLevel;
  service: string;
  message: string;
  requestId?: string | undefined;
  data?: Record<string, unknown> | undefined;
}

/**
 * Interface for LOGGER service
 * @export
 * @interface ILogger
 */
export interface ILogger {
  debug(message: string, context?: ILogContext): void;
  info(message: string, context?: ILogContext): void;
  warn(message: string, context?: ILogContext): void;
  error(message: string, context?: ILogContext): void;
  error(message: string, error: Error, context?: ILogContext): void;
  log(level: LogLevel, message: string, context?: ILogContext): void;
  setDefaultContext(context: Partial<ILogContext>): void;
}
