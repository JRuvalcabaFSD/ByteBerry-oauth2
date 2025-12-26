/**
 * Data Transfer Object representing an OAuth2 authorization code response.
 *
 * @remarks
 * This DTO encapsulates the authorization code and optional state parameter
 * returned as part of the OAuth2 authorization code flow.
 *
 * @example
 * ```typescript
 * const response = new AuthCodeResponseDTO('abc123', 'xyz');
 * const redirectUrl = response.buildRedirectUrl('https://client.app/callback');
 * ```
 *
 * @param code - The authorization code issued by the authorization server.
 * @param state - (Optional) The state parameter to maintain state between the request and callback.
 */

export class AuthCodeResponseDTO {
	constructor(
		public readonly code: string,
		public readonly state?: string
	) {}

	/**
	 * Builds a redirect URL by appending the authorization code and optional state as query parameters.
	 *
	 * @param baseRedirectUri - The base URI to which the query parameters will be appended.
	 * @returns The constructed redirect URL containing the `code` and, if present, the `state` parameters.
	 */

	public buildRedirectUrl(baseRedirectUri: string): string {
		const url = new URL(baseRedirectUri);
		url.searchParams.set('code', this.code);

		if (this.state) {
			url.searchParams.set('state', this.state);
		}

		return url.toString();
	}

	/**
	 * Converts the current instance to a plain JSON object containing the authorization code
	 * and, if available, the state parameter.
	 *
	 * @returns An object with the `code` property and optionally the `state` property if it exists.
	 */

	public toJSON(): { code: string; state?: string } {
		return {
			code: this.code,
			...(this.state && { state: this.state }),
		};
	}
}
