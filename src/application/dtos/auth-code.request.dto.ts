import { OAuthValidationError } from '@shared';

/**
 * Represents the data required to request an OAuth2 authorization code.
 *
 * @property clientId - The client application's unique identifier.
 * @property redirectUri - The URI to redirect the user-agent to after authorization.
 * @property responseType - The type of response desired (typically "code" for authorization code flow).
 * @property codeChallenge - The PKCE code challenge derived from the code verifier.
 * @property codeChallengeMethod - The method used to generate the code challenge ('S256' or 'plain').
 * @property state - (Optional) An opaque value used to maintain state between the request and callback.
 * @property scope - (Optional) The scope of the access request, as a space-delimited string.
 */

interface AuthCodeRequestData {
	clientId: string;
	redirectUri: string;
	responseType: string;
	codeChallenge: string;
	codeChallengeMethod: 'S256' | 'plain';
	state?: string;
	scope?: string;
}

/**
 * Data Transfer Object (DTO) for handling OAuth2 Authorization Code requests.
 *
 * This class validates and encapsulates the parameters required for an OAuth2
 * authorization code flow, including PKCE support.
 *
 * @remarks
 * Use the static {@link AuthCodeRequestDTO.fromQuery} method to create an instance
 * from a query object, typically extracted from an HTTP request.
 *
 * @property clientId - The client application's identifier.
 * @property redirectUri - The URI to redirect to after authorization.
 * @property responseType - The response type, must be "code".
 * @property codeChallenge - The PKCE code challenge string.
 * @property codeChallengeMethod - The PKCE code challenge method, either "S256" or "plain".
 * @property state - (Optional) Opaque value to maintain state between request and callback.
 * @property scope - (Optional) Space-delimited list of requested scopes.
 *
 * @throws OAuthValidationError
 * Thrown if any required parameter is missing or invalid.
 */

export class AuthCodeRequestDTO {
	public readonly clientId!: string;
	public readonly redirectUri!: string;
	public readonly responseType!: string;
	public readonly codeChallenge!: string;
	public readonly codeChallengeMethod!: 'S256' | 'plain';
	public readonly state?: string;
	public readonly scope?: string;

	private constructor(data: AuthCodeRequestData) {
		Object.assign(this, data);
	}

	/**
	 * Creates an instance of `AuthCodeRequestDTO` from a query object.
	 *
	 * Validates the presence and format of required OAuth2 parameters:
	 * - `clientId`: Must be present and non-empty.
	 * - `redirectUri`: Must be present, non-empty, and a valid URL.
	 * - `responseType`: Must be present and equal to "code".
	 * - `codeChallenge`: Must be present, at least 43 characters, and base64url encoded.
	 * - `codeChallengeMethod`: Must be either "S256" or "plain".
	 * - `state`: Optional, but if present, must be less than 500 characters.
	 *
	 * Throws an `OAuthValidationError` if any validation fails.
	 *
	 * @param query - The query parameters as a record of string keys and values.
	 * @returns An instance of `AuthCodeRequestDTO` populated from the query.
	 * @throws {OAuthValidationError} If any required parameter is missing or invalid.
	 */

	public static fromQuery(query: Record<string, string>): AuthCodeRequestDTO {
		if (!query || Object.keys(query).length === 0) throw new OAuthValidationError('Missing required parameters');
		if (!query.client_id || query.client_id.trim().length === 0) throw new OAuthValidationError('Client ID is required');
		if (!query.redirect_uri || query.redirect_uri.trim().length === 0) throw new OAuthValidationError('Redirect URI is required');
		if (!query.response_type || query.response_type !== 'code') throw new OAuthValidationError('Response type must be "code');
		if (!query.code_challenge || query.code_challenge.trim().length === 0) throw new OAuthValidationError('Code Challenge is required');
		if (query.code_challenge.length < 43) throw new OAuthValidationError('Code Challenge must be at least 43 characters');
		if (!/^[A-Za-z0-9_-]+$/.test(query.code_challenge)) throw new OAuthValidationError('Code Challenge must be pure baseUrl encoded');
		if (!query.code_challenge_method) throw new OAuthValidationError('Code Challenge method is required');
		if (query.code_challenge_method !== 'S256' && query.code_challenge_method !== 'plain')
			throw new OAuthValidationError('Code Challenge method must be S256 or plain');

		if (!query.state && query.state.trim().length > 500) throw new OAuthValidationError('state must be less than 500 characters');

		try {
			new URL(query.redirect_uri);
		} catch {
			throw new OAuthValidationError('Redirect URI must be a valid URL');
		}

		return new AuthCodeRequestDTO({
			clientId: String(query.client_id || ''),
			redirectUri: String(query.redirect_uri || ''),
			responseType: String(query.response_type || ''),
			codeChallenge: String(query.code_challenge || ''),
			codeChallengeMethod: (query.code_challenge_method as 'S256' | 'plain') || 'S256',
			state: query.state ? String(query.state) : undefined,
			scope: query.scope ? String(query.scope) : undefined,
		});
	}
}
