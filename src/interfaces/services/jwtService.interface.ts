/**
 * Represents the payload of a JWT (JSON Web Token).
 *
 * @property sub - Subject identifier for the JWT (usually a user ID).
 * @property iat - Issued At timestamp (seconds since epoch).
 * @property exp - Expiration timestamp (seconds since epoch).
 * @property iss - Issuer of the JWT.
 * @property aud - Audience(s) that the JWT is intended for.
 * @property scope - Scope of access granted by the JWT.
 * @property client_id - Identifier for the client application.
 */

export interface IJwtPayload {
  sub: string;
  iat: number;
  exp: number;
  iss: string;
  aud?: string | string[] | undefined;
  scope?: string | undefined;
  client_id?: string | undefined;
}

/**
 * Interface for JWT (JSON Web Token) service operations.
 *
 * Provides methods to generate, verify, and decode JWT tokens.
 */

export interface IJwtService {
  /**
   * Generates an access token (JWT) based on the provided payload.
   *
   * @param {({ sub: string; audience: string | string[]; scope?: string | undefined; client_id?: string | undefined })} payload - The payload to include in the JWT.
   * @return {*}  {string} - The generated JWT as a string.
   * @memberof IJwtService
   */

  generateAccessToken(
    payload: { sub: string; scope?: string | undefined; client_id?: string | undefined },
    expiresIn?: number | undefined
  ): string;

  /**
   * Verifies the provided JWT token and returns its payload.
   *
   * @param {string} token - The JWT token to verify.
   * @return {*}  {IJwtPayload} - The payload contained in the verified JWT.
   * @memberof IJwtService
   */

  verifyToken(token: string, expectedAudience?: string): IJwtPayload;

  /**
   * Decodes the provided JWT token without verifying its signature.
   *
   * @param {string} token - The JWT token to decode.
   * @return {*}  {(IJwtPayload | null)} - The decoded payload, or null if decoding fails.
   * @memberof IJwtService
   */

  decodeToken(token: string): IJwtPayload | null;
}
