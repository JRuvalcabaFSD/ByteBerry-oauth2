import * as crypto from 'crypto';

import { InvalidRequestError, LogContextClass, LogContextMethod } from '@/shared';
import { ICodeStore, IGenerateAuthorizationCodeUseCase, ILogger } from '@/interfaces';
import { AuthorizeRequestDto, AuthorizeResponseDto } from '@/application';
import { AuthorizationCodeEntity, ClientId, CodeChallenge } from '@/domain';

/**
 * Use case for generating OAuth 2.0 authorization codes with PKCE support.
 *
 * This use case implements the authorization code generation flow as part of the
 * OAuth 2.0 authorization code grant with Proof Key for Code Exchange (PKCE).
 * It validates the request, creates a secure authorization code, and stores it
 * with associated metadata for later verification during the token exchange.
 *
 * @remarks
 * - Only supports response_type 'code'
 * - Requires PKCE parameters (code_challenge and code_challenge_method)
 * - Generated codes expire after 5 minutes
 * - Uses cryptographically secure random bytes for code generation
 *
 * @example
 * ```typescript
 * const useCase = new GenerateAuthorizationCodeUseCase(codeStore, logger);
 * const response = await useCase.execute({
 *   response_type: 'code',
 *   client_id: 'my-client-id',
 *   redirect_uri: 'https://example.com/callback',
 *   code_challenge: 'E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM',
 *   code_challenge_method: 'S256',
 *   scope: 'read write',
 *   state: 'xyz'
 * });
 * ```
 *
 * @throws {InvalidRequestError} When response_type is not 'code' or PKCE parameters are missing
 */

@LogContextClass()
export class GenerateAuthorizationCodeUseCase implements IGenerateAuthorizationCodeUseCase {
  /**
   * Creates an instance of the use case for generating authorization codes.
   *
   * @param codeStore - The code store repository for persisting authorization codes
   * @param logger - The logger instance for tracking operations and errors
   */

  constructor(
    private readonly codeStore: ICodeStore,
    private readonly logger: ILogger
  ) {}

  /**
   * Generates an authorization code for OAuth2 PKCE flow.
   *
   * @param request - The authorization request containing client credentials and PKCE parameters
   * @returns A promise that resolves to an object containing the generated authorization code and state
   * @throws {InvalidRequestError} When response_type is not 'code' or PKCE parameters are missing
   *
   * @remarks
   * This method implements the OAuth2 authorization code flow with PKCE (Proof Key for Code Exchange).
   * The generated authorization code is stored temporarily with a 5-minute expiration period.
   *
   * @example
   * ```typescript
   * const response = await useCase.execute({
   *   response_type: 'code',
   *   client_id: 'my-client-id',
   *   redirect_uri: 'https://example.com/callback',
   *   code_challenge: 'challenge-string',
   *   code_challenge_method: 'S256',
   *   scope: 'read write',
   *   state: 'random-state'
   * });
   * ```
   */

  @LogContextMethod()
  public async execute(request: AuthorizeRequestDto): Promise<AuthorizeResponseDto> {
    this.logger.debug('Generating authorization code', { client_id: request.client_id });

    if (request.response_type !== 'code') throw new InvalidRequestError('Only response_type=code is supported');
    if (!request.code_challenge || !request.code_challenge_method)
      throw new InvalidRequestError('code_challenge and code_challenge_method are required (PKCE)');

    const clientId = ClientId.create(request.client_id);
    const codeChallenge = CodeChallenge.create(request.code_challenge, request.code_challenge_method);

    const code = crypto.randomBytes(32).toString('base64');

    const authCode = AuthorizationCodeEntity.create({
      code,
      clientId,
      redirectUri: request.redirect_uri,
      codeChallenge,
      expirationMinutes: 5,
      scope: request.scope,
      state: request.state,
    });

    this.codeStore.set(code, authCode);
    this.logger.debug('Authorization code generated successfully', { client_id: request.client_id, code_length: code.length });

    return { code, state: request.state };
  }
}
