import { IAuthorizationCodeExchange, IAuthorizationCodeRepository, ILogger } from '@/interfaces';
import { BadRequestError } from '@/shared';

export interface IExchangeAuthorizationCodeResult {
  clientId: string;
  redirectUri: string;
  codeChallenge: string;
  scopes: string[] | undefined;
}

/**
 * Use case for exchanging an OAuth2 authorization code for access credentials.
 *
 * This class encapsulates the logic required to validate and exchange an authorization code,
 * ensuring that the code exists, has not been used or expired, and that the redirect URI matches.
 * Upon successful validation, the authorization code is marked as used and relevant metadata is returned.
 *
 * @remarks
 * This use case is typically invoked as part of the OAuth2 authorization code grant flow.
 *
 * @constructor
 * @param repository - The repository used to access and update authorization codes.
 * @param logger - The logger instance for logging informational and error messages.
 *
 * @method execute
 * Executes the exchange process for a given authorization code.
 *
 * @param exchange - The exchange request containing the authorization code, client ID, and redirect URI.
 * @returns A promise that resolves to the result of the exchange, including client ID, redirect URI, code challenge, and scopes.
 * @throws BadRequestError if the authorization code is invalid, already used, expired, or if the redirect URI does not match.
 * @example
 * ```typescript
 * const useCase = new ExchangeAuthorizationCodeUseCase(repository, logger);
 * const result = await useCase.execute({
 *   code: 'auth_code_123',
 *   clientId: 'client_abc',
 *   redirectUri: 'https://client.app/callback'
 * });
 * console.log(result);
 * ```
 */

export class ExchangeAuthorizationCodeUseCase {
  /**
   * Creates an instance of ExchangeAuthorizationCodeUseCase.
   * @param {IAuthorizationCodeRepository} repository - The repository for accessing authorization codes.
   * @param {ILogger} logger - The logger instance for logging messages.
   * @memberof ExchangeAuthorizationCodeUseCase
   */

  constructor(
    private readonly repository: IAuthorizationCodeRepository,
    private readonly logger: ILogger
  ) {}

  /**
   * Exchanges an authorization code for its associated metadata after performing a series of validations.
   *
   * This method validates the provided authorization code by checking:
   * - If the code exists in the repository.
   * - If the code has not already been used.
   * - If the code has not expired.
   * - If the provided redirect URI matches the one associated with the code.
   *
   * If all validations pass, the code is marked as used and the relevant metadata is returned.
   * Logs are generated for each significant step and error condition.
   *
   * @param exchange - The exchange request containing the authorization code, client ID, and redirect URI.
   * @returns A promise that resolves to the result containing client ID, redirect URI, code challenge, and scopes.
   * @example
   * ```typescript
   * const useCase = new ExchangeAuthorizationCodeUseCase(repository, logger);
   * const result = await useCase.execute({
   *   code: 'auth_code_123',
   *   clientId: 'client_abc',
   *   redirectUri: 'https://client.app/callback'
   * });
   * console.log(result);
   * ```
   * @throws {BadRequestError} If the authorization code is invalid, already used, expired, or the redirect URI does not match.
   */

  public async execute(exchange: IAuthorizationCodeExchange): Promise<IExchangeAuthorizationCodeResult> {
    const context = 'ExchangeAuthorizationCodeUseCase.execute';
    this.logger.info('Exchanging authorization code', { context, code: exchange.code, clientId: exchange.clientId });

    try {
      const authCode = await this.repository.findByCode(exchange.code);

      if (!authCode) {
        this.logger.warn('Authorization code not found', { context, code: exchange.code });
        throw new BadRequestError('Invalid authorization code');
      }

      if (authCode.used) {
        this.logger.warn('Authorization code already used', { context, code: exchange.code });
        throw new BadRequestError('Authorization code has already been used');
      }

      if (new Date() > authCode.metadata.expiresAt) {
        this.logger.warn('Authorization code expired', {
          context,
          code: exchange.code,
          expiresAt: authCode.metadata.expiresAt.toISOString(),
        });
        throw new BadRequestError('Authorization code has expired');
      }

      if (authCode.metadata.redirectUri !== exchange.redirectUri) {
        this.logger.warn('Redirect URI mismatch', {
          context,
          expectedRedirectUri: authCode.metadata.redirectUri,
          receivedRedirectUri: exchange.redirectUri,
        });
        throw new BadRequestError('Invalid redirect URI');
      }

      await this.repository.markAsUsed(exchange.code);

      this.logger.info('Authorization code exchanged successfully', { context, code: exchange.code, clientId: exchange.clientId });

      return {
        clientId: authCode.metadata.clientId,
        redirectUri: authCode.metadata.redirectUri,
        codeChallenge: authCode.metadata.codeChallenge,
        scopes: authCode.metadata.scopes,
      };
    } catch (error) {
      this.logger.error('Failed to exchange authorization code', {
        context,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }
}
