/**
 * Represents the possible Node.js environment modes.
 *
 * @remarks
 * This type is commonly used to determine the current runtime environment of the application,
 * allowing for environment-specific configurations and behaviors.
 *
 * @example
 * ```typescript
 * const env: NodeEnv = process.env.NODE_ENV as NodeEnv;
 * if (env === 'production') {
 *   // Production-specific logic
 * }
 * ```
 */

export type NodeEnv = 'development' | 'production' | 'test';

/**
 * Represents the available logging levels for the application.
 *
 * @remarks
 * This type defines the severity levels that can be used for logging messages,
 * ordered from most verbose to least verbose.
 *
 * - `debug`: Detailed information for debugging purposes
 * - `info`: General informational messages
 * - `warn`: Warning messages for potentially harmful situations
 * - `error`: Error messages for serious problems
 *
 * @example
 * ```typescript
 * const level: LogLevel = 'info';
 * logger.log(level, 'Application started');
 * ```
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

//TODO documentar
export interface IConfig {
	//Core envs
	readonly nodeEnv: NodeEnv;
	readonly port: number;
	readonly version: string;
	readonly serviceName: string;
	readonly logLevel: LogLevel;
	readonly logRequests: boolean;
	readonly jwtIssuer: string;

	//OAuth envs

	//functions
	isDevelopment(): boolean;
	isProduction(): boolean;
	isTest(): boolean;
	getSummary(): Record<string, unknown>;
}
