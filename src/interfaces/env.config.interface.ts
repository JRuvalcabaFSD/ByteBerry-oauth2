/**
 * Represents the possible values for the Node.js environment.
 *
 * - `'development'`: Used during development.
 * - `'production'`: Used in production deployments.
 * - `'test'`: Used during testing.
 */

export type NodeEnv = 'development' | 'production' | 'test';
/**
 * Represents the available logging levels for the application.
 *
 * - `'debug'`: Detailed information, typically of interest only when diagnosing problems.
 * - `'info'`: Confirmation that things are working as expected.
 * - `'warn'`: An indication that something unexpected happened, or indicative of some problem in the near future.
 * - `'error'`: Due to a more serious problem, the software has not been able to perform some function.
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

	//functions
	isDevelopment(): boolean;
	isProduction(): boolean;
	isTest(): boolean;
	getSummary(): Record<string, unknown>;
}
