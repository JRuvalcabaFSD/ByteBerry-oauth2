import { ClientId, CodeChallenge } from '@/domain';

/**
 * Represents an OAuth2 Authorization Code entity, encapsulating the code value,
 * client information, redirect URI, PKCE code challenge, expiration, scope, and state.
 *
 * This entity is used in the OAuth2 authorization code flow to securely exchange
 * authorization codes for access tokens. It enforces immutability for core properties
 * and tracks usage and expiration to prevent replay attacks.
 *
 * Instances should be created via the static {@link AuthorizationCodeEntity.create} method
 * to ensure proper validation and encapsulation.
 *
 * @remarks
 * - The authorization code can only be used once; subsequent attempts are rejected.
 * - Expiration is enforced based on the issued timestamp and configurable duration.
 * - Supports PKCE via code challenge for enhanced security.
 * - Optional scope and state parameters allow for granular access control and CSRF protection.
 *
 * @example
 * typescript
 * const authCode = AuthorizationCodeEntity.create({
 *   code: 'auth_code_123',
 *   clientId: new ClientId('client_123'),
 *   redirectUri: 'https://example.com/callback',
 *   codeChallenge: new CodeChallenge('challenge_xyz'),
 *   expirationMinutes: 10,
 *   scope: 'read write',
 *   state: 'xyz_state'
 * });
 *
 * console.log(authCode.getCode()); // 'auth_code_123'
 * console.log(authCode.isExpired()); // false
 */

export class AuthorizationCodeEntity {
  private used: boolean = false;

  /**
   * Private constructor for creating an AuthorizationCode entity.
   *
   * @param code - The unique authorization code string
   * @param clientId - The client identifier associated with this authorization code
   * @param redirectUri - The URI to redirect to after authorization
   * @param codeChallenge - The PKCE code challenge for secure authorization
   * @param expiresAt - The expiration timestamp for this authorization code
   * @param scope - Optional scope string defining the access permissions
   * @param state - Optional state parameter for maintaining state between request and callback
   *
   * @remarks
   * This constructor is private to enforce creation through factory methods or static methods,
   * ensuring proper validation and encapsulation of the authorization code creation process.
   */

  private constructor(
    private readonly code: string,
    private readonly clientId: ClientId,
    private readonly redirectUri: string,
    private readonly codeChallenge: CodeChallenge,
    private readonly expiresAt: Date,
    private readonly scope?: string | undefined,
    private readonly state?: string | undefined
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

  /**
   * Returns the code challenge associated with this authorization code.
   *
   * @returns {CodeChallenge} The code challenge object.
   */

  public getCodeChallenge(): CodeChallenge {
    return this.codeChallenge;
  }

  /**
   * Retrieves the authorization code value.
   *
   * @returns The authorization code string.
   */

  public getCode(): string {
    return this.code;
  }

  /**
   * Retrieves the client identifier associated with this authorization code.
   *
   * @returns The ClientId object representing the unique identifier of the OAuth2 client.
   */

  public getClientId(): ClientId {
    return this.clientId;
  }

  /**
   * Retrieves the redirect URI associated with this authorization code.
   *
   * @returns The redirect URI as a string where the client will be redirected after authorization.
   */

  public getRedirectUri(): string {
    return this.redirectUri;
  }

  /**
   * Retrieves the scope associated with this authorization code.
   *
   * @returns The scope string if defined, otherwise undefined.
   */

  public getScope(): string | undefined {
    return this.scope;
  }

  /**
   * Gets the state parameter associated with this authorization code.
   *
   * The state parameter is an opaque value used by the client to maintain
   * state between the request and callback, typically used for CSRF protection.
   *
   * @returns The state value if present, undefined otherwise.
   */

  public getState(): string | undefined {
    return this.state;
  }
}
