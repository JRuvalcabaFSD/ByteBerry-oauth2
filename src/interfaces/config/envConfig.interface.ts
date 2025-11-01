/**
 * String literal union of the permitted Node.js runtime environments for this application.
 *
 * - 'development' — Local development and debugging; verbose logging and non-optimized builds.
 * - 'production' — Live runtime; optimized builds, minimal logs, and strict error handling.
 * - 'test' — Automated testing; isolated configuration and test-friendly defaults.
 *
 * @see process.env.NODE_ENV
 * @public
 */

export type NodeEnv = 'development' | 'production' | 'test';
/**
 * Defines the available log levels for the application's logging system.
 *
 * @remarks
 * Log levels are ordered by severity from least to most severe:
 * - `debug`: Detailed information for debugging purposes
 * - `info`: General informational messages
 * - `warn`: Warning messages for potentially harmful situations
 * - `error`: Error messages for serious problems
 *
 * @public
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

//TODO documentar
export interface IConfig {
  readonly nodeEnv: NodeEnv;
  readonly port: number;
  readonly logLevel: LogLevel;
  readonly serviceName: string;
  readonly corsOrigins: string[];
  readonly version: string;
  isDevelopment(): boolean;
  isProduction(): boolean;
  isTest(): boolean;
}
