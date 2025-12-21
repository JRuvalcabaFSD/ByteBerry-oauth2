import env from 'env-var';

import { IConfig, LogLevel, NodeEnv } from '@interfaces';
import pkg from '../../package.json' with { type: 'json' };
import { ConfigError, getErrMsg } from '@shared';

//TODO documentar
export class Config implements IConfig {
	public readonly nodeEnv: NodeEnv;
	public readonly port: number;
	public readonly version: string;
	public readonly serviceName: string;
	public readonly logLevel: LogLevel;
	public readonly logRequests: boolean;

	constructor() {
		try {
			// ========================================
			// Core environments
			// ========================================
			this.nodeEnv = env.get('NODE_ENV').default('development').asEnum(['development', 'production', 'test']) as NodeEnv;
			this.port = env.get('PORT').default(4000).asPortNumber();
			this.serviceName = env.get('SERVICE_NAME').default('ByteBerry-OAuth2').asString();
			this.version = pkg.version || '0.0.0';

			// ========================================
			// Logs environments
			// ========================================
			const { logLevel, logRequest } = this.getLoggerEnvs();

			this.logLevel = logLevel;
			this.logRequests = logRequest;
		} catch (error) {
			throw new ConfigError(`Failed to validate environment variables ${getErrMsg(error)}`, this.generateContext());
		}
	}

	/**
	 * Determines if the current environment is set to development.
	 *
	 * @returns {boolean} `true` if the environment is 'development'; otherwise, `false`.
	 */

	public isDevelopment(): boolean {
		return this.nodeEnv === 'development';
	}

	/**
	 * Determines if the current environment is set to production.
	 *
	 * @returns {boolean} `true` if the environment is 'production'; otherwise, `false`.
	 */

	public isProduction(): boolean {
		return this.nodeEnv === 'production';
	}

	/**
	 * Determines if the current environment is set to 'test'.
	 *
	 * @returns {boolean} `true` if the environment is 'test'; otherwise, `false`.
	 */

	public isTest(): boolean {
		return this.nodeEnv === 'test';
	}

	/**
	 * Returns a summary of the current environment configuration.
	 *
	 * @returns {Record<string, unknown>} An object containing the following properties:
	 * - `nodeEnv`: The current Node.js environment (e.g., 'development', 'production').
	 * - `port`: The port number the application is configured to use.
	 * - `logLevel`: The logging level set for the application.
	 * - `logRequests`: Indicates whether HTTP requests are being logged.
	 */

	public getSummary(): Record<string, unknown> {
		return {
			nodeEnv: this.nodeEnv,
			port: this.port,
			logLevel: this.logLevel,
			logRequests: this.logRequests,
		};
	}

	/**
	 * Retrieves logger-related environment configurations.
	 *
	 * This method enforces production safety by throwing a `ConfigError` if:
	 * - The application is running in production and the log level is set to "debug".
	 * - The application is running in production and request logging is enabled.
	 *
	 * @returns An object containing:
	 * - `logLevel`: The log level, which can be "debug", "info", "warn", or "error".
	 * - `logRequest`: A boolean indicating whether request logging is enabled.
	 *
	 * @throws {ConfigError} If invalid logger settings are detected in production.
	 */

	private getLoggerEnvs(): { logLevel: LogLevel; logRequest: boolean } {
		if (this.isProduction() && process.env.LOG_LEVEL === 'debug') throw new ConfigError('cannot assign logLevel as "debug" in production');
		if (this.isProduction() && process.env.LOG_REQUESTS === 'true') throw new ConfigError('cannot show the request logs in production');

		return {
			logLevel: env.get('LOG_LEVEL').default('info').asEnum(['debug', 'info', 'warn', 'error']),
			logRequest: env.get('LOG_REQUESTS').default('true').asBoolStrict(),
		};
	}

	/**
	 * Generates a context object containing selected environment variables,
	 * formatted as PascalCase keys prefixed with 'provider'. Sensitive values
	 * (those whose keys include 'key', 'secret', 'token', or 'password') are
	 * redacted as '[REDACTED]'.
	 *
	 * @returns {Record<string, string>} An object mapping PascalCase environment variable keys
	 * prefixed with 'provider' to their corresponding values or '[REDACTED]' if sensitive.
	 *
	 * @example
	 * // Given process.env = { NODE_ENV: 'production', API_KEY: '12345' }
	 * // The output will be:
	 * // {
	 * //   providerNodeEnv: 'production',
	 * //   providerApiKey: '[REDACTED]'
	 * // }
	 */

	private generateContext(): Record<string, string> {
		const envs = ['NODE_ENV', 'PORT', 'SERVICE_NAME', 'LOG_LEVEL', 'LOG_REQUESTS'] as const;
		const sensitiveKeywords = ['key', 'secret', 'token', 'password'];

		return envs.reduce(
			(context, key) => {
				const pascalCase = key
					.toLowerCase()
					.split('_')
					.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
					.join('');

				const contextKey = `provider${pascalCase}`;

				const isSensitive = sensitiveKeywords.some((sk) => key.toLocaleLowerCase().includes(sk.toLocaleLowerCase()));

				context[contextKey] = isSensitive ? '[REDACTED]' : (process.env[key] ?? '');

				return context;
			},
			{} as Record<string, string>
		);
	}
}
