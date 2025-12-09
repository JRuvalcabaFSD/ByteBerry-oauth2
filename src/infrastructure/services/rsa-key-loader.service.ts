import { IConfig } from '@interfaces';
import { ConfigError } from '@shared';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { IKeyLoader as IKeyLoaderService } from 'src/interfaces/services/rsa-key-loader.interface.js';

/**
 * Service responsible for loading and managing RSA key pairs used for JWT token signing and verification.
 *
 * This service implements a fallback mechanism to load RSA keys from multiple sources in the following priority order:
 * 1. Configuration object (`config.jwtPrivateKey`, `config.jwtPublicKey`, `config.jwtKeyId`)
 * 2. Environment variables (`JWT_PRIVATE_KEY`, `JWT_PUBLIC_KEY`, `JWT_KEY_ID`)
 * 3. File system (`keys/private.pem`, `keys/public.pem`)
 *
 * The service validates PEM format, handles escaped newline characters, and ensures proper key formatting.
 * If no valid keys are found through any of these sources, a `ConfigError` is thrown with helpful debugging information.
 *
 * @implements {IKeyLoaderService}
 *
 * @example
 * ```typescript
 * const keyLoader = new RsaKeyLoaderService(config);
 * const privateKey = keyLoader.getPrivateKey();
 * const publicKey = keyLoader.getPublicKey();
 * const keyId = keyLoader.getKeyId();
 * ```
 *
 * @throws {ConfigError} When JWT keys are not found or have invalid PEM format
 */

export class RsaKeyLoaderService implements IKeyLoaderService {
	public readonly privateKey: string;
	public readonly publicKey: string;
	public readonly keyId: string;

	/**
	 * Creates an instance of the RSA key loader service.
	 *
	 * Loads RSA public and private keys from multiple sources in the following priority order:
	 * 1. Configuration object (`config.jwtPrivateKey` and `config.jwtPublicKey`)
	 * 2. Environment variables (`JWT_PRIVATE_KEY` and `JWT_PUBLIC_KEY`)
	 * 3. PEM files in the `keys/` directory (`private.pem` and `public.pem`)
	 *
	 * The keys are validated and normalized to ensure proper PEM format.
	 * A key ID is also loaded from `config.jwtKeyId` or `JWT_KEY_ID` environment variable,
	 * defaulting to 'default-key-1' if not provided.
	 *
	 * @param config - The configuration object containing optional JWT keys and key ID
	 * @throws {ConfigError} When no valid RSA keys are found in any of the sources
	 *
	 * @remarks
	 * If keys are not found in environment variables or configuration, the service will
	 * look for `private.pem` and `public.pem` files in the `keys/` directory relative
	 * to the current working directory. If these files don't exist, a `ConfigError` is thrown
	 * with hints on how to generate the keys using `pnpm generate:keys`.
	 */

	constructor(private readonly config: IConfig) {
		const keysDir = join(process.cwd(), 'keys');
		const privatePath = join(keysDir, 'private.pem');
		const publicPath = join(keysDir, 'public.pem');

		const hasConfigKeys =
			typeof config.jwtPrivateKey === 'string' &&
			config.jwtPrivateKey.trim() !== '' &&
			typeof config.jwtPublicKey === 'string' &&
			config.jwtPublicKey.trim() !== '';

		let privateKey: string;
		let publicKey: string;
		let keyId: string;

		if (hasConfigKeys) {
			privateKey = this.validateAndFixPem(config.jwtPrivateKey!.trim(), 'PRIVATE KEY', 'jwtPrivateKey');
			publicKey = this.validateAndFixPem(config.jwtPublicKey!.trim(), 'PUBLIC KEY', 'jwtPublicKey');
			keyId = config.jwtKeyId?.trim() || 'default-key-1';
		} else {
			// Si no hay claves válidas en config, usa las de entorno
			const envPrivate = process.env.JWT_PRIVATE_KEY?.trim();
			const envPublic = process.env.JWT_PUBLIC_KEY?.trim();
			const envKeyId = process.env.JWT_KEY_ID?.trim() || 'default-key-1';
			if (envPrivate && envPublic) {
				privateKey = this.validateAndFixPem(envPrivate, 'PRIVATE KEY', 'JWT_PRIVATE_KEY');
				publicKey = this.validateAndFixPem(envPublic, 'PUBLIC KEY', 'JWT_PUBLIC_KEY');
				keyId = envKeyId;
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
				keyId = envKeyId;
			}
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
