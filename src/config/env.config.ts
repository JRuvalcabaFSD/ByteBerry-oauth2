import dotenv from 'dotenv';
import { get } from 'env-var';
import { version } from '../../package.json';

import { IConfig, LogLevel, NodeEnv } from '@/interfaces';
import { ConfigError, getErrMsg } from '@/shared';

//TODO documentar
export class Config implements IConfig {
  //Core config
  public readonly nodeEnv: NodeEnv;
  public readonly port: number;
  public readonly logLevel: LogLevel;
  public readonly serviceName: string;
  public readonly corsOrigins: string[];
  public readonly version: string;

  //Jwt config
  public readonly jwtPrivateKey: string | undefined;
  public readonly jwtPublicKey: string | undefined;
  public readonly jwtKeyId: string;
  public readonly jwtAudience: string[];
  public readonly oauth2Issuer: string;
  public readonly tokenExpiresIn: number;

  private static instance: Config | null = null;

  private constructor() {
    try {
      dotenv.config({ override: false });

      //Core config
      this.nodeEnv = get('NODE_ENV').default('development').asEnum(['development', 'production', 'test']) as NodeEnv;
      this.port = get('PORT').default(4000).asPortNumber();
      this.logLevel = this.verifyLogLevel();
      this.serviceName = get('SERVICE_NAME').default('ByteBerry-OAuth2').asString();
      this.corsOrigins = this.normalizeUrls(
        get('CORS_ORIGINS').default('http://localhost:5173,http://localhost:4002,http://localhost:4003').asArray()
      );
      this.version = version;

      //Jwt config
      this.jwtPrivateKey = this.validateJWtPrivateKey();
      this.jwtPublicKey = this.validateJWtPublicKey();
      this.jwtKeyId = get('JWT_KEY_ID').default('default-key-1').asString();
      this.jwtAudience = get('JWT_AUDIENCE').default('byteberry-expenses,byteberry-bff').asArray();
      this.oauth2Issuer = get('OAUTH2_ISSUER').default('byteberry-oauth2').asString();
      this.tokenExpiresIn = get('TOKEN_EXPIRES_IN').default(900).asIntPositive();
    } catch (error) {
      const errMsg = getErrMsg(error);
      throw new ConfigError(`Failed to validate environment variables: ${errMsg}`, {
        providedPort: process.env.PORT,
        providedNodeEnv: process.env.NODE_ENV,
        providedLogLevel: process.env.LOG_LEVEL,
        providedJwtKeyId: process.env.JWT_KEY_ID,
        providedJwtAudience: process.env.JWT_AUDIENCE,
        providedOAuth2Issuer: process.env.OAUTH2_ISSUER,
        providedTokenExpiresIn: process.env.TOKEN_EXPIRES_IN,
        originalError: errMsg,
      });
    }
  }

  /**
   * Determines if the current environment is set to 'development'.
   *
   * @returns {boolean} `true` if the environment is 'development', otherwise `false`.
   */

  public isDevelopment(): boolean {
    return this.nodeEnv === 'development';
  }

  /**
   * Determines if the current environment is set to production.
   *
   * @returns `true` if the `nodeEnv` property equals `'production'`, otherwise `false`.
   */

  public isProduction(): boolean {
    return this.nodeEnv === 'production';
  }

  /**
   * Determines if the current environment is set to 'test'.
   *
   * @returns {boolean} `true` if the environment is 'test', otherwise `false`.
   */

  public isTest(): boolean {
    return this.nodeEnv === 'test';
  }

  /**
   * Returns a summary of the current environment configuration.
   * Sensitive data such as JWT keys are excluded from the summary; instead, boolean flags indicate their presence.
   *
   * @returns {Record<string, unknown>} An object containing environment details such as node environment, port, log level, service name, CORS origins, version, JWT configuration, OAuth2 issuer, token expiration, and environment flags.
   */

  public getSummary(): Record<string, unknown> {
    return {
      nodeEnv: this.nodeEnv,
      port: this.port,
      logLevel: this.logLevel,
      serviceName: this.serviceName,
      corsOrigins: this.corsOrigins,
      version: this.version,
      jwtKeyId: this.jwtKeyId,
      jwtAudience: this.jwtAudience,
      oauth2Issuer: this.oauth2Issuer,
      tokenExpiresIn: this.tokenExpiresIn,
      isDevelopment: this.isDevelopment(),
      isProduction: this.isProduction(),
      isTest: this.isTest(),
      // Sensitive data excluded from summary
      hasJwtPrivateKey: !!this.jwtPrivateKey,
      hasJwtPublicKey: !!this.jwtPublicKey,
    };
  }

  /**
   * Verifies and returns the appropriate log level for the application.
   *
   * Throws a `ConfigError` if the environment is production and the log level is set to "debug",
   * as this configuration is not allowed.
   *
   * @returns {LogLevel} The validated log level, defaulting to "info" if not specified.
   * @throws {ConfigError} If the log level is "debug" in production environment.
   */

  private verifyLogLevel(): LogLevel {
    if (this.nodeEnv === 'production' && process.env.LOG_LEVEL === 'debug')
      throw new ConfigError('Cannot assign the log level as "debug" when in production', {
        providedNodeEnv: process.env.NODE_ENV,
        providedLogLevel: process.env.LOG_LEVEL,
      });

    return get('LOG_LEVEL').default('info').asEnum(['debug', 'info', 'warn', 'error']);
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
    const privateKey = get('JWT_PRIVATE_KEY').asString();

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
    const publicKey = get('JWT_PUBLIC_KEY').asString();

    if (!publicKey) return undefined;
    if (!publicKey.includes('BEGIN PUBLIC KEY'))
      throw new ConfigError('JWT_PUBLIC_KEY must be in PEM format with proper headers', {
        hasPrivateKey: !!publicKey,
        keyFormat: 'Invalid - missing PEM headers',
      });

    return publicKey.replace(/\\n/g, '\n');
  }

  /**
   * Normalizes one or more URLs by ensuring consistent protocol and hostname casing,
   * removing trailing slashes (except for root path), and trimming whitespace.
   * If an invalid URL is encountered, it is returned unchanged and a warning is logged.
   *
   * @typeParam T - Either a single URL string or an array of URL strings.
   * @param input - The URL or array of URLs to normalize.
   * @returns The normalized URL(s), preserving the input type (string or string[]).
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
   * Resets the singleton instance of the class to `null`.
   * This method is typically used for testing or reinitialization purposes,
   * allowing the instance to be recreated on the next access.
   */

  public static resetInstance(): void {
    this.instance = null;
  }

  /**
   * Returns the singleton instance of the {@link Config} class.
   * If the instance does not exist, it creates a new one.
   *
   * @returns {Config} The singleton configuration instance.
   */

  public static getConfig(): Config {
    if (!this.instance) this.instance = new Config();
    return this.instance;
  }
}

/**
 * Retrieves the current configuration by delegating to `Config.getConfig()`.
 *
 * @returns The configuration object as returned by `Config.getConfig()`.
 */

export const createConfig = () => Config.getConfig();
