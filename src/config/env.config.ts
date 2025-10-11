import dotenv from 'dotenv';
import { get } from 'env-var';
import pkg from '../../package.json';

import { IConfig, IJwtConfig, LogLevel, NodeEnv } from '@/interfaces';
import { ConfigError, JwtConfigurationError } from '@/shared';

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
  public readonly corsOrigins: string[];
  public readonly jwt: IJwtConfig;
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
      this.serviceName = get('SERVICE_NAME').default('byteberry-oauth2').required().asString();
      this.corsOrigins = get('CORS_ORIGINS').required().asArray();
      this.version = process.env.npm_package_version || pkg.version || '0.0.0';
      this.jwt = this.loadJwtConfig();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new ConfigError(`Failed to validate environment variables: ${errorMessage}`, {
        providedPort: process.env.PORT,
        providedNodeEnv: process.env.NODE_ENV,
        providedLogLevel: process.env.LOG_LEVEL,
        originalError: errorMessage,
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
   * Loads, validates, and normalizes JWT configuration from environment variables.
   *
   * Environment variables:
   * - JWT_PRIVATE_KEY (required): PEM-encoded private key.
   * - JWT_PUBLIC_KEY (required): PEM-encoded public key.
   * - JWT_ISSUER (optional): defaults to the current service name.
   * - JWT_AUDIENCE (optional): defaults to "byteberry-api".
   * - JWT_EXPIRES_IN (optional): token lifetime in seconds; defaults to 900.
   *
   * Validation:
   * - Ensures both keys appear to be PEM-formatted (contain the expected BEGIN/END headers).
   * - Keys are normalized via an internal formatter to ensure proper PEM structure before use.
   *
   * @returns IJwtConfig A fully validated and normalized JWT configuration, including keys, issuer, audience, and expiration.
   * @throws JwtConfigurationError If either JWT_PRIVATE_KEY or JWT_PUBLIC_KEY does not appear to be in PEM format.
   * @remarks Intended for internal configuration bootstrap; relies on process environment for values.
   */

  private loadJwtConfig(): IJwtConfig {
    const privateKey = get('JWT_PRIVATE_KEY').required().asString();
    const publicKey = get('JWT_PUBLIC_KEY').required().asString();
    const issuer = get('JWT_ISSUER').default(this.serviceName).asString();
    const audience = get('JWT_AUDIENCE').default('byteberry-api').asString();
    const expiresIn = get('JWT_EXPIRES_IN').default(900).asIntPositive();

    if (!privateKey.includes('BEGIN PRIVATE KEY') && !privateKey.includes('BEGIN RSA PRIVATE KEY')) {
      throw new JwtConfigurationError('JWT_PRIVATE_KEY must be in PEM format');
    }
    if (!publicKey.includes('BEGIN PUBLIC KEY') && !publicKey.includes('BEGIN RSA PUBLIC KEY')) {
      throw new JwtConfigurationError('JWT_PUBLIC_KEY must be in PEM format');
    }

    return {
      publicKey: this.formatPemKey(privateKey),
      privateKey: this.formatPemKey(privateKey),
      issuer,
      audience,
      expiresIn,
    };
  }

  /**
   * Formats a PEM key by replacing escaped newline characters with actual newlines.
   * This is commonly needed when PEM keys are stored in environment variables or
   * configuration files where newlines are escaped.
   *
   * @param key - The PEM key string with escaped newline characters (\\n)
   * @returns The formatted PEM key string with proper newline characters (\n)
   *
   * @example
   * ```typescript
   * const escapedKey = "-----BEGIN PRIVATE KEY-----\\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQC...\\n-----END PRIVATE KEY-----";
   * const formattedKey = formatPemKey(escapedKey);
   * // Returns: "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQC...\n-----END PRIVATE KEY-----"
   * ```
   */

  private formatPemKey(key: string) {
    return key.replace(/\\n/g, '\n');
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
 * @returns The resolved IConfig instance containing application settings.
 * @throws {ConfigError} If configuration resolution fails or required values are missing.
 * @example
 * import { createConfig } from './config/env.config';
 * const config = createConfig();
 * // Use `config` throughout the application
 */
export function createConfig(): IConfig {
  return Config.getConfig();
}
