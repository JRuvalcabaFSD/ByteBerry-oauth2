/**
 * Data Transfer Object for OAuth2 token requests.
 *
 * @remarks
 * This interface defines the structure for requesting an OAuth2 access token
 * using the authorization code grant type with PKCE (Proof Key for Code Exchange).
 *
 * @property grant_type - The OAuth2 grant type (e.g., "authorization_code")
 * @property code - The authorization code received from the authorization server
 * @property redirect_uri - The redirect URI used in the initial authorization request
 * @property client_id - The client identifier issued to the client during registration
 * @property code_verifier - The PKCE code verifier used to verify the code challenge
 */

export interface TokenRequestDto {
  grant_type: string;
  code: string;
  redirect_uri: string;
  client_id: string;
  code_verifier: string;
}

/**
 * Data Transfer Object representing an OAuth 2.0 token response.
 *
 * This interface defines the structure of a successful token response
 * as specified in RFC 6749 (OAuth 2.0 Authorization Framework).
 *
 * @interface TokenResponseDto
 *
 * @property {string} access_token - The access token issued by the authorization server.
 * @property {string} token_type - The type of token issued (e.g., "Bearer").
 * @property {number} expires_in - The lifetime in seconds of the access token.
 * @property {string} [scope] - The scope of the access token. Optional parameter that
 *                               indicates the scope of access granted by the token.
 *
 * @example
 * ```typescript
 * const tokenResponse: TokenResponseDto = {
 *   access_token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
 *   token_type: "Bearer",
 *   expires_in: 3600,
 *   scope: "read write"
 * };
 * ```
 */

export interface TokenResponseDto {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope?: string;
}
