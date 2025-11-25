import * as crypto from 'crypto';

import { InvalidRequestError, InvalidValueObjectError, LogContextClass, LogContextMethod, UnauthorizedClientError } from '@/shared';
import { IAuthorizationCodeRepository, IGenerateAuthorizationCodeUseCase, ILogger } from '@/interfaces';
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
   * Creates an instance of the use case with the required dependencies.
   *
   * @param repository - The repository responsible for managing authorization codes.
   * @param logger - The logger instance used for logging application events and errors.
   */

  constructor(
    private readonly repository: IAuthorizationCodeRepository,
    private readonly logger: ILogger
  ) {}

  /**
   * Generates an OAuth2 authorization code for the given authorization request.
   *
   * Validates the request parameters, including response type and PKCE requirements.
   * Creates and stores an authorization code entity with the provided client ID, redirect URI,
   * code challenge, scope, and state. Handles errors related to invalid request parameters
   * and logs relevant debug and error information.
   *
   * @param request - The authorization request DTO containing client ID, redirect URI, code challenge, code challenge method, scope, and state.
   * @returns A promise that resolves to an object containing the generated authorization code and state.
   * @throws {InvalidRequestError} If the request parameters are invalid or missing required PKCE fields.
   * @throws {UnauthorizedClientError} If the client is not authorized.
   * @throws {Error} For unexpected errors during authorization code generation.
   */

  @LogContextMethod()
  public async execute(request: AuthorizeRequestDto): Promise<AuthorizeResponseDto> {
    this.logger.debug('Generating authorization code', { client_id: request.client_id });

    try {
      if (request.response_type !== 'code') throw new InvalidRequestError('Only response_type=code is supported');
      if (!request.code_challenge || !request.code_challenge_method)
        throw new InvalidRequestError('code_challenge and code_challenge_method are required (PKCE)');

      if (!request.redirect_uri) throw new InvalidRequestError('redirect_uri are required (PKCE)');

      let clientId: ClientId;
      let codeChallenge: CodeChallenge;

      try {
        clientId = ClientId.create(request.client_id);
      } catch (error) {
        if (error instanceof InvalidValueObjectError) {
          throw new InvalidRequestError(error.message);
        }
        throw error;
      }

      try {
        codeChallenge = CodeChallenge.create(request.code_challenge, request.code_challenge_method);
      } catch (error) {
        if (error instanceof InvalidValueObjectError) {
          throw new InvalidRequestError(error.message);
        }
        throw error;
      }
      const code = crypto.randomBytes(32).toString('base64');

      const authCode = AuthorizationCodeEntity.create({
        code,
        clientId,
        userId: '',
        redirectUri: request.redirect_uri,
        codeChallenge,
        expirationMinutes: 5,
        scope: request.scope,
        state: request.state,
      });

      await this.repository.save(authCode);
      this.logger.debug('Authorization code generated successfully', { client_id: request.client_id, code_length: code.length });

      return { code, state: request.state };
    } catch (error) {
      if (error instanceof InvalidRequestError || error instanceof UnauthorizedClientError) {
        throw error;
      }

      this.logger.error('Unexpected error generating authorization code', {
        error: error instanceof Error ? error.message : 'Unknown error',
        client_id: request.client_id,
      });
      throw error;
    }
  }
}
