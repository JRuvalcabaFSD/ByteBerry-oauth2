/**
 * Data Transfer Object for validating OAuth2 client requests.
 *
 * @property clientId - The unique identifier of the client application.
 * @property redirectUri - (Optional) The URI to which the response will be sent after authorization.
 * @property grandType - (Optional) The type of grant being requested (commonly 'grantType').
 */

export interface ValidateClientRequestDto {
  clientId: string;
  redirectUri?: string;
  grandType?: string;
}

/**
 * Represents the response data for validating an OAuth2 client.
 *
 * @property clientId - The unique identifier of the client.
 * @property clientName - The display name of the client.
 * @property isPublic - Indicates whether the client is public (does not require a client secret).
 * @property redirectUris - A list of allowed redirect URIs for the client.
 * @property grandTypes - The grant types supported by the client.
 */

export interface ValidateClientResponseDto {
  clientId: string;
  clientName: string;
  isPublic: boolean;
  redirectUris: string[];
  grandTypes: string[];
}
