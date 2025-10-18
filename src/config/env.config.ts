/* eslint-disable no-console */
import dotenv from 'dotenv';
import { get } from 'env-var';
import pkg from '../../package.json';

import { IConfig, LogLevel, NodeEnv } from '@/interfaces';
import { getErrorMessage } from '@/shared/functions/general';
import { ConfigError } from '@/shared';

/**
 * Singleton configuration manager that loads, validates, and exposes application settings
 * derived from environment variables.
 *
 * @remarks
 * The class is implemented as a singleton — use Config.getConfig() to obtain the instance.
 * The private constructor reads environment variables (via dotenv and the project's
 * validation helpers), applies defaults, normalizes CORS origin URLs, and sets strongly-typed
 * properties such as nodeEnv, port, logLevel, serviceName, corsOrigins and version.
 *
 * If validation fails during construction, a ConfigError is thrown and includes contextual
 * information (providedPort, providedNodeEnv, providedLogLevel, originalError) to aid debugging.
 *
 * Convenience predicates are provided for common environment checks (isDevelopment, isProduction,
 * isTest). getSummary() returns a serializable snapshot of key configuration values useful for
 * logging on startup. resetInstance() exists to clear the singleton (useful for tests).
 *
 * Private implementation details:
 * - normalizeUrls(input): Normalizes a single URL or an array of URLs by lowercasing protocol
 *   and hostname, trimming trailing path slashes (except for root '/'), and logging (but not
 *   throwing) when an invalid URL is encountered.
 *
 * @throws {ConfigError} When environment validation fails during construction.
 *
 * @example
 * const cfg = Config.getConfig();
 * console.log(cfg.getSummary());
 */

export class Config implements IConfig {
  public readonly nodeEnv: NodeEnv;
  public readonly port: number;
  public readonly logLevel: LogLevel;
  public readonly serviceName: string;
  public readonly corsOrigins: string[];
  public readonly version: string;
  private static instance: Config | null = null;

  /**
   * Private constructor that initializes and validates runtime configuration from environment variables.
   *
   * Loads environment variables from a .env file (dotenv.config with override: false), then reads and validates
   * required values via the env-var helper (`get`), assigning them to instance properties:
   * - nodeEnv: validated enum "development" | "production" | "test" (default: "development")
   * - logLevel: validated enum "debug" | "info" | "warn" | "error" (default: "info")
   * - serviceName: service identifier string (default: "ByteBerry-OAuth2")
   * - corsOrigins: normalized array of allowed CORS origins parsed from CORS_ALLOWED_ORIGINS (default: two localhost entries)
   * - port: validated port number (default: 4000)
   * - version: package version from pkg.version with fallback "0.0.0"
   *
   * Any validation or parsing error is caught and rethrown as a ConfigError containing contextual metadata
   * (providedPort, providedNodeEnv, providedLogLevel) and the original error message to aid diagnostics.
   *
   * @private
   * @throws {ConfigError} When environment variable validation fails or required values cannot be parsed.
   */

  private constructor() {
    try {
      dotenv.config({ override: false });

      this.nodeEnv = get('NODE_ENV').default('development').asEnum(['development', 'production', 'test']) as NodeEnv;
      this.logLevel = get('LOG_LEVEL').default('info').asEnum(['debug', 'info', 'warn', 'error']) as LogLevel;
      this.serviceName = get('SERVICE_NAME').default('ByteBerry-OAuth2').asString();
      this.corsOrigins = this.normalizeUrls(get('CORS_ALLOWED_ORIGINS').default('http://localhost:4001,http://localhost:4002').asArray());
      this.port = get('PORT').default(4000).asPortNumber();
      this.version = pkg.version || '0.0.0';
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      throw new ConfigError(`Failed to validate environment variables: ${errorMessage}`, {
        providedPort: process.env.PORT,
        providedNodeEnv: process.env.NODE_ENV,
        providedLogLevel: process.env.LOG_LEVEL,
        originalError: errorMessage,
      });
    }
  }

  /**
   * Determines whether the current runtime environment is the development environment.
   *
   * Performs a strict, case-sensitive comparison of this.nodeEnv to the literal
   * string 'development'.
   *
   * @returns {boolean} True if nodeEnv is exactly 'development'; otherwise false.
   */

  public isDevelopment(): boolean {
    return this.nodeEnv === 'development';
  }

  /**
   * Determines whether the application is running in production mode.
   *
   * Compares the instance's `nodeEnv` value against the literal `'production'`.
   * The comparison is strict and case-sensitive.
   *
   * @returns {boolean} `true` if `nodeEnv === 'production'`, otherwise `false`.
   */

  public isProduction(): boolean {
    return this.nodeEnv === 'production';
  }

  /**
   * Determines whether the current runtime environment is the test environment.
   *
   * Checks the configured Node environment value and returns true when it is equal
   * to 'test'. Useful for conditionally enabling test-only behavior or configuration.
   *
   * @returns True if the configured environment is 'test'; otherwise false.
   */

  public isTest(): boolean {
    return this.nodeEnv === 'test';
  }

  /**
   * Resets the cached singleton instance.
   *
   * Clears the internal static instance reference so that a new instance
   * will be created on the next access. Primarily useful for testing
   * or when explicit reinitialization of configuration is required.
   *
   * @remarks
   * Calling this will discard any state stored on the current instance.
   * Ensure no consumers rely on the previous instance after this call.
   *
   * @public
   */

  public static resetInstance(): void {
    this.instance = null;
  }

  /**
   * Returns a lightweight summary of the current environment configuration.
   *
   * The returned object is a plain record containing commonly used environment
   * properties and convenience boolean checks. The shape includes:
   * - `port` — server port (typically number or string depending on configuration)
   * - `nodeEnv` — node environment string (e.g. "development", "production", "test")
   * - `logLevel` — configured logging level (e.g. "info", "debug")
   * - `isDevelopment` — true when the environment is considered development
   * - `isProduction` — true when the environment is considered production
   * - `isTest` — true when the environment is considered test
   *
   * This method is intended for diagnostic, logging, or telemetry purposes where
   * a compact representation of the runtime environment is needed.
   *
   * @returns A record mapping descriptive keys to their corresponding values.
   *
   * @example
   * // {
   * //   port: 3000,
   * //   nodeEnv: "development",
   * //   logLevel: "debug",
   * //   isDevelopment: true,
   * //   isProduction: false,
   * //   isTest: false
   * // }
   */

  public getSummary(): Record<string, unknown> {
    return {
      port: this.port,
      nodeEnv: this.nodeEnv,
      logLevel: this.logLevel,
      isDevelopment: this.isDevelopment(),
      isProduction: this.isProduction(),
      isTest: this.isTest(),
    };
  }

  /**
   * Normalizes a URL string or an array of URL strings.
   *
   * This helper:
   * - Parses each URL using the WHATWG URL API (new URL(url)).
   * - Lowercases the protocol and hostname.
   * - Removes a trailing slash from the pathname except when the pathname is the root ("/").
   * - Serializes the normalized URL via URL.prototype.toString().
   *
   * For inputs that cannot be parsed by the URL constructor, the original value is returned
   * unchanged and a warning is emitted via console.warn for that entry.
   *
   * @template T - The input type, either a single string or an array of strings (string | string[]).
   * @param input - A URL string or an array of URL strings to normalize.
   * @returns The normalized URL or array of normalized URLs, preserving the input type T. Invalid/unparsable entries are returned as they were provided.
   *
   * @remarks
   * - Because the function uses new URL(url), bare hostnames (e.g. "example.com" without a scheme)
   *   will be considered invalid and left unchanged.
   * - Side effect: logs a warning for each invalid URL encountered.
   *
   * @example
   * // Single string
   * normalizeUrls('HTTPS://Example.COM/path/');
   * // => 'https://example.com/path'
   *
   * @example
   * // Array of strings
   * normalizeUrls(['https://Foo.COM/', 'not-a-url']);
   * // => ['https://foo.com', 'not-a-url'] and a warning is logged for 'not-a-url'
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
   * Returns the singleton Config instance, creating it lazily if it does not yet exist.
   *
   * This implements the lazy-initialization singleton pattern: the first call will
   * instantiate a Config and subsequent calls will return the same instance.
   *
   * @returns The shared Config instance used throughout the application.
   */

  public static getConfig(): Config {
    if (!this.instance) this.instance = new Config();
    return this.instance;
  }
}
