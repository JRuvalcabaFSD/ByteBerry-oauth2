import { ClientId, CodeChallenge } from '@/domain';

export class AuthorizationCodeEntity {
  private used: boolean = false;

  /**
   * Creates a new instance of the AuthorizationCode entity.
   *
   * @param code - The authorization code string.
   * @param clientId - The client identifier associated with the authorization code.
   * @param redirectUri - The redirect URI to which the response will be sent.
   * @param codeChallenge - The code challenge used for PKCE validation.
   * @param expiresAt - The expiration date and time of the authorization code.
   * @param scope - (Optional) The scope of the access request.
   * @param state - (Optional) The state parameter to maintain state between the request and callback.
   */

  private constructor(
    public readonly code: string,
    public readonly clientId: ClientId,
    public readonly redirectUri: string,
    public readonly codeChallenge: CodeChallenge,
    public readonly expiresAt: Date,
    public readonly scope?: string | undefined,
    public readonly state?: string | undefined
  ) {}

  /**
   * Creates a new AuthorizationCodeEntity instance with the provided parameters.
   *
   * @param params - The parameters for creating an authorization code
   * @param params.code - The authorization code string
   * @param params.clientId - The client identifier
   * @param params.redirectUri - The URI to redirect after authorization
   * @param params.codeChallenge - The code challenge for PKCE
   * @param params.expirationMinutes - Optional expiration time in minutes (defaults to 5)
   * @param params.scope - Optional scope string defining access permissions
   * @param params.state - Optional state parameter for CSRF protection
   * @returns A new AuthorizationCodeEntity instance with expiration set based on current time plus expiration minutes
   */

  static create(params: {
    code: string;
    clientId: ClientId;
    redirectUri: string;
    codeChallenge: CodeChallenge;
    expirationMinutes?: number | undefined;
    scope?: string | undefined;
    state?: string | undefined;
  }): AuthorizationCodeEntity {
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + (params.expirationMinutes || 5));

    return new AuthorizationCodeEntity(
      params.code,
      params.clientId,
      params.redirectUri,
      params.codeChallenge,
      expiresAt,
      params.scope,
      params.state
    );
  }

  /**
   * Checks if the authorization code has expired.
   *
   * @returns {boolean} True if the current date is past the expiration date, false otherwise.
   */

  public isExpired(): boolean {
    return new Date() > this.expiresAt;
  }

  /**
   * Checks if the authorization code has been used.
   *
   * @returns {boolean} True if the authorization code has been used, false otherwise.
   */

  public isUsed(): boolean {
    return this.used;
  }

  /**
   * Marks the authorization code as used.
   * Once marked as used, the authorization code should not be accepted for token exchange again.
   * This method sets the internal `used` flag to `true`.
   *
   * @returns {void}
   */

  public markAsUsed(): void {
    this.used = true;
  }
}
