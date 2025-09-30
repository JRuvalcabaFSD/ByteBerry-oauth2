/**
 * Describes the allowed runtime environments for the application.
 *
 * Valid values:
 * - 'development' — local development or staging with debugging enabled.
 * - 'production' — live environment with optimizations enabled.
 * - 'test' — automated testing or CI pipelines.
 *
 * Use this type to constrain values derived from environment variables
 * (e.g., process.env.NODE_ENV) and to enable exhaustive checks in control flow.
 *
 * @example
 * const env = (process.env.NODE_ENV ?? 'development') as NodeEnv;
 * if (env === 'production') enableOptimizations();
 *
 * @public
 */

export type NodeEnv = 'development' | 'production' | 'test';

/**
 * Represents the set of supported severity levels for logging output.
 *
 * The levels, in increasing order of severity, are:
 * - 'debug' — verbose diagnostic details useful during development and troubleshooting.
 * - 'info' — general informational messages indicating normal application flow.
 * - 'warn' — recoverable issues or unexpected situations that may require attention.
 * - 'error' — failures or critical conditions that typically require immediate action.
 *
 * Use this type to restrict configuration and APIs to known log levels and to
 * control the verbosity of emitted logs.
 *
 * @example
 * ```ts
 * const level: LogLevel = 'warn';
 * logger.log(level, 'Cache miss for key %s', key);
 * ```
 *
 * @example
 * ```ts
 * const config = { logLevel: 'error' as LogLevel };
 * ```
 *
 * @public
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

/**
 * Runtime configuration contract for the ByteBerry OAuth2 service.
 *
 * @public
 * @remarks
 * Implementations should be immutable. This interface centralizes environment-
 * specific values and exposes convenience predicates:
 * - isDevelopment(): true when running in a development environment.
 * - isProduction(): true when running in a production environment.
 * - isTest(): true when running in a test environment.
 *
 * @property readonly port - TCP port number the service listens on.
 * @property readonly nodeEnv - The current Node.js environment (e.g., development, production, test).
 * @property readonly logLevel - Minimum log level to emit for application logs.
 * @property readonly serviceName - Stable service identifier ("ByteBerry-OAuth2").
 * @property readonly version - Service version string (typically SemVer).
 *
 * @example
 * ```ts
 * if (config.isProduction()) {
 *   enableMetrics();
 * } else if (config.isDevelopment()) {
 *   logger.level = 'debug';
 * }
 * ```
 */

export interface IConfig {
  readonly port: number;
  readonly nodeEnv: NodeEnv;
  readonly logLevel: LogLevel;
  readonly serviceName: string;
  readonly version: string;
  isDevelopment(): boolean;
  isProduction(): boolean;
  isTest(): boolean;
}
