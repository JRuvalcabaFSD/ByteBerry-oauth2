/**
 * Represents the data returned in a token response.
 *
 * @property accessToken - The OAuth2 access token string.
 * @property expiresIn - The number of seconds until the access token expires.
 * @property scope - The scope(s) associated with the access token.
 */
interface TokenResponseData {
	accessToken: string;
	expiresIn: number;
	scope: string;
}

/**
 * Represents the response DTO for an OAuth2 token request.
 *
 * @remarks
 * This class encapsulates the token response data, including the access token,
 * token type, expiration time, and scope. It provides a method to serialize
 * the response to a JSON-compatible format.
 *
 * @example
 * ```typescript
 * const dto = new TokenResponseDTO({
 *   accessToken: 'abc123',
 *   expiresIn: 3600,
 *   scope: 'read write'
 * });
 * const json = dto.toJson();
 * ```
 *
 * @param data - The token response data used to initialize the DTO.
 */
export class TokenResponseDTO {
	private readonly accessToken!: string;
	private readonly tokenType = 'Bearer';
	private readonly expiresIn!: number;
	private readonly scope!: string;

	constructor(data: TokenResponseData) {
		Object.assign(this, data);
	}

	/**
	 * Converts the token response DTO to a JSON object suitable for API responses.
	 *
	 * @returns An object containing the access token, token type, expiration time in seconds, and scope.
	 */

	public toJson(): {
		access_token: string;
		token_type: 'Bearer';
		expires_in: number;
		scope: string;
	} {
		return {
			access_token: this.accessToken,
			token_type: this.tokenType,
			expires_in: this.expiresIn,
			scope: this.scope,
		};
	}
}
