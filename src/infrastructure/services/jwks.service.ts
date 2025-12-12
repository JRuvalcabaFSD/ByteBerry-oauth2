import { createPublicKey } from 'crypto';

import { IJwksService, JwkEntry, JwksResponse } from '@interfaces';
import { getErrMsg } from '@shared';

/**
 * Service for handling JSON Web Key Set (JWKS) operations.
 *
 * This service provides functionality to convert a PEM-encoded RSA public key to a JWK format,
 * cache the JWKS response, and validate the provided public key.
 *
 * @remarks
 * - The service expects a PEM-encoded RSA public key and a key ID (`kid`) upon instantiation.
 * - The JWKS response is cached after the first conversion to optimize repeated calls.
 *
 * @example
 * ```typescript
 * const jwksService = new JwksService(publicKey, keyId);
 * const jwks = await jwksService.getJwks();
 * ```
 *
 * @throws {Error} If the public key is missing, not PEM-encoded, or cannot be converted to JWK.
 */

export class JwksService implements IJwksService {
	private cachedJwks: JwksResponse | null = null;

	/**
	 * Creates an instance of the service with the provided public key and key ID.
	 * Validates the public key upon instantiation.
	 *
	 * @param publicKey - The public key used for JWT verification.
	 * @param keyId - The identifier for the key.
	 */

	constructor(
		public readonly publicKey: string,
		public readonly keyId: string
	) {
		this.validatePublicKey();
	}

	/**
	 * Retrieves the JSON Web Key Set (JWKS), utilizing a cached value if available.
	 * If the JWKS is not cached, it converts a PEM-formatted key to a JWK, caches it,
	 * and returns the JWKS containing the converted key.
	 *
	 * @returns {Promise<JwksResponse>} A promise that resolves to the JWKS response object.
	 */

	public async getJwks(): Promise<JwksResponse> {
		if (this.cachedJwks) return this.cachedJwks;

		const jwk = this.convertPemToJwk();

		this.cachedJwks = {
			keys: [jwk],
		};

		return this.cachedJwks;
	}

	/**
	 * Converts a PEM-encoded RSA public key to a JWK (JSON Web Key) entry.
	 *
	 * @returns {JwkEntry} The JWK representation of the RSA public key, including key type, key ID, usage, algorithm, modulus, and exponent.
	 * @throws {Error} If the PEM key is invalid or missing required RSA components, or if the conversion fails.
	 */

	public convertPemToJwk(): JwkEntry {
		try {
			const keyObject = createPublicKey({
				key: this.publicKey,
				format: 'pem',
				type: 'spki',
			});

			const jwk = keyObject.export({ format: 'jwk' });
			if (!jwk.n || !jwk.e) throw new Error('Invalid RSA public key - missing components');
			return {
				kty: 'RSA',
				kid: this.keyId,
				use: 'sig',
				alg: 'RS256',
				n: jwk.n,
				e: jwk.e,
			};
		} catch (error) {
			throw new Error(`Failed to convert PEM to JWK: ${getErrMsg(error)}`);
		}
	}

	/**
	 * Validates the presence and format of the public key.
	 *
	 * Throws an error if the public key is missing, empty, or not in PEM encoded format.
	 *
	 * @throws {Error} If the public key is not provided or is not PEM encoded.
	 */

	private validatePublicKey(): void {
		if (!this.publicKey || this.publicKey.trim().length === 0) throw new Error('Public key is required');

		if (!this.publicKey.includes('BEGIN PUBLIC KEY')) throw new Error('Invalid public key format - must be PEM encoded');
	}
}
