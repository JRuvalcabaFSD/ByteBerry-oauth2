import { getErrMsg, InvalidRequestError, UnauthorizedClientError } from '@/shared';
import { ValidateClientRequestDto, ValidateClientResponseDto } from '..';
import { ILogger, IOAuthClientRepository } from '@/interfaces';

/**
 * Use case for validating an OAuth2 client.
 *
 * This class encapsulates the logic required to validate an OAuth2 client based on the provided request data.
 * It checks for the existence of the client, validates the redirect URI and grant type if provided, and logs relevant events.
 *
 * @remarks
 * Throws {@link InvalidRequestError} if the request is invalid (e.g., missing client ID, invalid redirect URI, or unsupported grant type).
 * Throws {@link UnauthorizedClientError} if the client is not found.
 *
 * @example
 * ```typescript
 * const useCase = new ValidateClientUseCase(repository, logger);
 * const response = await useCase.execute({ clientId: 'abc123', redirectUri: 'https://example.com/callback' });
 * ```
 */

export class ValidateClientUseCase {
  /**
   * Creates an instance of the use case with the required dependencies.
   *
   * @param repository - The repository interface for accessing OAuth client data.
   * @param logger - The logger interface for logging application events and errors.
   */

  constructor(
    private readonly repository: IOAuthClientRepository,
    private readonly logger: ILogger
  ) {}

  /**
   * Validates an OAuth2 client based on the provided request parameters.
   *
   * @param request - The DTO containing client validation parameters, including clientId, redirectUri, and grandType.
   * @returns A promise that resolves to a response DTO with validated client information.
   * @throws {InvalidRequestError} If the clientId is missing, the redirect URI is invalid, or the grant type is unsupported.
   * @throws {UnauthorizedClientError} If the client is not found in the repository.
   * @throws {Error} For any unexpected errors during validation.
   */

  public async execute(request: ValidateClientRequestDto): Promise<ValidateClientResponseDto> {
    this.logger.debug('Validating OAuth2 client', { clientId: request.clientId });

    try {
      if (!request.clientId) throw new InvalidRequestError('Client ID is required');

      const client = await this.repository.findByClientId(request.clientId);
      if (!client) {
        this.logger.warn('Client not found', { clientId: request.clientId });
        throw new UnauthorizedClientError('invalid client');
      }

      // Validate redirect URI if provided
      if (request.redirectUri && !client.isValidRedirectUri(request.redirectUri)) {
        this.logger.warn('Invalid redirect URI', { clientId: request.clientId, redirectUri: request.redirectUri });
        throw new InvalidRequestError('Invalid redirect_uri');
      }

      // Validate grant type if provided
      if (request.grandType && !client.supportsGrantType(request.grandType)) {
        this.logger.warn('Unsupported grant type', { clientId: request.clientId, grandType: request.grandType });
        throw new InvalidRequestError('Unsupported grant type');
      }

      this.logger.debug('Client validated successfully', { clientId: client.clientId, clientName: client.clientName });

      return {
        clientId: client.clientId,
        clientName: client.clientName,
        isPublic: client.isPublic,
        redirectUris: client.redirectUris,
        grandTypes: client.grantTypes,
      };
    } catch (error) {
      if (error instanceof InvalidRequestError || error instanceof UnauthorizedClientError) {
        throw error;
      }

      this.logger.error('Unexpected error validating client', { error: getErrMsg(error), clientId: request.clientId });
      throw error;
    }
  }
}
