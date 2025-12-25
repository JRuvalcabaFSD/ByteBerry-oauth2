/**
 * Represents the data structure for an OAuth client entity.
 *
 * @property id - Unique identifier for the OAuth client.
 * @property clientId - The client identifier issued to the client during the registration process.
 * @property clientSecret - (Optional) The client secret. May be null for public clients.
 * @property clientName - The human-readable name of the client.
 * @property redirectUris - List of allowed redirect URIs for the client.
 * @property grantTypes - List of OAuth 2.0 grant types supported by the client.
 * @property isPublic - Indicates whether the client is public (does not require a secret).
 * @property createdAt - The date and time when the client was created.
 */

interface OAuthClientData {
	id: string;
	clientId: string;
	clientSecret?: string | null;
	clientName: string;
	redirectUris: string[];
	grantTypes: string[];
	isPublic: boolean;
	createdAt: Date;
}

/**
 * Parameters for creating or updating an OAuth client entity.
 *
 * Extends all properties from `OAuthClientData` except for `isPublic` and `createdAt`,
 * which are redefined here as optional. This allows for flexibility when constructing
 * or modifying OAuth client instances, particularly when these fields may not be
 * initially available or required.
 *
 * @property {boolean} [isPublic] - Indicates if the OAuth client is public. Optional.
 * @property {Date} [createdAt] - The creation date of the OAuth client. Optional.
 */

interface OAuthClientParams extends Omit<OAuthClientData, 'isPublic' | 'createdAt'> {
	isPublic?: boolean;
	createdAt?: Date;
}

/**
 * Represents an OAuth 2.0 client entity with its configuration and metadata.
 *
 * @remarks
 * This entity encapsulates the essential properties and behaviors of an OAuth client,
 * including its credentials, allowed redirect URIs, supported grant types, and creation timestamp.
 * It provides factory methods for instantiation and utility methods for validating redirect URIs
 * and supported grant types.
 *
 * @property id - Unique identifier for the OAuth client entity.
 * @property clientId - Public identifier for the OAuth client.
 * @property clientSecret - Secret used for client authentication (nullable for public clients).
 * @property clientName - Human-readable name of the client.
 * @property redirectUris - List of allowed redirect URIs for the client.
 * @property grantTypes - List of OAuth 2.0 grant types supported by the client.
 * @property isPublic - Indicates if the client is public (does not require a secret).
 * @property createdAt - Timestamp of when the client was created.
 *
 * @method create - Factory method to instantiate a new OAuthClientEntity.
 * @method isValidRedirectUri - Checks if a given URI is a valid redirect URI for the client.
 * @method supportsGrandType - Checks if a given grant type is supported by the client.
 */

export class OAuthClientEntity {
	public readonly id!: string;
	public readonly clientId!: string;
	public readonly clientSecret?: string | null;
	public readonly clientName!: string;
	public readonly redirectUris!: string[];
	public readonly grantTypes!: string[];
	public readonly isPublic!: boolean;
	public readonly createdAt!: Date;

	private constructor(data: OAuthClientParams) {
		Object.assign(this, data);
	}

	/**
	 * Creates a new instance of `OAuthClientEntity` using the provided parameters.
	 *
	 * @param params - The data required to create an OAuth client entity.
	 *   - If `clientSecret` is not provided, it defaults to `null`.
	 *   - If `isPublic` is not provided, it defaults to `true`.
	 *   - If `createdAt` is not provided, it defaults to the current date and time.
	 * @returns A new `OAuthClientEntity` instance initialized with the given parameters.
	 */

	public static create(params: OAuthClientParams): OAuthClientEntity {
		return new OAuthClientEntity({
			...params,
			clientSecret: params.clientSecret || null,
			isPublic: params.isPublic ?? true,
			createdAt: params.createdAt || new Date(),
		});
	}

	/**
	 * Checks if the provided URI is included in the list of valid redirect URIs for this OAuth client.
	 *
	 * @param uri - The redirect URI to validate.
	 * @returns `true` if the URI is a valid redirect URI for this client; otherwise, `false`.
	 */

	public isValidRedirectUri(uri: string): boolean {
		return this.redirectUris.includes(uri);
	}

	/**
	 * Determines whether the OAuth client supports the specified grant type.
	 *
	 * @param grandType - The grant type to check for support (e.g., "authorization_code", "client_credentials").
	 * @returns `true` if the grant type is supported by the client; otherwise, `false`.
	 */

	public supportsGrandType(grandType: string): boolean {
		return this.grantTypes.includes(grandType);
	}
}
