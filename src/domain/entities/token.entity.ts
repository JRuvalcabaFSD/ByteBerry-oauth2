/**
 * Parameters for creating a Token entity.
 *
 * @interface TokenParams
 * @property {string} tokenId - Unique identifier for the token.
 * @property {string} userId - Identifier of the user associated with the token.
 * @property {string} clientId - Identifier of the client application that requested the token.
 * @property {Date} [issuedAt] - Optional timestamp when the token was issued. Defaults to current time if not provided.
 * @property {Date} expiresAt - Timestamp when the token expires and is no longer valid.
 * @property {string} [scope] - Optional space-delimited list of scopes granted by this token.
 */

interface TokenParams {
	tokenId: string;
	userId: string;
	clientId: string;
	issuedAt?: Date;
	expiresAt: Date;
	scope?: string;
}

/**
 * Represents an OAuth2 token entity with validation and lifecycle management capabilities.
 *
 * @remarks
 * This entity encapsulates token-related data and provides methods to manage token state,
 * including expiration checks, blacklist management, and overall validity verification.
 * Tokens are created through the static factory method and are immutable except for their blacklist status.
 *
 * @example
 * ```typescript
 * const token = TokenEntity.create({
 *   tokenId: 'token-123',
 *   userId: 'user-456',
 *   clientId: 'client-789',
 *   issuedAt: new Date(),
 *   expiresAt: new Date(Date.now() + 3600000), // 1 hour from now
 *   scope: 'read write'
 * });
 *
 * if (token.isValid()) {
 *   // Token can be used
 * }
 *
 * token.blacklist();
 * // Token is now invalid
 * ```
 */

export class TokenEntity {
	private blackListed: boolean = false;

	/**
	 * Creates an instance of Token entity.
	 * @private
	 * @param {string} tokenId - The unique identifier for the token
	 * @param {string} userId - The unique identifier for the user associated with the token
	 * @param {string} clientId - The unique identifier for the client application
	 * @param {Date} issuedAt - The date and time when the token was issued
	 * @param {Date} expiresAt - The date and time when the token will expire
	 * @param {string} [scope] - Optional scope defining the permissions granted by the token
	 */

	private constructor(
		public readonly tokenId: string,
		public readonly userId: string,
		public readonly clientId: string,
		public readonly issuedAt: Date,
		public readonly expiresAt: Date,
		public readonly scope?: string
	) {}

	/**
	 * Creates a new TokenEntity instance with the provided parameters.
	 *
	 * @param params - The parameters required to create a token entity
	 * @param params.tokenId - The unique identifier for the token
	 * @param params.userId - The identifier of the user associated with the token
	 * @param params.clientId - The identifier of the client application
	 * @param params.issuedAt - The timestamp when the token was issued (defaults to current date if not provided)
	 * @param params.expiresAt - The timestamp when the token expires
	 * @param params.scope - The scope/permissions associated with the token
	 * @returns A new TokenEntity instance
	 */

	static create(params: TokenParams): TokenEntity {
		return new TokenEntity(params.tokenId, params.userId, params.clientId, params.issuedAt || new Date(), params.expiresAt, params.scope);
	}

	/**
	 * Checks if the token has expired by comparing the current date with the expiration date.
	 *
	 * @returns `true` if the current date is past the expiration date, `false` otherwise.
	 */
	public isExpired(): boolean {
		return new Date() > this.expiresAt;
	}

	/**
	 * Checks if the token has been blacklisted.
	 *
	 * @returns {boolean} True if the token is blacklisted, false otherwise.
	 */
	public isBlackListed(): boolean {
		return this.blackListed;
	}

	/**
	 * Marks the token as blacklisted, preventing it from being used for authentication.
	 * Once a token is blacklisted, it should be considered invalid and rejected by the system.
	 *
	 * @returns {void}
	 */

	public blacklist(): void {
		this.blackListed = true;
	}

	/**
	 * Checks if the token is valid for use.
	 *
	 * A token is considered valid if it meets all of the following conditions:
	 * - The token has not expired
	 * - The token is not blacklisted
	 *
	 * @returns {boolean} `true` if the token is valid and can be used, `false` otherwise
	 */

	public isValid(): boolean {
		return !this.isExpired() && !this.blackListed;
	}
}
