/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Represents the payload structure of a JSON Web Token (JWT).
 *
 * @interface JwtPayload
 *
 * @property {string} sub - Subject identifier, typically the user ID
 * @property {string} iss - Issuer of the token, identifies who created and signed the token
 * @property {number} iat - Issued at timestamp, represents when the token was created (Unix timestamp)
 * @property {number} exp - Expiration timestamp, represents when the token expires (Unix timestamp)
 * @property {string} [email] - Optional email address associated with the token
 * @property {string[]} [roles] - Optional array of user roles or permissions
 * @property {any} [key: string] - Index signature allowing additional custom claims to be added to the payload
 *
 * @example
 * ```typescript
 * const payload: JwtPayload = {
 *   sub: '123456',
 *   iss: 'auth-service',
 *   iat: 1234567890,
 *   exp: 1234571490,
 *   email: 'user@example.com',
 *   roles: ['user', 'admin']
 * };
 * ```
 */

export interface JwtPayload {
  sub: string; // Subject (user_id)
  iss: string; // Issuer
  iat: number; // Issued at
  exp: number; // Expiration
  email?: string;
  roles?: string[];
  [key: string]: any;
}

/**
 * Interface for JWT (JSON Web Token) service operations.
 *
 * @remarks
 * This interface defines the contract for JWT token generation, verification,
 * and configuration retrieval. Implementations should handle token signing,
 * validation, and expiration time management.
 *
 * @example
 * ```typescript
 * class JwtService implements IJwtService {
 *   async sign(payload: JwtPayload): Promise<string> {
 *     // Implementation
 *   }
 *
 *   async verify(token: string): Promise<JwtPayload> {
 *     // Implementation
 *   }
 *
 *   getExpirationTime(): number {
 *     // Implementation
 *   }
 * }
 * ```
 */

export interface IJwtService {
  /**
   * Signs a JWT (JSON Web Token) with the given payload.
   *
   * @param {JwtPayload} payload - The payload to be included in the JWT.
   * @return {*}  {Promise<string>} - A promise that resolves to the signed JWT as a string.
   * @memberof IJwtService
   */

  sign(payload: JwtPayload): Promise<string>;

  /**
   * Verifies a JWT (JSON Web Token) and returns the decoded payload.
   *
   * @param {string} token - The JWT to be verified.
   * @return {*}  {Promise<JwtPayload>} - A promise that resolves to the decoded JWT payload.
   * @memberof IJwtService
   */

  verify(token: string): Promise<JwtPayload>;

  /**
   * Gets the expiration time for the JWT (JSON Web Token).
   *
   * @return {*}  {number} - The expiration time in seconds.
   * @memberof IJwtService
   */

  getExpirationTime(): number;
}
