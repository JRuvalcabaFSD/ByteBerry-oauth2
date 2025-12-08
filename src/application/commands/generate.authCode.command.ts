import { ParsedQs } from 'qs';

import { InvalidRequestError } from '@shared';

/**
 * Command class for generating OAuth2 authorization codes following the PKCE (Proof Key for Code Exchange) flow.
 *
 * This command encapsulates the parameters required for initiating an OAuth2 authorization code flow
 * with PKCE extension (RFC 7636). It validates that all required parameters are present and conform
 * to the OAuth2 specification.
 *
 * @remarks
 * - Only supports `response_type=code` as per OAuth2 authorization code flow
 * - Requires PKCE parameters (`code_challenge` and `code_challenge_method`)
 * - Supports both 'S256' (SHA-256) and 'plain' code challenge methods
 * - Optional parameters include `scope` and `state`
 *
 * @example
 * ```typescript
 * const query = {
 *   response_type: 'code',
 *   client_id: 'my-client',
 *   redirect_uri: 'https://example.com/callback',
 *   code_challenge: 'E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM',
 *   code_challenge_method: 'S256',
 *   scope: 'read write',
 *   state: 'xyz'
 * };
 * const command = GenerateAuthCodeCommand.fromQuery(query);
 * ```
 *
 * @throws {InvalidRequestError} When required parameters are missing or invalid
 */

export class GenerateAuthCodeCommand {
	/**
	 * Creates an instance of the authorization code generation command.
	 *
	 * @param client_id - The unique identifier of the client application requesting authorization
	 * @param response_type - The type of response expected (typically "code" for authorization code flow)
	 * @param redirect_uri - The URI where the authorization server will redirect after authorization
	 * @param code_challenge - The code challenge derived from the code verifier for PKCE
	 * @param code_challenge_method - The method used to derive the code challenge ('S256' for SHA-256 or 'plain')
	 * @param scope - Optional space-delimited list of requested scopes
	 * @param state - Optional opaque value used to maintain state between request and callback
	 */

	private constructor(
		public readonly client_id: string,
		public readonly response_type: string,
		public readonly redirect_uri: string,
		public readonly code_challenge: string,
		public readonly code_challenge_method: 'S256' | 'plain',
		public readonly scope?: string,
		public readonly state?: string
	) {}

	/**
	 * Creates a GenerateAuthCodeCommand instance from URL query parameters.
	 *
	 * This method validates OAuth2 authorization request parameters according to the
	 * Authorization Code Flow with PKCE (Proof Key for Code Exchange) specification.
	 *
	 * @param query - Parsed query string parameters from the authorization request
	 *
	 * @returns A new GenerateAuthCodeCommand instance with validated parameters
	 *
	 * @throws {InvalidRequestError} When required parameters are missing or invalid:
	 * - If query is empty or undefined
	 * - If response_type is not 'code'
	 * - If client_id is missing
	 * - If redirect_uri is missing
	 * - If code_challenge or code_challenge_method are missing (PKCE requirement)
	 *
	 * @remarks
	 * - The scope parameter is optional and will be trimmed if provided as a non-empty string
	 * - The state parameter is optional and preserved as-is if provided
	 * - This implementation enforces PKCE, which is required for public clients
	 *
	 * @example
	 * ```typescript
	 * const query = {
	 *   response_type: 'code',
	 *   client_id: 'my-client-id',
	 *   redirect_uri: 'https://example.com/callback',
	 *   code_challenge: 'E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM',
	 *   code_challenge_method: 'S256',
	 *   scope: 'read write',
	 *   state: 'xyz'
	 * };
	 * const command = GenerateAuthCodeCommand.fromQuery(query);
	 * ```
	 */

	public static fromQuery(query: ParsedQs): GenerateAuthCodeCommand {
		if (!query || Object.keys(query).length === 0) throw new InvalidRequestError('Missing required parameters');
		if (query.response_type !== 'code') throw new InvalidRequestError('Only response_type=code is supported');
		if (!query.client_id) throw new InvalidRequestError('Client Id is required');
		if (!query.redirect_uri) throw new InvalidRequestError('redirect_uri are required (PKCE)');
		if (!query.code_challenge || !query.code_challenge_method)
			throw new InvalidRequestError('code_challenge and code_challenge_method are required (PKCE)');

		const scope = typeof query.scope === 'string' && query.scope.trim() !== '' ? query.scope.trim() : undefined;
		const state = typeof query.state === 'string' ? query.state : undefined;

		return new GenerateAuthCodeCommand(
			query.client_id as string,
			query.response_type as string,
			query.redirect_uri as string,
			query.code_challenge as string,
			query.code_challenge_method as 'S256' | 'plain',
			scope,
			state
		);
	}
}
