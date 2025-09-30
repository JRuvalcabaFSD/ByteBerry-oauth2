import dotenv from 'dotenv';
import { get } from 'env-var';

import { IConfig, LogLevel, NodeEnv } from '@/interfaces';
import pkg from '../../package.json';
import { ConfigError } from '@/shared';

/**
 * Singleton service configuration that loads, validates, and exposes runtime
 * environment variables with strong typing and sensible defaults.
 *
 * Sources and precedence:
 * - .env file (loaded via dotenv with override disabled)
 * - Process environment variables
 * - Package version (read from package.json)
 *
 * Environment variables:
 * - PORT: HTTP port (default: 4000)
 * - NODE_ENV: 'development' | 'production' | 'test' (default: 'development')
 * - LOG_LEVEL: 'debug' | 'info' | 'warn' | 'error' (default: 'info')
 * - SERVICE_NAME: service identifier (default: 'byteberry-oauth2')
 *
 * Exposed properties:
 * - port: number
 * - nodeEnv: current environment
 * - logLevel: minimum log level
 * - serviceName: service name for logs/metrics
 * - version: semantic version of the service
 *
 * Helper methods:
 * - isDevelopment(): boolean
 * - isProduction(): boolean
 * - isTest(): boolean
 * - getSummary(): concise, serializable snapshot of key settings
 *
 * Lifecycle:
 * - Use getConfig() to lazily initialize and retrieve the singleton instance.
 * - Use resetInstance() in tests to reinitialize after changing process env.
 *
 * Error handling:
 * - Throws ConfigError if environment validation fails. The error includes
 *   the provided values and the underlying validation message to aid debugging.
 *
 * @example
 * // Acquire configuration and branch by environment
 * const config = Config.getConfig();
 * if (config.isDevelopment()) {
 *   // enable verbose diagnostics
 * }
 *
 * @example
 * // Reset between tests to apply new env values
 * Config.resetInstance();
 * process.env.PORT = '5001';
 * const fresh = Config.getConfig();
 *
 * @implements IConfig
 * @public
 * @throws ConfigError When environment variables are missing or invalid.
 */

export class Config implements IConfig {
  public readonly port: number;
  public readonly nodeEnv: NodeEnv;
  public readonly logLevel: LogLevel;
  public readonly serviceName: string;
  public readonly version: string;
  private static instance: Config | null = null;

  /**
   * Creates an instance of Config.
   * @memberof Config
   */

  private constructor() {
    try {
      dotenv.config({ override: false });

      this.port = get('PORT').default(4000).asPortNumber();
      this.nodeEnv = get('NODE_ENV').default('development').asEnum(['development', 'production', 'test']) as NodeEnv;
      this.logLevel = get('LOG_LEVEL').default('info').asEnum(['debug', 'info', 'warn', 'error']) as LogLevel;
      this.serviceName = get('SERVICE_NAME').default('byteberry-oauth2').asString();
      this.version = pkg.version || '0.0.0';
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      throw new ConfigError(`Failed to validate environment variables: ${error.message}`, {
        providedPort: process.env.PORT,
        providedNodeEnv: process.env.NODE_ENV,
        providedLogLevel: process.env.LOG_LEVEL,
        originalError: error.message,
      });
    }
  }

  /**
   * Returns true if the current environment is 'development'.
   * @return {*}  {boolean} True if NODE_ENV is 'development'.
   * @memberof Config
   */

  public isDevelopment(): boolean {
    return this.nodeEnv === 'development';
  }

  /**
   * Returns true if the current environment is 'production'.
   * @return {*}  {boolean} True if NODE_ENV is 'production'.
   * @memberof Config
   */

  public isProduction(): boolean {
    return this.nodeEnv === 'production';
  }

  /**
   * Returns true if the current environment is 'test'.
   * @return {*}  {boolean} True if NODE_ENV is 'test'.
   * @memberof Config
   */

  public isTest(): boolean {
    return this.nodeEnv === 'test';
  }

  /**
   * Returns the singleton Config instance, creating it if necessary.
   * @static
   * @return {*}  {Config} The Config singleton instance.
   * @memberof Config
   */

  public static getConfig(): Config {
    if (!this.instance) this.instance = new Config();
    return this.instance;
  }

  /**
   * Resets the singleton instance. Primarily for testing to allow re-initialization
   * @static
   * @memberof Config
   */

  public static resetInstance(): void {
    this.instance = null;
  }

  /**
   * Returns a concise summary of key configuration settings for logging/diagnostics.
   * @return {*}  {Record<string, unknown>} Snapshot of important config values.
   * @memberof Config
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
}

/**
 * Creates and returns the application configuration for the current runtime environment.
 *
 * Delegates to the underlying configuration provider (e.g., Config.getConfig) to resolve
 * values from environment variables, configuration files, or defaults.
 *
 * Use this helper at application startup to obtain a single configuration object that can
 * be shared across the application.
 *
 * @returns The resolved IConfig instance containing application settings.
 * @throws {Error} If configuration resolution fails or required values are missing.
 * @example
 * const config = createConfig();
 * // Use `config` throughout the application
 */

export function createConfig(): IConfig {
  return Config.getConfig();
}
