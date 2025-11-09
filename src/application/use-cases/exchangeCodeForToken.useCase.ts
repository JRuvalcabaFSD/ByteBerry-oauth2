import { InvalidGrantError, InvalidRequestError, LogContextClass, LogContextMethod, UnsupportedGrantTypeError } from '@/shared';
import { ICodeStore, IExchangeCodeForTokenUseCase, ILogger, IPKceVerifierService } from '@/interfaces';
import { TokenRequestDto, TokenResponseDto } from '@/application';
import { ClientId, CodeVerifier } from '@/domain';

/**
 * Use case for exchanging an authorization code for an access token.
 *
 * This use case implements the OAuth 2.0 authorization code grant flow with PKCE (Proof Key for Code Exchange).
 * It validates the authorization code, verifies the PKCE challenge, and issues an access token upon successful validation.
 *
 * @remarks
 * The use case performs the following validations:
 * - Ensures the grant type is 'authorization_code'
 * - Verifies the presence of required parameters (code and code_verifier)
 * - Checks if the authorization code exists and is valid
 * - Validates that the code has not been previously used
 * - Confirms the code has not expired
 * - Verifies client ID and redirect URI match the original authorization request
 * - Validates the PKCE code_verifier against the stored code_challenge
 *
 * @throws {UnsupportedGrantTypeError} When the grant_type is not 'authorization_code'
 * @throws {InvalidRequestError} When required parameters (code or code_verifier) are missing
 * @throws {InvalidGrantError} When:
 * - Authorization code is not found
 * - Authorization code has already been used
 * - Authorization code has expired
 * - Client ID does not match
 * - Redirect URI does not match
 * - PKCE code_verifier validation fails
 *
 * @example
 * ```typescript
 * const useCase = new ExchangeCodeForTokenUseCase(codeStore, logger);
 * const tokenResponse = await useCase.execute({
 *   grant_type: 'authorization_code',
 *   code: 'auth_code_123',
 *   code_verifier: 'verifier_xyz',
 *   client_id: 'client_123',
 *   redirect_uri: 'https://example.com/callback'
 * });
 * ```
 */

@LogContextClass()
export class ExchangeCodeForTokenUseCase implements IExchangeCodeForTokenUseCase {
  /**
   * Creates an instance of the use case for exchanging authorization codes for tokens.
   *
   * @param codeStore - The code store implementation for managing authorization codes
   * @param logger - The logger implementation for logging operations and errors
   * @param pkceVerifier - The PKCE verifier service for validating code challenges
   */
  constructor(
    private readonly codeStore: ICodeStore,
    private readonly logger: ILogger,
    private pkceVerifier: IPKceVerifierService
  ) {}

  /**
   * Exchanges an authorization code for an access token using the OAuth 2.0 authorization code flow with PKCE.
   *
   * This method validates the authorization code, verifies the PKCE code verifier, and issues an access token
   * if all validations pass. The authorization code is marked as used after successful validation.
   *
   * @param request - The token request containing the authorization code, code verifier, client ID, and redirect URI
   * @returns A promise that resolves to a token response containing the access token, token type, expiration time, and optional scope
   *
   * @throws {UnsupportedGrantTypeError} When the grant type is not 'authorization_code'
   * @throws {InvalidRequestError} When the code or code_verifier is missing from the request
   * @throws {InvalidGrantError} When:
   *   - The authorization code is not found in the store
   *   - The authorization code has already been used
   *   - The authorization code has expired
   *   - The client ID doesn't match the one associated with the authorization code
   *   - The redirect URI doesn't match the one associated with the authorization code
   *   - The PKCE code verifier is invalid
   *
   * @remarks
   * The method performs the following validations:
   * - Ensures the grant type is 'authorization_code'
   * - Verifies the presence of required parameters (code and code_verifier)
   * - Validates the authorization code exists and is not expired or previously used
   * - Confirms client ID and redirect URI match the original authorization request
   * - Verifies the PKCE code challenge using the provided code verifier
   */

  @LogContextMethod()
  public async execute(request: TokenRequestDto): Promise<TokenResponseDto> {
    this.logger.debug('Exchanging code for token', { client_id: request.client_id });

    if (request.grant_type !== 'authorization_code') throw new UnsupportedGrantTypeError('Only authorization_code grant type is supported');
    if (!request.code || !request.code_verifier) throw new InvalidRequestError('code and code_verifier are required');

    const authCode = this.codeStore.get(request.code);
    if (!authCode) throw new InvalidGrantError('Authorization code not found');

    if (authCode.isUsed()) {
      this.logger.warn('Attempt to reuse authorization code', { code: request.code });
      throw new InvalidGrantError('Authorization code already used');
    }

    if (authCode.isExpired()) {
      this.logger.warn('Authorization code expired', { code: request.code });
      throw new InvalidGrantError('Authorization code expired');
    }

    const clintId = ClientId.create(request.client_id);
    if (!authCode.getClientId().equals(clintId)) throw new InvalidGrantError('Client ID mismatch');
    if (authCode.getRedirectUri() !== request.redirect_uri) throw new InvalidGrantError('Redirect URI mismatch');

    const codeVerifier = CodeVerifier.create(request.code_verifier);
    const isValid = this.pkceVerifier.verify(authCode.getCodeChallenge(), codeVerifier.getValue());

    if (!isValid) {
      this.logger.warn('Invalid PKCE code_verifier', {
        client_id: request.client_id,
      });
      throw new InvalidGrantError('Invalid code_verifier');
    }

    authCode.markAsUsed();

    const mockToken = `mock_access_token_${Date.now()}`;
    this.logger.debug('Token issued successfully', { client_id: request.client_id });

    const scope = authCode.getScope();
    return { access_token: mockToken, token_type: 'Bearer', expires_in: 900, ...(scope && { scope }) };
  }
}
