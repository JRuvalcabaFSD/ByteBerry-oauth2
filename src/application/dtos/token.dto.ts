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
