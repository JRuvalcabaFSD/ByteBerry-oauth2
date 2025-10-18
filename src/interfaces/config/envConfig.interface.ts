/**
 * Represents the runtime environment of the Node.js application.
 *
 * Allowed values:
 * - 'development' — development mode with verbose logging and developer conveniences.
 * - 'production'  — production mode optimized for performance and security.
 * - 'test'        — testing mode used by test runners; typically enables isolated configs.
 *
 * @remarks
 * Use this type for configuration keys or guards that branch behavior depending on NODE_ENV.
 *
 * @example
 * const env: NodeEnv = process.env.NODE_ENV as NodeEnv;
 *
 * @see {@link https://nodejs.org/api/process.html#processenv|process.env}
 */

export type NodeEnv = 'development' | 'production' | 'test';

/**
 * Available logging verbosity levels used across the application.
 *
 * - 'debug' — Detailed diagnostic information useful for development and troubleshooting.
 * - 'info'  — General operational messages that track high-level progress.
 * - 'warn'  — Indications of potential problems or noteworthy situations that do not stop execution.
 * - 'error' — Serious issues or failures that typically require attention.
 *
 * Use this union type for configuration settings, logging APIs, and validating environment values
 * to ensure consistent log-level semantics throughout the codebase.
 *
 * @remarks
 * Selecting a stricter level reduces log volume; choosing a more permissive level (e.g., 'debug')
 * increases verbosity for troubleshooting.
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

/**
 * Interface describing the application's runtime configuration and environment.
 *
 * Exposes typed configuration values and small helper methods to check the
 * current runtime environment.
 *
 * Properties
 * - nodeEnv: The current Node environment identifier (e.g. "development", "production", "test").
 * - port: TCP port number the service should listen on.
 * - logLevel: Logging verbosity level used by the application.
 * - serviceName: Human-readable name of the running service.
 * - corsOrigins: List of allowed CORS origins for incoming requests.
 * - version: The current version of the application.
 *
 * Methods
 * - isDevelopment(): Returns true when the current environment is considered development.
 * - isProduction(): Returns true when the current environment is considered production.
 * - isTest(): Returns true when the current environment is considered a test run.
 *
 * @public
 */

export interface IConfig {
  //Core environments
  readonly nodeEnv: NodeEnv;
  readonly port: number;
  readonly logLevel: LogLevel;
  readonly serviceName: string;
  readonly corsOrigins: string[];
  readonly version: string;

  //Environment checkers
  isDevelopment(): boolean;
  isProduction(): boolean;
  isTest(): boolean;
}
