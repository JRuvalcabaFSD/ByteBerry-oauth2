/**
 * Represents a JSON Web Key (JWK) entry for RSA keys used in signature verification.
 *
 * @interface JwkEntry
 * @property { 'RSA' } kty - The key type, which is 'RSA' for this entry.
 * @property { string } kid - The key ID, a unique identifier for the key.
 * @property { 'sig' } use - The intended use of the key, which is for signature verification.
 * @property { 'RS256' } alg - The algorithm used with the key, which is 'RS256' for RSA signatures.
 * @property { string } n - The modulus of the RSA key, encoded in Base64 URL format.
 * @property { string } e - The exponent of the RSA key, encoded in Base64 URL format.
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
 * Contains an array of JWK entities.
 *
 * @see {@link JwkEntry}
 */

export interface JwksResponse {
	keys: JwkEntry[];
}

/**
 * Interface representing a service for retrieving JSON Web Key Sets (JWKS).
 *
 * @remarks
 * Implementations of this interface should provide a method to asynchronously fetch JWKS data,
 * typically used for verifying JWT signatures.
 *
 * @method getJwks
 * Retrieves the JWKS response.
 * @returns A promise that resolves to a {@link JwksResponse}.
 */

export interface IJwksService {
	getJwks(): Promise<JwksResponse>;
}
