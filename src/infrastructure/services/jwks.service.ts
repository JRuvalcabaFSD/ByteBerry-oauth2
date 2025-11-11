import * as crypto from 'crypto';

import { IJwksService, JwkEntry, JwksResponse } from '@/interfaces';
import { getErrMsg } from '@/shared';

/**
 * Service for managing JSON Web Key Sets (JWKS) derived from a PEM-encoded RSA public key.
 *
 * This service validates the provided public key, converts it to JWK format, and caches the result for efficient retrieval.
 *
 * @remarks
 * - Only PEM-encoded RSA public keys are supported.
 * - The JWK is generated using Node.js crypto APIs and includes the necessary components for JWT signature verification.
 *
 * @example
 * ```typescript
 * const jwksService = new JwksService(publicKey, keyId);
 * const jwks = await jwksService.getJwks();
 * ```
 *
 * @param publicKey - The PEM-encoded RSA public key.
 * @param keyId - The identifier for the key, used as the `kid` in the JWK.
 *
 * @throws Error if the public key is missing, incorrectly formatted, or cannot be converted to JWK.
 */

export class JwksService implements IJwksService {
  private cachedJwks: JwksResponse | null = null;

  /**
   * Initializes a new instance of the service with the provided public key and key ID.
   * Validates the public key upon construction.
   *
   * @param publicKey - The public key used for cryptographic operations.
   * @param keyId - The identifier for the key.
   */

  constructor(
    private readonly publicKey: string,
    private readonly keyId: string
  ) {
    this.validatePublicKey();
  }

  /**
   * Retrieves the JSON Web Key Set (JWKS) used for token verification.
   * If the JWKS is already cached, returns the cached value.
   * Otherwise, converts the PEM key to a JWK, caches it, and returns the JWKS.
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

  /**
   * Converts a PEM-formatted RSA public key to a JWK (JSON Web Key) entry.
   *
   * This method creates a public key object from the provided PEM string,
   * exports it in JWK format, and constructs a JWK entry with the required
   * RSA components. Throws an error if the key is invalid or conversion fails.
   *
   * @returns {JwkEntry} The JWK representation of the RSA public key.
   * @throws {Error} If the PEM cannot be converted to a valid JWK.
   */

  private convertPemToJwk(): JwkEntry {
    try {
      const keyObject = crypto.createPublicKey({
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
}
