import { IAuthorizationCode, IAuthorizationCodeMetadata } from '@/interfaces';

/**
 * Represents an OAuth2 Authorization Code entity.
 *
 * This class encapsulates the logic for handling authorization codes, including validation,
 * expiration checks, usage tracking, and client/redirect URI verification.
 *
 * @implements {IAuthorizationCode}
 *
 * @property {string} code - The unique authorization code string, must start with 'AC_' and be at least 20 characters long.
 * @property {IAuthorizationCodeMetadata} metadata - Metadata associated with the authorization code, including client ID, redirect URI, expiration, and code challenge.
 * @property {Date} createAt - The timestamp when the authorization code was created.
 * @property {boolean} used - Indicates whether the authorization code has been used.
 *
 * @method isValid - Checks if the authorization code is valid (not used and not expired).
 * @method isExpired - Determines if the authorization code has expired based on its metadata.
 * @method markAsUsed - Marks the authorization code as used, throwing an error if already used or expired.
 * @method validateClientId - Validates that the provided client ID matches the one in the metadata.
 * @method validateRedirectUri - Validates that the provided redirect URI matches the one in the metadata.
 * @method getCodeChallenge - Retrieves the code challenge associated with the authorization code.
 * @method toObject - Serializes the entity to a plain object conforming to IAuthorizationCode.
 *
 * @throws {Error} If the code format is invalid, or if attempting to use an already used or expired code.
 * @example
 * const authCode = new AuthorizationEntity('AC_12345678901234567890', {
 *   clientId: 'client123',
 *   redirectUri: 'https://client.app/callback',
 *   expiresAt: new Date(Date.now() + 600000), // Expires in 10 minutes
 *   codeChallenge: 'challenge123',
 * });
 *
 * if (authCode.isValid()) {
 *   // Proceed with authorization
 * }
 *
 * authCode.markAsUsed();
 *
 * console.log(authCode.toObject());
 *
 * @memberof AuthorizationCodeEntity
 */

export class AuthorizationCodeEntity implements IAuthorizationCode {
  public used: boolean = false;
  public createAt: Date;

  /**
   * Creates an instance of AuthorizationCodeEntity.
   * @param {string} code The unique authorization code string.
   * @param {IAuthorizationCodeMetadata} metadata Metadata associated with the authorization code.
   * @throws {Error} If the code format is invalid.
   * @memberof AuthorizationCodeEntity
   */

  constructor(
    public readonly code: string,
    public readonly metadata: IAuthorizationCodeMetadata
  ) {
    this.createAt = new Date();
    this.validateFormat();
  }

  /**
   * Validates the format of the authorization code.
   *
   * @private
   * @memberof AuthorizationCodeEntity
   * @example
   * // Valid code
   * new AuthorizationCodeEntity('AC_12345678901234567890', { ... });
   *
   * // Invalid code examples
   * new AuthorizationCodeEntity('12345678901234567890', { ... }); // Throws error: must start with AC_
   * new AuthorizationCodeEntity('AC_12345', { ... }); // Throws error: too short
   */

  private validateFormat(): void {
    if (!this.code.startsWith('AC_')) throw new Error('Invalid authorization code format: must start with AC_');
    if (this.code.length < 20) throw new Error('Invalid authorization code format: too short');
  }

  /**
   * Checks if the authorization code is valid (not used and not expired).
   *
   * @return {*}  {boolean} True if the code is valid, false otherwise.
   * @memberof AuthorizationCodeEntity
   * @example
   * const authCode = new AuthorizationCodeEntity('AC_12345678901234567890', { ... });
   * if (authCode.isValid()) {
   *   // Proceed with authorization
   * }
   */

  public isValid(): boolean {
    return !this.used && !this.isExpired();
  }

  /**
   * Checks if the authorization code has expired.
   *
   * @return {*}  {boolean} True if the code has expired, false otherwise.
   * @memberof AuthorizationCodeEntity
   * @example
   * const authCode = new AuthorizationEntity('AC_12345678901234567890', { ... });
   * if (authCode.isExpired()) {
   *   // Handle expired code
   * }
   */

  public isExpired(): boolean {
    return new Date() > this.metadata.expiresAt;
  }

  /**
   * Marks the authorization code as used.	 *
   *
   * @memberof AuthorizationCodeEntity
   * @example
   * const authCode = new AuthorizationEntity('AC_12345678901234567890', { ... });
   * authCode.markAsUsed();
   * // Subsequent calls to markAsUsed() will throw an error
   * authCode.markAsUsed(); // Throws error: Authorization code already used
   * authCode.markAsUsed(); // Throws error: Cannot use expired authorization code (if expired)
   *
   * @throws {Error} If the code is already used or expired.
   */

  public markAsUsed(): void {
    if (this.used) throw new Error('Authorization code already used');
    if (this.isExpired()) throw new Error('Cannot use expired authorization code');
    this.used = true;
  }

  /**
   * Validates that the provided client ID matches the one in the metadata.
   *
   * @param {string} clientId The client ID to validate.
   * @return {*}  {boolean} True if the client ID matches, false otherwise.
   * @example
   * const authCode = new AuthorizationEntity('AC_12345678901234567890', { ... });
   * if (authCode.validateClientId('client123')) {
   *   // Client ID is valid
   * } else {
   *   // Invalid client ID
   * }
   * @memberof AuthorizationCodeEntity
   */

  public validateClientId(clientId: string): boolean {
    return this.metadata.clientId === clientId;
  }

  /**
   * Validates that the provided redirect URI matches the one in the metadata.
   *
   * @param {string} redirectUri The redirect URI to validate.
   * @return {*}  {boolean} True if the redirect URI matches, false otherwise.
   * @example
   * const authCode = new AuthorizationEntity('AC_12345678901234567890', { ... });
   * if (authCode.validateRedirectUri('https://client.app/callback')) {
   *   // Redirect URI is valid
   * } else {
   *   // Invalid redirect URI
   * }
   * @memberof AuthorizationCodeEntity
   */

  public validateRedirectUri(redirectUri: string): boolean {
    return this.metadata.redirectUri === redirectUri;
  }

  /**
   * Retrieves the code challenge associated with the authorization code.
   *
   * @return {*}  {string} The code challenge string.
   * @example
   * const authCode = new AuthorizationEntity('AC_12345678901234567890', { ... });
   * const challenge = authCode.getCodeChallenge();
   * console.log(challenge); // Outputs the code challenge
   * @memberof AuthorizationCodeEntity
   */

  public getCodeChallenge(): string {
    return this.metadata.codeChallenge;
  }

  /**
   * Serializes the entity to a plain object conforming to IAuthorizationCode.
   *
   * @return {*}  {IAuthorizationCode} The serialized authorization code object.
   * @example
   * const authCode = new AuthorizationEntity('AC_12345678901234567890', { ... });
   * console.log(authCode.toObject());
   * // Outputs:
   * // {
   * //   code: 'AC_12345678901234567890',
   * //   metadata: { ... },
   * //   createAt: Date,
   * //   used: false
   * // }
   * @memberof AuthorizationCodeEntity
   */

  public toObject(): IAuthorizationCode {
    return {
      code: this.code,
      metadata: this.metadata,
      createAt: this.createAt,
      used: this.used,
    };
  }
}
