import { InvalidOAuthRequestError } from '@shared';

/**
 * Represents the data required to request an OAuth2 token.
 *
 * @property grantType - The type of grant being requested (e.g., "authorization_code").
 * @property code - The authorization code received from the authorization server.
 * @property redirectUri - The URI to redirect to after authorization.
 * @property clientId - The client identifier issued to the application.
 * @property codeVerifier - The code verifier used for PKCE validation.
 */

interface TokenRequestData {
	grantType: string;
	code: string;
	redirectUri: string;
	clientId: string;
	codeVerifier: string;
}

/**
 * Data Transfer Object representing a token request in the OAuth2 authorization code flow.
 *
 * @remarks
 * This DTO validates and encapsulates the required parameters for exchanging an authorization code for an access token.
 *
 * @property grantType - The OAuth2 grant type (must be 'authorization_code').
 * @property code - The authorization code received from the authorization server.
 * @property redirectUri - The redirect URI used in the authorization request.
 * @property clientId - The client identifier issued to the client during registration.
 * @property codeVerifier - The PKCE code verifier used to mitigate authorization code interception attacks.
 *
 * @method fromBody - Creates a {@link TokenRequestDTO} instance from a request body, validating required parameters.
 *
 * @throws InvalidOAuthRequestError - If any required parameter is missing or invalid.
 */

export class TokenRequestDTO {
	public readonly grantType!: string;
	public readonly code!: string;
	public readonly redirectUri!: string;
	public readonly clientId!: string;
	public readonly codeVerifier!: string;

	private constructor(data: TokenRequestData) {
		Object.assign(this, data);
	}

	/**
	 * Creates a new instance of `TokenRequestDTO` from a request body object.
	 *
	 * Validates the presence and correctness of required OAuth2 parameters:
	 * - `client_id`: must be present.
	 * - `code`: must be present.
	 * - `code_verifier`: must be present.
	 * - `grant_type`: must be `'authorization_code'`.
	 * - `redirect_uri`: must be a valid URL.
	 *
	 * @param body - The request body containing OAuth2 parameters as key-value pairs.
	 * @throws {InvalidOAuthRequestError} If any required parameter is missing or invalid.
	 * @returns {TokenRequestDTO} The constructed DTO with validated parameters.
	 */

	public static fromBody(body: Record<string, string>): TokenRequestDTO {
		if (!body || Object.keys(body).length === 0) throw new InvalidOAuthRequestError('Missing required parameters');
		if (!body.client_id) throw new InvalidOAuthRequestError('Client ID is required');
		if (!body.code) throw new InvalidOAuthRequestError('Code is required');
		if (!body.code_verifier) throw new InvalidOAuthRequestError('Code verifier is required');
		if (body.grant_type !== 'authorization_code') throw new InvalidOAuthRequestError('Only authorization_code grant type us supported');

		try {
			new URL(body.redirect_uri);
		} catch {
			throw new InvalidOAuthRequestError('redirect_uri must be a valid URL');
		}

		return new TokenRequestDTO({
			grantType: String(body.grant_type),
			code: String(body.code),
			redirectUri: String(body.redirect_uri),
			clientId: String(body.client_id),
			codeVerifier: String(body.code_verifier),
		});
	}
}
