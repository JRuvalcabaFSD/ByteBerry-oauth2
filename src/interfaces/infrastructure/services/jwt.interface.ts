/**
 * Represents the payload of a JSON Web Token (JWT) used for authentication and authorization.
 *
 * Encapsulates identity, client context, granted permissions, and standard JWT claims
 * required to validate and authorize requests across services.
 *
 * @public
 *
 * @property sub - Subject identifier for the token, typically the unique user ID.
 * @property clientId - Identifier of the client application that requested the token.
 * @property scope - List of granted scopes (permissions), e.g., ["read:users", "write:orders"].
 * @property iat - Issued-at time as a UNIX timestamp in seconds.
 * @property exp - Expiration time as a UNIX timestamp in seconds.
 * @property iss - Issuer identifier (URI/URL) of the authorization server that issued the token.
 * @property aud - Intended audience (resource or service identifier) for which the token is issued.
 *
 * @remarks
 * - Time-based claims follow RFC 7519 and are expressed in seconds since the UNIX epoch.
 * - The `scope` claim should reflect the effective permissions granted to the subject for the given client.
 *
 * @see https://datatracker.ietf.org/doc/html/rfc7519
 * @see https://openid.net/specs/openid-connect-core-1_0.html#IDToken
 */

export interface IJwtPayload {
  sub: string; //Subject (user ID)
  client_id: string; //Client ID that requested the token
  scope: string[]; //Token scopes
  iat: number; //Issued at timestamp
  exp: number; //Expiration timestamp
  iss: string; //Issuer
  aud: string; //Audience
}

/**
 * Options for generating a JSON Web Token (JWT).
 *
 * @remarks
 * These options define the core claims and metadata used to issue a signed token.
 * The issuer typically derives standard claims (e.g., iat, exp) from these values.
 *
 * @property subject - Unique identifier of the token subject (the "sub" claim).
 * @property clientId - Identifier of the client application requesting the token.
 * @property scope - Array of granted scopes (permissions) to embed in the token.
 * @property expiresIn - Optional token lifetime in seconds, relative to the time of issuance.
 *
 * @example
 * // Generate a token that expires in 15 minutes with two scopes
 * const options: IJwtGenerateOption = {
 *   subject: "user-123",
 *   clientId: "web-app",
 *   scope: ["read:users", "write:users"],
 *   expiresIn: 60 * 15
 * };
 */

export interface IJwtGenerateOption {
  subject: string;
  clientId: string;
  scope: string[];
  expiresIn?: number;
}

/**
 * Result of verifying a JSON Web Token (JWT).
 *
 * Provides the verification outcome, the decoded claims, and an optional
 * error message when verification fails.
 *
 * @property valid - True if the token passed all verification checks (e.g., signature, expiration, audience).
 * @property payload - The decoded JWT payload (claims). Present regardless of validity; only trust its contents when `valid` is true.
 * @property error - Optional human-readable reason for failure (e.g., "expired", "invalid signature").
 *
 * @example
 * ```ts
 * const result = await jwtService.verify(token);
 * if (result.valid) {
 *   // Safe to use claims
 *   console.log(result.payload.sub);
 * } else {
 *   console.error('JWT verification failed:', result.error);
 * }
 * ```
 */

export interface IJwtVerifyResult {
  valid: boolean;
  payload?: IJwtPayload;
  error?: string;
}

/**
 * Defines the contract for issuing, verifying, and decoding JSON Web Tokens (JWT).
 *
 * @remarks
 * Methods:
 * - generateToken(options): Signs and returns a compact JWT string.
 *   - options: {@link IJwtGenerateOption} used to build and sign the token (e.g., payload, subject, expiration).
 *   - returns: Promise<string> resolving to the serialized JWT.
 * - verifyToken(token): Validates the token’s signature and claims against the service configuration.
 *   - token: The serialized JWT to verify.
 *   - returns: Promise<{@link IJwtVerifyResult}> describing validity and decoded claims.
 * - decodeToken(token): Decodes a token without verifying its signature.
 *   - token: The serialized JWT to decode.
 *   - returns: {@link IJwtPayload} if decoding succeeds; otherwise null.
 *
 * Security notes:
 * - Use verifyToken for security decisions; decodeToken is for non-trusted inspection only.
 *
 * Implementation notes:
 * - Implementations should be stateless and thread-safe.
 * - Methods may reject or return null on malformed input, expired/invalid tokens, or misconfiguration.
 *
 * @public
 */

export interface IJwtService {
  generateToken(options: IJwtGenerateOption): Promise<string>;
  verifyToken(token: string): Promise<IJwtVerifyResult>;
  decodeToken(token: string): IJwtPayload | null;
}

/**
 * Configuration interface for JWT (JSON Web Token) operations.
 *
 * This interface defines the required configuration parameters for creating,
 * signing, and verifying JWT tokens in the application.
 *
 * @interface IJwtConfig
 * @example
 * ```typescript
 * const jwtConfig: IJwtConfig = {
 *   privateKey: 'your-private-key',
 *   publicKey: 'your-public-key',
 *   issuer: 'your-app-name',
 *   audience: 'your-app-users',
 *   expiresIn: 3600
 * };
 * ```
 */

export interface IJwtConfig {
  privateKey: string;
  publicKey: string;
  issuer: string;
  audience: string;
  expiresIn: number;
}
