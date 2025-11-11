import { join } from 'path';
import { existsSync, readFileSync } from 'fs';

import { IKeyProvider } from '@/interfaces';
import { ConfigError } from '@/shared';

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
   * Initializes the key provider by loading JWT keys from either environment variables or local files.
   *
   * - If `JWT_PRIVATE_KEY` and `JWT_PUBLIC_KEY` environment variables are set, uses those values after validating and normalizing them.
   * - Otherwise, attempts to load keys from `keys/private.pem` and `keys/public.pem` files in the project root.
   * - Throws a `ConfigError` if neither source is available, providing hints for resolution.
   *
   * @throws {ConfigError} If JWT keys are not found in environment variables or the keys directory.
   */

  constructor() {
    const keysDir = join(process.cwd(), 'keys');
    const privatePath = join(keysDir, 'private.pem');
    const publicPath = join(keysDir, 'public.pem');

    let privateKey = process.env.JWT_PRIVATE_KEY?.trim();
    let publicKey = process.env.JWT_PUBLIC_KEY?.trim();
    const keyId = process.env.JWT_KEY_ID?.trim() || 'default-key-1';

    const fromEnv = !!privateKey && !!publicKey;

    if (fromEnv) {
      privateKey = this.validateAndFixPem(privateKey!, 'PRIVATE KEY', 'JWT_PRIVATE_KEY');
      publicKey = this.validateAndFixPem(publicKey!, 'PUBLIC KEY', 'JWT_PUBLIC_KEY');
    } else {
      if (!existsSync(privatePath) || !existsSync(publicPath)) {
        throw new ConfigError('JWT keys not found in environment variables nor in keys/ folder', {
          envPrivate: !!process.env.JWT_PRIVATE_KEY,
          envPublic: !!process.env.JWT_PUBLIC_KEY,
          filesExist: {
            private: existsSync(privatePath),
            public: existsSync(publicPath),
          },
          hint: 'Run: pnpm generate:keys  or set JWT_PRIVATE_KEY / JWT_PUBLIC_KEY in .env',
        });
      }
      const privateFile = readFileSync(privatePath, 'utf-8');
      const publicFile = readFileSync(publicPath, 'utf-8');

      privateKey = this.normalizePem(privateFile, 'PRIVATE KEY', privatePath);
      publicKey = this.normalizePem(publicFile, 'PUBLIC KEY', publicPath);
    }

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
   * Validates that the provided PEM key contains the correct header for the specified type,
   * and replaces escaped newline characters (`\n`) with actual newline characters.
   *
   * @param key - The PEM key string to validate and fix.
   * @param type - The type of PEM key, either `'PRIVATE KEY'` or `'PUBLIC KEY'`.
   * @param source - The source identifier used for error reporting.
   * @returns The fixed PEM key string with proper newlines.
   * @throws {ConfigError} If the PEM key does not contain the required header for the specified type.
   */

  private validateAndFixPem(key: string, type: 'PRIVATE KEY' | 'PUBLIC KEY', source: string): string {
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

  private normalizePem(content: string, type: 'PRIVATE KEY' | 'PUBLIC KEY', path: string): string {
    const trimmed = content.trim();
    if (!trimmed.includes(`BEGIN ${type}`) || !trimmed.includes(`END ${type}`)) {
      throw new ConfigError(`Invalid PEM format in ${path}`, { path });
    }
    return trimmed;
  }
}

/**
 * Creates and returns a new instance of `EnvKeyProvider`.
 *
 * @returns {EnvKeyProvider} An instance of the environment-based key provider.
 *
 * @remarks
 * This factory function is used to instantiate the key provider that retrieves keys from environment variables.
 */

export const createKeyProvider = () => new EnvKeyProvider();
