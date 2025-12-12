import { randomBytes } from 'crypto';

import * as Interfaces from '@interfaces';
import { ClientIdVO, CodeVerifierVO, TokenEntity } from '@domain';
import { getErrMsg, InvalidGrantError, InvalidRequestError, LogContextClass, LogContextMethod, OAuthError } from '@shared';
import { TokenRequestCommand } from '../commands/token.request.command.js';
import { TokenResponseDto } from '../dtos/token.dto.js';

/**
 * Use case for exchanging an authorization code for an access token in the OAuth2 flow.
 *
 * This class implements the token exchange process following the OAuth2 specification,
 * including PKCE (Proof Key for Code Exchange) verification, authorization code validation,
 * and access token generation.
 *
 * @remarks
 * The exchange process validates:
 * - Authorization code existence and validity
 * - Code expiration and usage status
 * - Client ID matching
 * - Redirect URI matching
 * - PKCE code verifier against code challenge
 *
 * Upon successful validation, it:
 * - Marks the authorization code as used
 * - Generates a new access token with appropriate claims
 * - Persists the token entity for auditing
 * - Returns a token response with the access token and metadata
 *
 * @throws {InvalidGrantError} When the authorization code is invalid, expired, already used,
 *                             or when client ID, redirect URI, or PKCE verification fails
 * @throws {InvalidRequestError} When the request parameters are malformed or invalid
 *
 * @example
 * ```typescript
 * const useCase = new ExchangeCodeForTokenUseCase(
 *   codeRepository,
 *   tokenRepository,
 *   logger,
 *   jwtService,
 *   pkceVerifier
 * );
 *
 * const tokenResponse = await useCase.execute({
 *   code: 'auth_code_123',
 *   client_id: 'client_123',
 *   redirect_uri: 'https://example.com/callback',
 *   code_verifier: 'verifier_string',
 * });
 * ```
 */

@LogContextClass()
export class ExchangeCodeForTokenUseCase implements Interfaces.IExchangeCodeForTokenUseCase {
	/**
	 * Creates an instance of ExchangeCodeForTokenUseCase.
	 *
	 * @param codeRepository - Repository for managing authorization codes
	 * @param tokenRepository - Repository for managing access and refresh tokens
	 * @param logger - Logger service for recording application events and errors
	 * @param jwtService - Service for generating and validating JWT tokens
	 * @param pkceVerifier - Service for verifying PKCE (Proof Key for Code Exchange) challenges
	 */

	constructor(
		private readonly codeRepository: Interfaces.IAuthCodeRepository,
		private readonly tokenRepository: Interfaces.ITokenRepository,
		private readonly logger: Interfaces.ILogger,
		private readonly jwtService: Interfaces.IJwtService,
		private readonly pkceVerifier: Interfaces.IPKceVerifierService
	) {}

	/**
	 * Exchanges an authorization code for an access token using the OAuth2 authorization code flow with PKCE.
	 *
	 * This method performs the following operations:
	 * 1. Validates the authorization code exists and is valid (not used or expired)
	 * 2. Verifies the client ID and redirect URI match the original authorization request
	 * 3. Validates the PKCE code_verifier against the stored code_challenge
	 * 4. Marks the authorization code as used to prevent replay attacks
	 * 5. Generates and returns a JWT access token
	 * 6. Persists the token entity for audit purposes
	 *
	 * @param request - The token request containing:
	 *   - `code`: The authorization code to exchange
	 *   - `client_id`: The client identifier
	 *   - `code_verifier`: The PKCE code verifier
	 *   - `redirect_uri`: The redirect URI that must match the authorization request
	 *
	 * @returns A promise that resolves to a TokenResponseDto containing:
	 *   - `access_token`: The generated JWT access token
	 *   - `token_type`: Always "Bearer"
	 *   - `expires_in`: Token expiration time in seconds (900 = 15 minutes)
	 *   - `scope`: (optional) The granted scope if present
	 *
	 * @throws {InvalidGrantError} When:
	 *   - Authorization code is not found
	 *   - Authorization code has already been used
	 *   - Authorization code has expired
	 *   - Client ID doesn't match
	 *   - Redirect URI doesn't match
	 *   - PKCE code_verifier is invalid
	 *
	 * @throws {InvalidRequestError} When the client_id or code_verifier format is invalid
	 *
	 * @throws {OAuthError} For other OAuth-related errors
	 */

	@LogContextMethod()
	public async execute(request: TokenRequestCommand): Promise<TokenResponseDto> {
		this.logger.debug('Exchanging code for token', { client_id: request.client_id });

		try {
			const authCode = await this.codeRepository.findByCode(request.code);
			if (!authCode) throw new InvalidGrantError('Authorization code not found');

			if (authCode.isUsed()) {
				this.logger.warn('Attempt to reuse authorization code', { code: request.code });
				throw new InvalidGrantError('Authorization code already used');
			}
			if (authCode.isExpired()) {
				this.logger.warn('Authorization code expired', { code: request.code });
				throw new InvalidGrantError('Authorization code expired');
			}

			let clientId: ClientIdVO;
			let codeVerifier: CodeVerifierVO;

			try {
				clientId = ClientIdVO.create(request.client_id);
				codeVerifier = CodeVerifierVO.create(request.code_verifier);
			} catch (error) {
				throw new InvalidRequestError(getErrMsg(error));
			}

			if (!authCode.clientId.equals(clientId)) throw new InvalidGrantError('Client ID mismatch');
			if (authCode.redirectUri !== request.redirect_uri) throw new InvalidGrantError('Redirect URI mismatch');

			const isValid = this.pkceVerifier.verify(authCode.codeChallenge, codeVerifier.getValue());
			if (!isValid) {
				this.logger.warn('Invalid PKCE code_verifier', {
					client_id: request.client_id,
				});
				throw new InvalidGrantError('Invalid code_verifier');
			}

			authCode.markAsUsed();
			await this.codeRepository.save(authCode);

			const accessToken = this.jwtService.generateAccessToken({
				sub: clientId.getValue(),
				scope: authCode.scope,
				client_id: clientId.getValue(),
			});

			const tokenEntity = TokenEntity.create({
				tokenId: 'jti-' + randomBytes(16).toString('hex'),
				userId: authCode.userId || 'system',
				clientId: clientId.getValue(),
				expiresAt: new Date(Date.now() + 15 * 60 * 1000),
			});

			await this.tokenRepository.saveToken(tokenEntity);

			this.logger.debug('Token issued and audited', {
				client_id: request.client_id,
				has_scope: !!authCode.scope,
			});

			const scope = authCode.scope;
			return { access_token: accessToken, token_type: 'Bearer', expires_in: 900, ...(scope && { scope }) };
		} catch (error) {
			if (!(error instanceof OAuthError)) {
				this.logger.error('Unexpected error exchanging code for token', { error: getErrMsg(error), client_id: request.client_id });
			}
			throw error;
		}
	}
}
