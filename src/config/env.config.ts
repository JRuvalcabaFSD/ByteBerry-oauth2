import dotenv from 'dotenv';
import { get } from 'env-var';
import { version } from '../../package.json';

import { IConfig, LogLevel, NodeEnv } from '@/interfaces';
import { ConfigError, getErrMsg } from '@/shared';

//TODO documentar
export class Config implements IConfig {
  public readonly nodeEnv: NodeEnv;
  public readonly port: number;
  public readonly logLevel: LogLevel;
  public readonly serviceName: string;
  public readonly corsOrigins: string[];
  public readonly version: string = version || '0.0.0';
  private static instance: Config | null = null;

  private constructor() {
    try {
      dotenv.config({ override: false });
      this.nodeEnv = get('NODE_ENV').default('development').asEnum(['development', 'production', 'test']) as NodeEnv;
      this.port = get('PORT').default(4000).asPortNumber();
      this.logLevel = this.verifyLogLevel();
      this.serviceName = get('SERVICE_NAME').default('ByteBerry-OAuth2').asString();
      this.corsOrigins = this.normalizeUrls(
        get('CORS_ORIGINS').default('http://localhost:5173,http://localhost:4002,http://localhost:4003').asArray()
      );
    } catch (error) {
      const errMsg = getErrMsg(error);
      throw new ConfigError(`Failed to validate environment variables: ${errMsg}`, {
        providedPort: process.env.PORT,
        providedNodeEnv: process.env.NODE_ENV,
        providedLogLevel: process.env.LOG_LEVEL,
        originalError: errMsg,
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
   * @returns {boolean} True if the NODE_ENV is set to 'production', false otherwise.
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
      serviceName: this.serviceName,
      corsOrigins: this.corsOrigins,
      version: this.version,
      isDevelopment: this.isDevelopment(),
      isProduction: this.isProduction(),
      isTest: this.isTest(),
    };
  }

  /**
   * Verifies and retrieves the log level configuration from environment variables.
   *
   * Validates that the log level is not set to 'debug' in production environments,
   * as debug logging may expose sensitive information or impact performance.
   *
   * @returns {LogLevel} The validated log level. Defaults to 'info' if not specified.
   * @throws {ConfigError} If the log level is set to 'debug' while running in production mode.
   *
   * @remarks
   * The method checks the following conditions:
   * - If NODE_ENV is 'production' and LOG_LEVEL is 'debug', a ConfigError is thrown
   * - Valid log levels are: 'debug', 'info', 'warn', 'error'
   * - Default log level is 'info' when not explicitly set
   */

  private verifyLogLevel(): LogLevel {
    if (this.nodeEnv === 'production' && process.env.LOG_LEVEL === 'debug')
      throw new ConfigError('Cannot assign the log level as "debug" when in production', {
        providedNodeEnv: process.env.NODE_ENV,
        providedLogLevel: process.env.LOG_LEVEL,
      });
    return get('LOG_LEVEL').default('info').asEnum(['debug', 'info', 'warn', 'error']) as LogLevel;
  }

  /**
   * Normalizes URL(s) by converting protocol and hostname to lowercase,
   * removing trailing slashes from pathnames (except root '/'), and trimming whitespace.
   *
   * @template T - The input type, either a string or an array of strings
   * @param input - A single URL string or an array of URL strings to normalize
   * @returns The normalized URL(s) in the same format as the input (string or string array)
   *
   * @remarks
   * - Invalid URLs are logged with a warning and returned unchanged
   * - Protocol and hostname are converted to lowercase
   * - Trailing slashes are removed from pathnames (preserving root '/')
   * - Leading and trailing whitespace is removed
   *
   * @example
   * ```typescript
   * // Single URL
   * normalizeUrls('HTTPS://EXAMPLE.COM/path/') // Returns: 'https://example.com/path'
   *
   * // Array of URLs
   * normalizeUrls(['HTTP://TEST.COM/', 'HTTPS://API.EXAMPLE.COM/v1/'])
   * // Returns: ['http://test.com', 'https://api.example.com/v1']
   * ```
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
   * Resets the singleton instance to null.
   * This method is primarily used for testing purposes to ensure a clean state
   * between test cases by clearing the existing instance.
   *
   * @returns void
   */

  public static resetInstance(): void {
    this.instance = null;
  }

  /**
   * Retrieves the singleton instance of the Config class.
   * If the instance doesn't exist, it creates a new one before returning it.
   *
   * @returns {Config} The singleton Config instance
   *
   * @example
   * ```typescript
   * const config = Config.getConfig();
   * ```
   */

  public static getConfig(): Config {
    if (!this.instance) this.instance = new Config();
    return this.instance;
  }
}

/**
 * Creates and returns the application configuration.
 *
 * @returns The configuration object obtained from Config.getConfig()
 */

export const createConfig = () => Config.getConfig();
