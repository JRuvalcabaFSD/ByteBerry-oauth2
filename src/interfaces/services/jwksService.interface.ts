/**
 * Represents a single JSON Web Key (JWK) entry for RSA signature verification.
 *
 * @property kty The key type, fixed as 'RSA'.
 * @property kid The unique identifier for the key.
 * @property use The intended use of the key, fixed as 'sig' (signature).
 * @property alg The algorithm used with the key, fixed as 'RS256'.
 * @property n The modulus value for the RSA public key, encoded as a base64url string.
 * @property e The exponent value for the RSA public key, encoded as a base64url string.
 */

export interface JwkEntry {
  kty: 'RSA';
  kid: string;
  use: 'sig';
  alg: 'RS256';
  n: string;
  e: string;
}

/**
 * Represents the response structure for a JWKS (JSON Web Key Set) endpoint.
 * Contains an array of JWK entries.
 *
 * @see {@link JwkEntry}
 */

export interface JwksResponse {
  keys: JwkEntry[];
}

/**
 * Interface for a service that retrieves JSON Web Key Sets (JWKS).
 *
 * @remarks
 * Implementations of this interface are responsible for fetching and providing JWKS,
 * which are typically used for verifying JWT signatures.
 *
 * @method getJwks
 * Returns a promise that resolves to a {@link JwksResponse} containing the JWKS.
 */

export interface IJwksService {
  /**
   * Retrieves the JSON Web Key Set (JWKS).
   *
   * @return {*}  {Promise<JwksResponse>} A promise that resolves to the JWKS response.
   * @memberof IJwksService
   */

  getJwks(): Promise<JwksResponse>;
}
