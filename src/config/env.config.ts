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
	public readonly jwtAudience: string[];
	public readonly jwtAccessTokenExpiresIn: number;
	public readonly jwtPrivateKey?: string | undefined;
	public readonly jwtPublicKey?: string | undefined;
	public readonly jwtKeyId: string;
	public readonly connectionString: string;
	public readonly poolMin: number;
	public readonly poolMax: number;

	//TODO documentar
	constructor() {
		try {
			dotenv.config({ override: false });

			// ========================================
			// Core environments
			// ========================================
			this.nodeEnv = env.get('NODE_ENV').default('development').asEnum(['development', 'production', 'test']) as NodeEnv;
			this.port = env.get('PORT').default(4000).asPortNumber();
			this.serviceName = env.get('SERVICE_NAME').default('ByteBerry-OAuth2').asString();
			this.version = pkg.version || '0.0.0';
			this.corsOrigins = this.normalizeUrls(
				env.get('CORS_ORIGINS').default('http://localhost:5173,http://localhost:4002,http://localhost:4003').asArray()
			);

			// ========================================
			// Logs environments
			// ========================================
			const { logLevel, logRequest } = this.getLoggerEnvs();

			this.logLevel = logLevel;
			this.logRequests = logRequest;

			// ========================================
			// JWT environments
			// ========================================
			this.jwtIssuer = this.normalizeUrls(env.get('JWT_ISSUER').default('http://localhost:4000').asUrlString());
			this.jwtAudience = env.get('JWT_AUDIENCE').default('byteberry-expenses,byteberry-bff').asArray();
			this.jwtAccessTokenExpiresIn = env.get('JWT_ACCESS_TOKEN_EXPIRES_IN').default(900).asIntPositive();
			this.jwtPrivateKey = this.validateJWtPrivateKey();
			this.jwtPublicKey = this.validateJWtPublicKey();
			this.jwtKeyId = env.get('JWT_KEY_ID').default('default-key-1').asString();

			// ========================================
			// Database environments
			// ========================================
			this.connectionString = env.get('DATABASE_URL').required().asString();
			this.poolMin = env.get('DATABASE_POOL_MIN').default(2).asIntPositive();
			this.poolMax = env.get('DATABASE_POOL_MAX').default(10).asIntPositive();
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

	/**
	 * Validates and retrieves the JWT private key from the environment configuration.
	 *
	 * This method checks if the private key is present and ensures it is in PEM format
	 * with the proper headers. If the key is missing or incorrectly formatted, it throws
	 * a `ConfigError`. If valid, it replaces escaped newline characters (`\n`) with actual
	 * newline characters and returns the formatted key.
	 *
	 * @returns {string | undefined} The validated and formatted JWT private key, or `undefined` if not present.
	 * @throws {ConfigError} If the private key is present but not in PEM format with proper headers.
	 */

	private validateJWtPrivateKey(): string | undefined {
		const privateKey = env.get('JWT_PRIVATE_KEY').asString();

		if (!privateKey) return undefined;
		if (!privateKey.includes('BEGIN PRIVATE KEY'))
			throw new ConfigError('JWT_PRIVATE_KEY must be in PEM format with proper headers', {
				hasPrivateKey: !!privateKey,
				keyFormat: 'Invalid - missing PEM headers',
			});

		return privateKey.replace(/\\n/g, '\n');
	}

	/**
	 * Validates and retrieves the JWT public key from the configuration.
	 *
	 * This method checks if the public key is present and ensures it is in PEM format
	 * with the proper "BEGIN PUBLIC KEY" header. If the key is missing or improperly formatted,
	 * it throws a `ConfigError`. If valid, it replaces escaped newline characters (`\n`)
	 * with actual newline characters and returns the formatted public key string.
	 *
	 * @returns {string | undefined} The validated and formatted JWT public key, or `undefined` if not present.
	 * @throws {ConfigError} If the public key is present but not in the correct PEM format.
	 */

	private validateJWtPublicKey(): string | undefined {
		const publicKey = env.get('JWT_PUBLIC_KEY').asString();

		if (!publicKey) return undefined;
		if (!publicKey.includes('BEGIN PUBLIC KEY'))
			throw new ConfigError('JWT_PUBLIC_KEY must be in PEM format with proper headers', {
				hasPrivateKey: !!publicKey,
				keyFormat: 'Invalid - missing PEM headers',
			});

		return publicKey.replace(/\\n/g, '\n');
	}
}
