import * as crypto from 'crypto';

import type { IAuthCodeRepository, IGenerateAuthCodeUseCase, ILogger, IValidateClientUseCase } from '@interfaces';
import { AuthCodeEntity, ClientIdVO, CodeChallengeVO } from '@domain';
import { getErrMsg, InvalidRequestError, LogContextClass, LogContextMethod, OAuthError } from '@shared';
import { AuthCodeRequestCommand } from '../commands/auth-code.request.command.js';
import { AuthResponseDto } from '@application';

/**
 * Use case for generating OAuth 2.0 authorization codes with PKCE support.
 *
 * This use case handles the authorization code grant flow by:
 * - Validating the authorization request parameters
 * - Ensuring PKCE (Proof Key for Code Exchange) requirements are met
 * - Validating the client credentials and redirect URI
 * - Generating a secure random authorization code
 * - Storing the authorization code with associated metadata
 *
 * @remarks
 * This implementation follows the OAuth 2.0 Authorization Code Grant flow with PKCE extension (RFC 7636).
 * Authorization codes are valid for 5 minutes by default.
 *
 * @throws {InvalidRequestError} When required parameters are missing or invalid
 * @throws {OAuthError} When OAuth-specific validation fails
 *
 * @example
 * ```typescript
 * const useCase = new GenerateAuthCodeUseCase(repository, validateClient, logger);
 * const response = await useCase.execute({
 *   response_type: 'code',
 *   client_id: 'my-client',
 *   redirect_uri: 'https://example.com/callback',
 *   code_challenge: 'challenge',
 *   code_challenge_method: 'S256',
 *   scope: 'read write',
 *   state: 'random-state'
 * });
 * ```
 */

@LogContextClass()
export class GenerateAuthCodeUseCase implements IGenerateAuthCodeUseCase {
	constructor(
		private readonly repository: IAuthCodeRepository,
		private readonly validateClient: IValidateClientUseCase,
		private readonly logger: ILogger
	) {}

	/**
	 * Generates an authorization code for OAuth2 authorization code flow with PKCE.
	 *
	 * This method validates the authorization request, verifies the client credentials,
	 * and creates a secure authorization code that can be exchanged for an access token.
	 *
	 * @param command - The command object containing authorization request parameters
	 * @param command.response_type - Must be 'code' for authorization code flow
	 * @param command.client_id - The client identifier
	 * @param command.code_challenge - PKCE code challenge parameter
	 * @param command.code_challenge_method - PKCE code challenge method (e.g., 'S256')
	 * @param command.redirect_uri - The URI to redirect after authorization
	 * @param command.scope - Optional OAuth scope(s) requested
	 * @param command.state - Optional state parameter for CSRF protection
	 *
	 * @returns A promise that resolves to an AuthResponseDto containing the authorization code and state
	 *
	 * @throws {InvalidRequestError} When required parameters are missing or invalid
	 * @throws {OAuthError} When client validation fails or other OAuth-specific errors occur
	 *
	 * @remarks
	 * - Enforces PKCE (Proof Key for Code Exchange) requirements
	 * - Generates a cryptographically secure 32-byte authorization code
	 * - Authorization codes expire after 5 minutes
	 * - All operations are logged for debugging and audit purposes
	 */

	@LogContextMethod()
	public async execute(command: AuthCodeRequestCommand): Promise<AuthResponseDto> {
		this.logger.debug('Generating authorization code', { client_id: command.client_id });

		try {
			//Validamos los datos de la petición
			if (command.response_type !== 'code') throw new InvalidRequestError('Only response_type=code is supported');
			if (!command.code_challenge || !command.code_challenge_method)
				throw new InvalidRequestError('code_challenge and code_challenge_method are required (PKCE)');
			if (!command.redirect_uri) throw new InvalidRequestError('redirect_uri are required (PKCE)');

			let clientId: ClientIdVO;
			let codeChallenge: CodeChallengeVO;

			try {
				const clientInfo = await this.validateClient.execute({
					clientId: command.client_id,
					redirectUri: command.redirect_uri,
					grandType: 'authorization_code',
				});

				this.logger.debug('Client validated for authorization', {
					clientId: clientInfo.clientId,
					redirectUri: clientInfo.redirectUris,
					grandType: clientInfo.grandTypes,
				});

				clientId = ClientIdVO.create(clientInfo.clientId);
				codeChallenge = CodeChallengeVO.create(command.code_challenge, command.code_challenge_method);
			} catch (error) {
				throw new InvalidRequestError(getErrMsg(error));
			}

			const code = crypto.randomBytes(32).toString('base64');

			const authCode = AuthCodeEntity.create({
				code,
				clientId,
				userId: '',
				redirectUri: command.redirect_uri,
				codeChallenge,
				expirationMinutes: 0.5,
				scope: command.scope,
				state: command.state,
			});

			await this.repository.save(authCode);
			this.logger.debug('Authorization code generated successfully', { client_id: command.client_id, code_length: code.length });

			return { code, state: command.state };
		} catch (error) {
			if (!(error instanceof OAuthError)) {
				this.logger.error('Unexpected error generating authorization code', { error: getErrMsg(error), client_id: command.client_id });
			}
			throw error;
		}
	}
}
