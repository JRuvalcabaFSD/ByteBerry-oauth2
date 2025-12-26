import { join } from 'path';
import { existsSync, readFileSync } from 'fs';

import { IConfig, IKeyLoader } from '@interfaces';
import { ConfigError } from '@shared';

/**
 * Service responsible for loading and formatting RSA keys used for JWT operations.
 *
 * The `KeyLoader` class attempts to load RSA private and public keys from either environment variables
 * or from PEM files located in a `keys` directory at the project root. If neither source is available,
 * it throws a `ConfigError` with guidance for resolving the issue.
 *
 * Keys are normalized and validated to ensure correct PEM formatting. The class exposes methods to
 * retrieve the loaded private key, public key, and key ID.
 *
 * @implements {IKeyLoader}
 *
 * @constructor
 * @param {IConfig} config - The configuration object containing key values or file paths.
 *
 * @property {string} publicKey - The loaded and formatted RSA public key.
 * @property {string} privateKey - The loaded and formatted RSA private key.
 * @property {string} keyId - The identifier for the key, defaults to 'default-key-1' if not provided.
 *
 * @throws {ConfigError} If neither environment variables nor PEM files are found for the keys, or if the PEM format is invalid.
 */

export class KeyLoader implements IKeyLoader {
	public readonly publicKey: string;
	public readonly privateKey: string;
	public readonly keyId: string;

	constructor(private readonly config: IConfig) {
		const { privateKey, publicKey, keyId } = this.loadKeys();
		this.privateKey = this.formatPem(privateKey, 'PRIVATE KEY');
		this.publicKey = this.formatPem(publicKey, 'PUBLIC KEY');
		this.keyId = keyId || 'default-key-1';
	}

	/**
	 * Retrieves the loaded private key as a string.
	 *
	 * @returns {string} The private key.
	 */

	public getPrivateKey(): string {
		return this.privateKey;
	}

	/**
	 * Retrieves the loaded public key as a string.
	 *
	 * @returns {string} The public key.
	 */

	public getPublicKey(): string {
		return this.publicKey;
	}

	/**
	 * Retrieves the identifier of the current key.
	 *
	 * @returns {string} The unique identifier associated with the key.
	 */

	public getKeyId(): string {
		return this.keyId;
	}

	/**
	 * Loads RSA key pairs for JWT operations from either environment configuration or local files.
	 *
	 * @returns An object containing the private key, public key, and an optional key ID.
	 *
	 * @throws {ConfigError} If neither environment variables nor key files are found.
	 *
	 * @remarks
	 * The method first checks if `jwtPrivateKey` and `jwtPublicKey` are set in the configuration.
	 * If not, it attempts to load `private.pem` and `public.pem` from the `keys` directory in the current working directory.
	 * If neither source is available, it throws a `ConfigError` with guidance on how to provide the keys.
	 */

	private loadKeys(): { privateKey: string; publicKey: string; keyId?: string } {
		if (this.config.jwtPrivateKey && this.config.jwtPublicKey) {
			return {
				privateKey: this.config.jwtPrivateKey,
				publicKey: this.config.jwtPublicKey,
				keyId: this.config.jwtKeyId?.trim(),
			};
		}

		const keysDir = join(process.cwd(), 'keys');
		const privatePath = join(keysDir, 'private.pem');
		const publicPath = join(keysDir, 'public.pem');

		if (existsSync(privatePath) && existsSync(publicPath)) {
			return {
				privateKey: readFileSync(privatePath, 'utf-8'),
				publicKey: readFileSync(publicPath, 'utf-8'),
				keyId: this.config.jwtKeyId?.trim(),
			};
		}

		throw new ConfigError('No se encontraron claves RSA para JWT', {
			hint: 'Opciones válidas:\n' + '1. Define JWT_PRIVATE_KEY y JWT_PUBLIC_KEY en .env\n' + '2. Genera las claves con: pnpm generate:keys',
		});
	}

	/**
	 * Formats and validates a PEM-encoded key string.
	 *
	 * This method normalizes the input key by trimming whitespace and replacing escaped
	 * newline characters with actual newlines. It then checks if the key contains the
	 * appropriate PEM header and footer for the specified key type ('PRIVATE KEY' or 'PUBLIC KEY').
	 * If the format is invalid, it throws a {@link ConfigError} with a helpful hint.
	 *
	 * @param key - The PEM-encoded key string to format and validate.
	 * @param type - The type of key, either 'PRIVATE KEY' or 'PUBLIC KEY'.
	 * @returns The normalized PEM string if valid.
	 * @throws {ConfigError} If the PEM format is invalid for the specified key type.
	 */

	private formatPem(key: string, type: 'PRIVATE KEY' | 'PUBLIC KEY'): string {
		const normalized = key.trim().replace(/\\n/g, '\n');

		if (!normalized.includes(`BEGIN ${type}`) || !normalized.includes(`END ${type}`)) {
			throw new ConfigError(`Formato PEM inválido para ${type.toLowerCase()}`, {
				hint: 'Asegúrate de que la clave incluya -----BEGIN/END ${type}-----',
			});
		}

		return normalized;
	}
}
