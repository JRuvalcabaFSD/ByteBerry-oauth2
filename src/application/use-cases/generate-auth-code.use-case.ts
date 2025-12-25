import { randomBytes } from 'crypto';

import type { IAuthCodeRepository, IGenerateAuthCodeUseCase, ILogger, IValidateClientUseCase } from '@interfaces';
import { AuthCodeRequestDTO, AuthCodeResponseDTO } from '@application';
import { AuthCodeEntity, ClientIdVO, CodeChallengeVO } from '@domain';
import { getErrMsg, LogContextClass, LogContextMethod, OAuthError } from '@shared';

/**
 * Use case for generating an OAuth2 authorization code.
 *
 * This class handles the process of validating the client, generating a secure authorization code,
 * creating the corresponding authorization code entity, saving it to the repository, and returning
 * the response DTO. It also logs key steps and errors throughout the process.
 *
 * @implements {IGenerateAuthCodeUseCase}
 *
 * @constructor
 * @param repository - Repository for persisting authorization codes.
 * @param validateClient - Use case for validating OAuth2 clients.
 * @param logger - Logger for debug and error messages.
 * @param expirationMinutes - Number of minutes before the authorization code expires (default: 1).
 *
 * @method execute
 * Generates an authorization code for a given user and client request.
 *
 * @param userId - The unique identifier of the user authorizing the client.
 * @param request - The DTO containing client and PKCE information for the authorization code request.
 * @returns A promise that resolves to an AuthCodeResponseDTO containing the generated code and state.
 *
 * @throws {OAuthError} If client validation fails or other OAuth-specific errors occur.
 * @throws {Error} For unexpected errors during code generation or persistence.
 */

@LogContextClass()
export class GenerateAuthCodeUseCase implements IGenerateAuthCodeUseCase {
	constructor(
		private readonly repository: IAuthCodeRepository,
		private readonly validateClient: IValidateClientUseCase,
		private readonly logger: ILogger,
		readonly expirationMinutes: number = 1
	) {}

	@LogContextMethod()
	public async execute(userId: string, request: AuthCodeRequestDTO): Promise<AuthCodeResponseDTO> {
		this.logger.debug('Generating authorization code', { userId, clientId: request });

		try {
			//Validate and obtain customer information
			const clientInfo = await this.validateClient.execute({
				clientId: request.clientId,
				redirectUri: request.redirectUri,
				grandType: 'authorization_code',
			});

			this.logger.debug('Client validated for authorization', {
				clientId: clientInfo.clientId,
				redirectUri: clientInfo.redirectUris,
				grandType: clientInfo.grantTypes,
			});

			//Generate clientId and codeChallenge
			const clientId = ClientIdVO.create(clientInfo.clientId);
			const codeChallenge = CodeChallengeVO.create(request.codeChallenge, request.codeChallengeMethod);

			const code = randomBytes(32).toString('base64');

			//Generate the entity
			const authCode = AuthCodeEntity.create({
				...request,
				code,
				clientId,
				userId,
				codeChallenge,
				expirationMinutes: this.expirationMinutes,
			});

			//Save the entity
			await this.repository.save(authCode);

			//Return authorization object
			this.logger.debug('Authorization code generated', {
				userId,
				clientId: request.clientId,
				code: code.substring(0, 8) + '...', // Log only prefix for security
				expiresAt: authCode.expiresAt.toISOString(),
			});

			return new AuthCodeResponseDTO(code, request.state);
		} catch (error) {
			if (!(error instanceof OAuthError)) {
				this.logger.error('Unexpected error generating authorization code', { error: getErrMsg(error), client_id: request.clientId });
			}

			throw error;
		}
	}
}
