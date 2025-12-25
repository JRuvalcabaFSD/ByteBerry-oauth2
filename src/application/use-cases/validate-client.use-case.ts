import type { ValidateClientRequestDto, ValidateClientResponseDto } from '@application';
import type { ILogger, IOAuthClientRepository, IValidateClientUseCase } from '@interfaces';
import { getErrMsg, LogContextClass, LogContextMethod, OAuthError, OAuthUnAuthorizedError } from '@shared';

/**
 * Use case for validating an OAuth client during the authorization process.
 *
 * This class checks if the provided client ID exists, validates the redirect URI,
 * and ensures the requested grant type is supported by the client.
 * It logs relevant information and errors throughout the validation process.
 *
 * @implements {IValidateClientUseCase}
 * @constructor
 * @param repository - The OAuth client repository for client lookup.
 * @param logger - Logger instance for logging debug, warning, and error messages.
 *
 * @method execute
 * Validates the client based on the provided request data.
 * Throws an `OAuthUnAuthorizedError` if validation fails.
 *
 * @param data - The client validation request DTO containing clientId, redirectUri, and grandType.
 * @returns A promise resolving to the validated client response DTO.
 * @throws {OAuthUnAuthorizedError} If the client is not found, the redirect URI is invalid, or the grant type is unsupported.
 * @throws {OAuthError} For unexpected errors during validation.
 */

@LogContextClass()
export class ValidateClientUseCase implements IValidateClientUseCase {
	constructor(
		private readonly repository: IOAuthClientRepository,
		private readonly logger: ILogger
	) {}

	@LogContextMethod()
	public async execute(data: ValidateClientRequestDto): Promise<ValidateClientResponseDto> {
		this.logger.debug('Validating OAuth client', { clientId: data.clientId });

		try {
			//We look for if the client is registered
			const client = await this.repository.findByClientId(data.clientId);

			if (!client) {
				this.logger.warn('Client not found', { clientId: data.clientId });
				throw new OAuthUnAuthorizedError('Invalid client');
			}

			//We validate the redirection url and the grand type.
			if (!client.isValidRedirectUri(data.redirectUri)) {
				this.logger.warn('Invalid redirect URI', { clientId: data.clientId, redirectUri: data.redirectUri });
				throw new OAuthUnAuthorizedError('Invalid redirect URI');
			}

			if (!client.supportsGrandType(data.grantType)) {
				this.logger.warn('Unsupported grand type', { clientId: data.clientId, grandType: data.grantType });
				throw new OAuthUnAuthorizedError('Unsupported grand type');
			}

			//We return the validated client
			const { clientId, clientName, isPublic, redirectUris, grantTypes } = client;

			this.logger.debug('Client validate successfully', { clientId, clientName });

			return { clientId, clientName, isPublic, redirectUris, grantTypes };
		} catch (error) {
			if (!(error instanceof OAuthError)) {
				this.logger.error('Unexpected error validating client', { err: getErrMsg(error), clientId: data.clientId });
			}

			throw error;
		}
	}
}
