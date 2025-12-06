import dotenv from 'dotenv';
import env from 'env-var';

import { IConfig, LogLevel, NodeEnv } from '@interfaces';
import { AppError, ConfigError, getErrMsg } from '@shared';
import pkg from '../../package.json' with { type: 'json' };

//TODO documentar
export class Config implements IConfig {
	public readonly nodeEnv: NodeEnv;
	public readonly port: number;
	public readonly logLevel: LogLevel;
	public readonly logRequests: boolean;
	public readonly version: string;
	public readonly serviceName: string;
	public readonly jwtIssuer: string;
	public readonly corsOrigins: string[];

	//TODO documentar
	constructor() {
		try {
			dotenv.config({ override: false });

			this.nodeEnv = env.get('NODE_ENV').default('development').asEnum(['development', 'production', 'test']) as NodeEnv;
			this.port = env.get('PORT').default(4000).asPortNumber();
			this.serviceName = env.get('SERVICE_NAME').default('ByteBerry-OAuth2').asString();

			const { logLevel, logRequest } = this.getLoggerEnvs();

			this.logLevel = logLevel;
			this.logRequests = logRequest;
			this.corsOrigins = this.normalizeUrls(
				env.get('CORS_ORIGINS').default('http://localhost:5173,http://localhost:4002,http://localhost:4003').asArray()
			);
			this.jwtIssuer = this.normalizeUrls(env.get('JWT_ISSUER').default('http://localhost:4000').asUrlString());
			this.version = pkg.version || '0.0.0';
		} catch (error) {
			if (error instanceof AppError) throw error;
			throw new ConfigError(`Failed to validate environment variables: ${getErrMsg(error)}`, {
				providerNodeEnv: process.env.NODE_ENV,
				providerPort: process.env.PORT,
				providerLogLevel: process.env.LOG_LEVEL,
				providerLogRequests: process.env.LOG_REQUESTS,
				providerCorsOrigins: process.env.CORS_ORIGINS,
				providerJwtIssuer: process.env.JWT_ISSUER,
			});
		}
	}

	/**
	 * Checks if the application is running in development mode.
	 *
	 * @returns {boolean} `true` if the NODE_ENV is set to 'development', `false` otherwise.
	 */

	public isDevelopment(): boolean {
		return this.nodeEnv === 'development';
	}

	/**
	 * Checks if the application is running in production environment.
	 *
	 * @returns {boolean} `true` if the NODE_ENV is set to 'production', `false` otherwise.
	 */

	public isProduction(): boolean {
		return this.nodeEnv === 'production';
	}

	/**
	 * Checks if the application is running in test environment.
	 *
	 * @returns {boolean} True if the NODE_ENV is set to 'test', false otherwise.
	 */

	public isTest(): boolean {
		return this.nodeEnv === 'test';
	}

	//TODO documentar
	public getSummary(): Record<string, unknown> {
		return {
			nodeEnv: this.nodeEnv,
			port: this.port,
			logLevel: this.logLevel,
			logRequests: this.logRequests,
		};
	}

	/**
	 * Normalizes URL(s) by standardizing protocol, hostname, and pathname formatting.
	 *
	 * This method performs the following normalizations:
	 * - Converts protocol to lowercase (e.g., "HTTP://" → "http://")
	 * - Converts hostname to lowercase (e.g., "Example.COM" → "example.com")
	 * - Removes trailing slashes from pathnames (except root "/")
	 * - Trims whitespace and removes any remaining trailing slashes
	 *
	 * @template T - The input type, either a single string or an array of strings
	 * @param input - A single URL string or an array of URL strings to normalize
	 * @returns The normalized URL(s) in the same format as the input (string or array)
	 *
	 * @example
	 * ```typescript
	 * // Single URL
	 * normalizeUrls("HTTPS://Example.COM/path/") // Returns: "https://example.com/path"
	 *
	 * // Multiple URLs
	 * normalizeUrls(["HTTP://API.Example.com/", "HTTPS://WWW.TEST.COM/endpoint/"])
	 * // Returns: ["http://api.example.com", "https://www.test.com/endpoint"]
	 * ```
	 *
	 * @remarks
	 * If a URL cannot be parsed (invalid format), a warning is logged to the console
	 * and the original URL string is returned unchanged.
	 */

	private normalizeUrls<T extends string | string[]>(input: T): T {
		// Helper function to normalize a single URL
		const normalizeSingleUrl = (url: string): string => {
			try {
				const parsed = new URL(url);
				parsed.protocol = parsed.protocol.toLowerCase();
				parsed.hostname = parsed.hostname.toLowerCase();
				if (parsed.pathname.endsWith('/') && parsed.pathname !== '/') {
					parsed.pathname = parsed.pathname.slice(0, -1);
				}
				return parsed.toString().trim().replace(/\/+$/, '');
			} catch (error) {
				// eslint-disable-next-line no-console
				console.warn(`Invalid URL skipped for normalization: ${url}`, error);
				return url;
			}
		};

		// Handle single URL string or array of URLs
		if (typeof input === 'string') {
			return normalizeSingleUrl(input) as T;
		}

		return input.reduce<string[]>((acc, url) => {
			acc.push(normalizeSingleUrl(url));
			return acc;
		}, []) as T;
	}

	/**
	 * Retrieves and validates logger environment configuration settings.
	 *
	 * This method ensures that debug logging and request logging are disabled in production environments.
	 *
	 * @returns An object containing the logger configuration with:
	 *   - `logLevel`: The logging level (debug, info, warn, or error). Defaults to 'info'.
	 *   - `logRequest`: Whether HTTP request logging is enabled. Defaults to true.
	 *
	 * @throws {ConfigError} When LOG_LEVEL is set to 'debug' in a production environment.
	 * @throws {ConfigError} When LOG_REQUESTS is set to 'true' in a production environment.
	 *
	 * @private
	 */

	private getLoggerEnvs(): { logLevel: LogLevel; logRequest: boolean } {
		if (this.isProduction() && process.env.LOG_LEVEL === 'debug')
			throw new ConfigError('Cannot assign the log level as "debug" when in production', { providerLogLevel: process.env.LOG_LEVEL });
		if (this.isProduction() && process.env.LOG_REQUESTS === 'true')
			throw new ConfigError('http request logs cannot be shown in production', { providerLogLevel: process.env.LOG_LEVEL });

		return {
			logLevel: env.get('LOG_LEVEL').default('info').asEnum(['debug', 'info', 'warn', 'error']) as LogLevel,
			logRequest: env.get('LOG_REQUESTS').default('true').asBoolStrict(),
		};
	}
}
