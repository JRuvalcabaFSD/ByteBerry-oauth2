/* eslint-disable @typescript-eslint/no-explicit-any */
import { join } from 'path';
import { promises as fs } from 'fs';

import { IKeyProvider, ILogger } from '@/interfaces';
import { ConfigError, withLoggerContext } from '@/shared';

/**
 * Provides JWT key management by loading private and public keys from environment variables or local files.
 *
 * - If environment variables `JWT_PRIVATE_KEY` and `JWT_PUBLIC_KEY` are set, uses those values.
 * - Otherwise, attempts to read PEM files from the `keys/` directory in the project root.
 * - Validates and normalizes PEM formats for both sources.
 * - Throws a `ConfigError` if keys are missing or invalid.
 *
 * @example
 * const provider = await EnvKeyProvider.create(logger);
 * const privateKey = provider.getPrivateKey();
 * const publicKey = provider.getPublicKey();
 * const keyId = provider.getKeyId();
 *
 * @remarks
 * Use `pnpm generate:keys` to generate key files if not present, or set the required environment variables.
 */

export class EnvKeyProvider implements IKeyProvider {
  private readonly privateKey: string;
  private readonly publicKey: string;
  private readonly keyId: string;

  /**
   * Creates an instance of the class with the provided private key, public key, and key ID.
   *
   * @param privateKey - The private key used for cryptographic operations.
   * @param publicKey - The public key associated with the private key.
   * @param keyId - A unique identifier for the key pair.
   */

  private constructor(privateKey: string, publicKey: string, keyId: string) {
    this.privateKey = privateKey;
    this.publicKey = publicKey;
    this.keyId = keyId;
  }

  /**
   * Retrieves the stored private key as a string.
   *
   * @returns {string} The private key.
   */

  public getPrivateKey(): string {
    return this.privateKey;
  }

  /**
   * Returns the public key as a string.
   *
   * @returns {string} The public key.
   */

  public getPublicKey(): string {
    return this.publicKey;
  }

  /**
   * Returns the identifier of the key.
   *
   * @returns {string} The key's unique identifier.
   */

  public getKeyId(): string {
    return this.keyId;
  }

  /**
   * Creates an instance of `EnvKeyProvider` by loading JWT keys from environment variables or from files.
   *
   * The method first attempts to read the private and public keys from the environment variables
   * `JWT_PRIVATE_KEY` and `JWT_PUBLIC_KEY`. If both are present, it validates and normalizes them.
   * If not, it tries to read the keys from the `keys/private.pem` and `keys/public.pem` files in the
   * current working directory. If neither source is available, it throws a `ConfigError` with details
   * about the missing keys and a hint for resolution.
   *
   * @param logger - An `ILogger` instance used for logging context and debug information.
   * @returns A promise that resolves to an `EnvKeyProvider` instance containing the loaded keys and key ID.
   * @throws {ConfigError} If neither environment variables nor key files are found.
   */

  public static async create(logger: ILogger): Promise<EnvKeyProvider> {
    const ctxLogger = withLoggerContext(logger, 'EnvKeyProvider.create');
    const keysDir = join(process.cwd(), 'keys');
    const privatePath = join(keysDir, 'private.pem');
    const publicPath = join(keysDir, 'public.pem');

    let privateKey = process.env.JWT_PRIVATE_KEY?.trim();
    let publicKey = process.env.JWT_PUBLIC_KEY?.trim();
    const keyId = process.env.JWT_KEY_ID?.trim() || 'default-key-1';

    const fromEnv = !!privateKey && !!publicKey;

    if (fromEnv) {
      privateKey = EnvKeyProvider.validateAndFixPem(privateKey!, 'PRIVATE KEY', 'JWT_PRIVATE_KEY');
      publicKey = EnvKeyProvider.validateAndFixPem(publicKey!, 'PUBLIC KEY', 'JWT_PUBLIC_KEY');
    } else {
      try {
        ctxLogger.warn('JWT keys not found in .env, reading from files...');
        const [privateFile, publicFile] = await Promise.all([fs.readFile(privatePath, 'utf-8'), fs.readFile(publicPath, 'utf-8')]);

        privateKey = EnvKeyProvider.normalizePem(privateFile, 'PRIVATE KEY', privatePath);
        publicKey = EnvKeyProvider.normalizePem(publicFile, 'PUBLIC KEY', publicPath);

        ctxLogger.debug(`Keys loaded from files:\n   ${privatePath}\n   ${publicPath}`);
      } catch (err: any) {
        throw new ConfigError('JWT keys not found in environment variables nor in keys/ folder', {
          envPrivate: !!process.env.JWT_PRIVATE_KEY,
          envPublic: !!process.env.JWT_PUBLIC_KEY,
          filesExist: {
            private: err.code !== 'ENOENT' || err.path !== privatePath ? false : await EnvKeyProvider.fileExists(privatePath),
            public: await EnvKeyProvider.fileExists(publicPath),
          },
          hint: 'Run: pnpm generate:keys  or set JWT_PRIVATE_KEY / JWT_PUBLIC_KEY in .env',
        });
      }
    }

    return new EnvKeyProvider(privateKey, publicKey, keyId);
  }

  /**
   * Validates that the provided PEM key contains the correct header for the specified type,
   * and replaces escaped newline characters (`\n`) with actual newline characters.
   *
   * @param key - The PEM key string to validate and fix.
   * @param type - The type of PEM key, either `'PRIVATE KEY'` or `'PUBLIC KEY'`.
   * @param source - The source identifier used for error reporting.
   * @returns The fixed PEM key string with proper newlines.
   * @throws {ConfigError} If the PEM key does not contain the required header for the specified type.
   */

  private static validateAndFixPem(key: string, type: 'PRIVATE KEY' | 'PUBLIC KEY', source: string): string {
    if (!key.includes('BEGIN') || !key.includes(type)) {
      throw new ConfigError(`${source} must contain PEM header`, { source });
    }
    return key.replace(/\\n/g, '\n');
  }

  /**
   * Normalizes a PEM-formatted key string by trimming whitespace and validating its format.
   *
   * Checks that the provided content includes the correct `BEGIN` and `END` markers for the specified key type.
   * Throws a `ConfigError` if the PEM format is invalid.
   *
   * @param content - The PEM-formatted key string to normalize.
   * @param type - The type of key, either `'PRIVATE KEY'` or `'PUBLIC KEY'`.
   * @param path - The file path associated with the key, used for error reporting.
   * @returns The trimmed and validated PEM string.
   * @throws {ConfigError} If the PEM format is invalid.
   */

  private static normalizePem(content: string, type: 'PRIVATE KEY' | 'PUBLIC KEY', path: string): string {
    const trimmed = content.trim();
    if (!trimmed.includes(`BEGIN ${type}`) || !trimmed.includes(`END ${type}`)) {
      throw new ConfigError(`Invalid PEM format in ${path}`, { path });
    }
    return trimmed;
  }

  /**
   * Checks asynchronously whether a file exists at the specified path.
   *
   * @param path - The path to the file to check.
   * @returns A promise that resolves to `true` if the file exists, or `false` otherwise.
   */

  private static async fileExists(path: string): Promise<boolean> {
    try {
      await fs.access(path);
      return true;
    } catch {
      return false;
    }
  }
}
