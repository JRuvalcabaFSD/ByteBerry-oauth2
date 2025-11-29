/**
 * Represents an OAuth client entity with its associated properties and behaviors.
 *
 * This entity encapsulates the details of an OAuth client, such as its unique identifiers,
 * credentials, allowed redirect URIs, supported grant types, and metadata.
 * It provides factory creation and utility methods for validation.
 *
 * @remarks
 * Use the static {@link OAuthClientEntity.create} method to instantiate this entity.
 *
 * @example
 * ```typescript
 * const client = OAuthClientEntity.create({
 *   id: '1',
 *   clientId: 'my-client',
 *   clientSecret: 'secret',
 *   clientName: 'My Client',
 *   redirectUris: ['https://example.com/callback'],
 *   grantTypes: ['authorization_code'],
 * });
 * ```
 */

export class OAuthClientEntity {
  private constructor(
    public readonly id: string,
    public readonly clientId: string,
    public readonly clientSecret: string | null,
    public readonly clientName: string,
    public readonly redirectUris: string[],
    public readonly grantTypes: string[],
    public readonly isPublic: boolean,
    public readonly createdAt: Date
  ) {}

  /**
   * Creates a new instance of `OAuthClientEntity` using the provided parameters.
   *
   * @param params - The parameters required to create an OAuth client entity.
   * @param params.id - The unique identifier for the OAuth client entity.
   * @param params.clientId - The client ID associated with the OAuth client.
   * @param params.clientSecret - (Optional) The client secret for the OAuth client.
   * @param params.clientName - The display name of the OAuth client.
   * @param params.redirectUris - An array of allowed redirect URIs for the client.
   * @param params.grantTypes - An array of supported OAuth grant types for the client.
   * @param params.isPublic - (Optional) Indicates if the client is public. Defaults to `true` if not provided.
   * @param params.createdAt - (Optional) The creation date of the client entity. Defaults to the current date if not provided.
   * @returns A new `OAuthClientEntity` instance initialized with the provided parameters.
   */

  static create(params: {
    id: string;
    clientId: string;
    clientSecret?: string | null;
    clientName: string;
    redirectUris: string[];
    grantTypes: string[];
    isPublic?: boolean;
    createdAt?: Date;
  }): OAuthClientEntity {
    return new OAuthClientEntity(
      params.id,
      params.clientId,
      params.clientSecret || null,
      params.clientName,
      params.redirectUris,
      params.grantTypes,
      params.isPublic ?? true,
      params.createdAt || new Date()
    );
  }

  /**
   * Checks if the provided URI is included in the list of valid redirect URIs for this OAuth client.
   *
   * @param uri - The redirect URI to validate.
   * @returns `true` if the URI is a valid redirect URI, otherwise `false`.
   */

  public isValidRedirectUri(uri: string): boolean {
    return this.redirectUris.includes(uri);
  }

  /**
   * Determines whether the OAuth client supports a specific grant type.
   *
   * @param grandType - The grant type to check for support (e.g., "authorization_code", "client_credentials").
   * @returns `true` if the grant type is supported by the client; otherwise, `false`.
   */

  public supportsGrantType(grandType: string): boolean {
    return this.grantTypes.includes(grandType);
  }
}
