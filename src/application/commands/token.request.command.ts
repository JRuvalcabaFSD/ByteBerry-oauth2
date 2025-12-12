import { InvalidRequestError } from '@shared';
import { ParsedQs } from 'qs';

/**
 * Represents a command for requesting an OAuth2 token using the authorization code grant type with PKCE.
 *
 * This command encapsulates the required parameters for exchanging an authorization code for an access token,
 * including PKCE (Proof Key for Code Exchange) verification.
 *
 * @remarks
 * This class uses a private constructor and a factory method pattern. Instances should be created
 * using the static `fromQuery` method which validates the input parameters.
 *
 * @example
 * ```typescript
 * const query = {
 *   grand_type: 'authorization_code',
 *   code: 'auth_code_123',
 *   redirect_uri: 'https://example.com/callback',
 *   client_id: 'client_123',
 *   code_verifier: 'verifier_xyz'
 * };
 * const command = TokenRequestCommand.fromQuery(query);
 * ```
 *
 * @throws {InvalidRequestError} When required parameters are missing or invalid
 * @throws {InvalidRequestError} When grant type is not 'authorization_code'
 */

export class TokenRequestCommand {
	private constructor(
		public readonly grant_type: string,
		public readonly code: string,
		public readonly redirect_uri: string,
		public readonly client_id: string,
		public readonly code_verifier: string
	) {}

	/**
	 * Creates a TokenRequestCommand instance from URL query parameters.
	 *
	 * This method validates the presence of required OAuth2 PKCE (Proof Key for Code Exchange)
	 * parameters and ensures the grant type is 'authorization_code'.
	 *
	 * @param query - Parsed query string parameters from the request
	 * @returns A new TokenRequestCommand instance populated with the validated query parameters
	 *
	 * @throws {InvalidRequestError} When query is empty or missing required parameters
	 * @throws {InvalidRequestError} When client_id is not provided
	 * @throws {InvalidRequestError} When code is not provided (required for PKCE flow)
	 * @throws {InvalidRequestError} When code_verifier is not provided (required for PKCE flow)
	 * @throws {InvalidRequestError} When grant_type is not 'authorization_code'
	 *
	 * @example
	 * ```typescript
	 * const query = {
	 *   grant_type: 'authorization_code',
	 *   code: 'abc123',
	 *   redirect_uri: 'https://example.com/callback',
	 *   client_id: 'client123',
	 *   code_verifier: 'verifier456'
	 * };
	 * const command = TokenRequestCommand.fromQuery(query);
	 * ```
	 */

	public static fromQuery(query: ParsedQs): TokenRequestCommand {
		if (!query || Object.keys(query).length === 0) throw new InvalidRequestError('Missing required parameters');
		if (!query.client_id) throw new InvalidRequestError('Client Id is required');
		if (!query.code) throw new InvalidRequestError('code are required (PKCE)');
		if (!query.code_verifier) throw new InvalidRequestError('code_verifier are required (PKCE)');
		if (query.grant_type !== 'authorization_code') throw new InvalidRequestError('Only authorization_code grant type is supported');

		return new TokenRequestCommand(
			query.grant_type as string,
			query.code as string,
			query.redirect_uri as string,
			query.client_id as string,
			query.code_verifier as string
		);
	}
}
