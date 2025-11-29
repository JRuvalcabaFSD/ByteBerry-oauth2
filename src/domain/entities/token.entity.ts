/**
 * Represents an OAuth2 token entity with information about its owner, client, validity, and status.
 *
 * @remarks
 * This entity encapsulates the properties and behaviors of an issued token, including its expiration,
 * blacklisting status, and associated metadata such as scope. It provides methods to check if the token
 * is expired, blacklisted, or valid, and to blacklist the token.
 *
 * @example
 * ```typescript
 * const token = TokenEntity.create({
 *   tokenId: 'abc123',
 *   userId: 'user1',
 *   clientId: 'clientA',
 *   expiresAt: new Date(Date.now() + 3600 * 1000)
 * });
 *
 * if (token.isValid()) {
 *   // Token can be used
 * }
 * ```
 */

export class TokenEntity {
  private blackListed: boolean = false;

  private constructor(
    public readonly tokenId: string,
    public readonly userId: string,
    public readonly clientId: string,
    public readonly issuedAt: Date,
    public readonly expiresAt: Date,
    public readonly scope?: string
  ) {}

  /**
   * Creates a new instance of `TokenEntity` with the provided parameters.
   *
   * @param params - The parameters required to create a token entity.
   * @param params.tokenId - The unique identifier for the token.
   * @param params.userId - The identifier of the user associated with the token.
   * @param params.clientId - The identifier of the client application.
   * @param params.issuedAt - (Optional) The date and time when the token was issued. Defaults to the current date and time if not provided.
   * @param params.expiresAt - The date and time when the token expires.
   * @param params.scope - (Optional) The scope of the token.
   * @returns A new `TokenEntity` instance initialized with the provided parameters.
   */

  static create(params: {
    tokenId: string;
    userId: string;
    clientId: string;
    issuedAt?: Date;
    expiresAt: Date;
    scope?: string;
  }): TokenEntity {
    return new TokenEntity(params.tokenId, params.userId, params.clientId, params.issuedAt || new Date(), params.expiresAt, params.scope);
  }

  /**
   * Determines whether the token has expired.
   *
   * @returns {boolean} `true` if the current date and time is after the token's expiration date; otherwise, `false`.
   */

  public isExpired(): boolean {
    return new Date() > this.expiresAt;
  }

  /**
   * Determines whether the token has been blacklisted.
   *
   * @returns {boolean} `true` if the token is blacklisted; otherwise, `false`.
   */

  public isBlacklisted(): boolean {
    return this.blackListed;
  }

  /**
   * Marks the token as blacklisted, preventing its further use.
   *
   * This method sets the `blackListed` property to `true`, indicating that
   * the token is no longer valid for authentication or authorization purposes.
   */

  public blacklist(): void {
    this.blackListed = true;
  }

  /**
   * Determines whether the token is valid.
   *
   * A token is considered valid if it is neither expired nor blacklisted.
   *
   * @returns {boolean} `true` if the token is valid; otherwise, `false`.
   */

  public isValid(): boolean {
    return !this.isExpired() && !this.isBlacklisted();
  }
}
