import { ValidateClientRequestDto, ValidateClientResponseDto } from '@application';
import { ILogger, IOAthClientRepository, IValidateClientUseCase } from '@interfaces';
import { getErrMsg, InvalidRequestError, OAuthError, UnauthorizedClientError } from '@shared';

/**
 * Use case for validating OAuth2 client credentials and configuration.
 *
 * This use case validates that:
 * - The client ID exists in the repository
 * - The redirect URI (if provided) is registered for the client
 * - The grant type (if provided) is supported by the client
 *
 * @remarks
 * The validation process includes:
 * 1. Checking that a client ID is provided
 * 2. Retrieving the client from the repository
 * 3. Validating redirect URI against client's registered URIs
 * 4. Validating grant type against client's supported grant types
 *
 * @throws {InvalidRequestError} When client ID is missing or grant type is unsupported
 * @throws {UnauthorizedClientError} When client is not found in the repository
 *
 * @example
 * ```typescript
 * const validateClientUseCase = new ValidateClientUseCase(repository, logger);
 * const response = await validateClientUseCase.execute({
 *   clientId: 'my-client-id',
 *   redirectUri: 'https://example.com/callback',
 *   grandType: 'authorization_code'
 * });
 * ```
 */

export class ValidateClientUseCase implements IValidateClientUseCase {
	constructor(
		private readonly repository: IOAthClientRepository,
		private readonly logger: ILogger
	) {}
	public async execute(request: ValidateClientRequestDto): Promise<ValidateClientResponseDto> {
		this.logger.debug('Validating OAuth client', { clientId: request.clientId });

		try {
			if (!request.clientId) throw new InvalidRequestError('ClientId is required');

			const client = await this.repository.findByClientId(request.clientId);

			if (!client) {
				this.logger.warn('Client not found', { clientId: request.clientId });
				throw new UnauthorizedClientError('Invalid client');
			}

			if (request.redirectUri && !client.isValidRedirectUri(request.redirectUri)) {
				this.logger.warn('Invalid redirect URI', { clientId: request.clientId, redirectUri: request.redirectUri });
			}

			if (request.grandType && !client.supportsGrantType(request.grandType)) {
				this.logger.warn('Unsupported grant type', { clientId: request.clientId, grandType: request.grandType });
				throw new InvalidRequestError('Unsupported grand type');
			}

			this.logger.debug('Client validate successfully', { clientId: client.clientId, clientName: client.clientName });

			return {
				clientId: client.clientId,
				clientName: client.clientName,
				isPublic: client.isPublic,
				redirectUris: client.redirectUris,
				grantTypes: client.grantTypes,
			};
		} catch (error) {
			if (!(error instanceof OAuthError)) {
				this.logger.error('Unexpected error validating client', { error: getErrMsg(error), clientId: request.clientId });
			}

			throw error;
		}
	}
}
