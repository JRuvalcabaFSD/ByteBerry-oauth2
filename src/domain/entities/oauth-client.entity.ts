/**
 * Parameters for creating an OAuth client entity.
 *
 * @interface OAuthClientParams
 * @property {string} id - Unique identifier for the OAuth client
 * @property {string} clientId - Public client identifier used in OAuth flows
 * @property {string | null} [clientSecret] - Secret key for confidential clients (optional, null for public clients)
 * @property {string} clientName - Human-readable name of the client application
 * @property {string[]} redirectUris - List of allowed redirect URIs for OAuth callbacks
 * @property {string[]} grandTypes - Supported OAuth 2.0 grant types (e.g., 'authorization_code', 'client_credentials')
 * @property {boolean} [isPublic] - Flag indicating whether the client is public (true) or confidential (false)
 * @property {Date} [createdAt] - Timestamp when the client was created
 */

/** @internal */
/** @ignore */
interface OAuthClientParams {
	id: string;
	clientId: string;
	clientSecret?: string | null;
	clientName: string;
	redirectUris: string[];
	grandTypes: string[];
	isPublic?: boolean;
	createdAt?: Date;
}

/**
 * Represents an OAuth 2.0 client entity with its authentication and authorization details.
 *
 * This entity encapsulates all the necessary information for an OAuth client, including
 * client credentials, allowed redirect URIs, and supported grant types.
 *
 * @remarks
 * The constructor is private to enforce the use of the static factory method `create()`.
 * This ensures proper initialization and validation of the entity.
 *
 * @example
 * ```typescript
 * const client = OAuthClientEntity.create({
 *   id: '123',
 *   clientId: 'my-client-id',
 *   clientSecret: 'secret',
 *   clientName: 'My Application',
 *   redirectUris: ['https://example.com/callback'],
 *   grandTypes: ['authorization_code', 'refresh_token'],
 *   isPublic: false,
 *   createdAt: new Date()
 * });
 * ```
 */

export class OAuthClientEntity {
	/**
	 * Creates an instance of OAuthClient entity.
	 * @private
	 * @param {string} id - The unique identifier of the OAuth client.
	 * @param {string} clientId - The client identifier used for OAuth authentication.
	 * @param {string | null} clientSecret - The client secret for confidential clients, or null for public clients.
	 * @param {string} clientName - The human-readable name of the OAuth client.
	 * @param {string[]} redirectUris - Array of allowed redirect URIs for OAuth flows.
	 * @param {string[]} grandTypes - Array of allowed OAuth grant types (e.g., 'authorization_code', 'refresh_token').
	 * @param {boolean} isPublic - Flag indicating whether this is a public client (true) or confidential client (false).
	 * @param {Date} createdAt - The timestamp when the OAuth client was created.
	 */

	private constructor(
		public readonly id: string,
		public readonly clientId: string,
		public readonly clientSecret: string | null,
		public readonly clientName: string,
		public readonly redirectUris: string[],
		public readonly grandTypes: string[],
		public readonly isPublic: boolean,
		public readonly createdAt: Date
	) {}

	/**
	 * Creates a new instance of OAuthClientEntity with the provided parameters.
	 *
	 * @param params - The parameters required to create an OAuth client
	 * @param params.id - The unique identifier for the OAuth client
	 * @param params.clientId - The client ID used for OAuth authentication
	 * @param params.clientSecret - Optional client secret for confidential clients
	 * @param params.clientName - The display name of the OAuth client
	 * @param params.redirectUris - Array of allowed redirect URIs for the client
	 * @param params.grandTypes - Array of OAuth grant types supported by the client
	 * @param params.isPublic - Optional flag indicating if the client is public (defaults to true)
	 * @param params.createdAt - Optional creation timestamp (defaults to current date)
	 * @returns A new OAuthClientEntity instance
	 */

	public static create(params: OAuthClientParams) {
		return new OAuthClientEntity(
			params.id,
			params.clientId,
			params.clientSecret || null,
			params.clientName,
			params.redirectUris,
			params.grandTypes,
			params.isPublic ?? true,
			params.createdAt || new Date()
		);
	}

	/**
	 * Validates if the provided URI is included in the list of authorized redirect URIs for this OAuth client.
	 *
	 * @param uri - The redirect URI to validate
	 * @returns `true` if the URI is in the list of authorized redirect URIs, `false` otherwise
	 *
	 * @remarks
	 * This method performs an exact string match against the registered redirect URIs.
	 * It's commonly used during OAuth 2.0 authorization flow to prevent redirect URI manipulation attacks.
	 */

	public isValidRedirectUri(uri: string): boolean {
		return this.redirectUris.includes(uri);
	}

	/**
	 * Checks if the OAuth client supports a specific grant type.
	 *
	 * @param grandType - The grant type to check for support (e.g., 'authorization_code', 'client_credentials')
	 * @returns `true` if the grant type is supported by this client, `false` otherwise
	 */

	public supportGrandTypes(grandType: string): boolean {
		return this.grandTypes.includes(grandType);
	}
}
