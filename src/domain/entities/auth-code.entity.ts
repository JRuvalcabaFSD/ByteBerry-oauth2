import { ClientIdVO, CodeChallengeVO } from '@domain';

/**
 * Parameters required to create an authorization code entity.
 *
 * @interface AuthCodeParams
 * @property {string} code - The authorization code value
 * @property {string} userId - The unique identifier of the user who authorized the request
 * @property {ClientIdVO} clientId - The client identifier value object
 * @property {string} redirectUri - The URI to redirect to after authorization
 * @property {CodeChallengeVO} codeChallenge - The code challenge value object for PKCE (Proof Key for Code Exchange)
 * @property {number | undefined} [expirationMinutes] - Optional number of minutes until the code expires
 * @property {string | undefined} [scope] - Optional scope of access requested by the client
 * @property {string | undefined} [state] - Optional opaque value used to maintain state between the request and callback
 */

interface AuthCodeParams {
	code: string;
	userId: string;
	clientId: ClientIdVO;
	redirectUri: string;
	codeChallenge: CodeChallengeVO;
	expirationMinutes?: number | undefined;
	scope?: string | undefined;
	state?: string | undefined;
}

/**
 * Represents an OAuth 2.0 authorization code entity that follows the PKCE (Proof Key for Code Exchange) flow.
 *
 * This entity encapsulates an authorization code issued to a client application during the OAuth 2.0
 * authorization code flow. It includes all necessary information to validate and exchange the code
 * for access tokens, including PKCE challenge verification.
 *
 * @remarks
 * - Authorization codes are single-use tokens that expire after a short period (default 5 minutes)
 * - The entity tracks whether the code has been used to prevent replay attacks
 * - Uses a private constructor to enforce creation through the static `create` method
 * - Implements PKCE by storing the code challenge for later verification
 *
 * @example
 * ```typescript
 * const authCode = AuthCodeEntity.create({
 *   code: 'abc123',
 *   userId: 'user-123',
 *   clientId: clientIdVO,
 *   redirectUri: 'https://example.com/callback',
 *   codeChallenge: codeChallengeVO,
 *   expirationMinutes: 10,
 *   scope: 'read write',
 *   state: 'random-state'
 * });
 *
 * if (!authCode.isUsed()) {
 *   authCode.markAsUsed();
 * }
 * ```
 */

export class AuthCodeEntity {
	private used: boolean = false;

	/**
	 * Private constructor for creating an AuthCode entity instance.
	 *
	 * @param code - The authorization code string
	 * @param userId - The unique identifier of the user who authorized the code
	 * @param clientId - The client identifier value object representing the OAuth2 client
	 * @param redirectUri - The URI where the client will be redirected after authorization
	 * @param codeChallenge - The PKCE code challenge value object for enhanced security
	 * @param expiresAt - The expiration date and time of the authorization code
	 * @param scope - Optional space-delimited list of scopes granted by the authorization
	 * @param state - Optional opaque value used to maintain state between the request and callback
	 */

	private constructor(
		public readonly code: string,
		public readonly userId: string,
		public readonly clientId: ClientIdVO,
		public readonly redirectUri: string,
		public readonly codeChallenge: CodeChallengeVO,
		public readonly expiresAt: Date,
		public readonly scope?: string | undefined,
		public readonly state?: string | undefined
	) {}

	/**
	 * Creates a new AuthCodeEntity instance with the provided parameters.
	 *
	 * @param params - The parameters required to create an authorization code entity
	 * @param params.code - The authorization code string
	 * @param params.userId - The ID of the user associated with this authorization code
	 * @param params.clientId - The ID of the client application requesting authorization
	 * @param params.redirectUri - The URI to redirect to after authorization
	 * @param params.codeChallenge - The PKCE code challenge for enhanced security
	 * @param params.expirationMinutes - Optional expiration time in minutes (defaults to 5 minutes)
	 * @param params.scope - The requested authorization scope
	 * @param params.state - The state parameter for CSRF protection
	 * @returns A new AuthCodeEntity instance with an expiration date set based on the provided or default expiration minutes
	 */

	static create(params: AuthCodeParams): AuthCodeEntity {
		const expiresAt = new Date();
		expiresAt.setMinutes(expiresAt.getMinutes() + (params.expirationMinutes || 1));

		return new AuthCodeEntity(
			params.code,
			params.userId,
			params.clientId,
			params.redirectUri,
			params.codeChallenge,
			expiresAt,
			params.scope,
			params.state
		);
	}

	/**
	 * Checks if the authorization code has been used.
	 *
	 * @returns {boolean} True if the authorization code has already been used, false otherwise.
	 */

	public isUsed(): boolean {
		return this.used;
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
	 * Marks the authorization code as used.
	 *
	 * @remarks
	 * Once an authorization code is marked as used, it should not be accepted again
	 * to prevent replay attacks. This is a security measure in OAuth2 flows.
	 *
	 * @returns void
	 */

	public markAsUsed(): void {
		this.used = true;
	}
}
