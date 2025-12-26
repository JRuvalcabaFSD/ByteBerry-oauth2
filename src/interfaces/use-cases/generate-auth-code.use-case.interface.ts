import { AuthCodeRequestDTO, AuthCodeResponseDTO } from '@application';

/**
 * Interface for the Auth Code use case.
 *
 * Provides a contract for executing the authorization code logic,
 * typically used in OAuth2 flows to generate or validate authorization codes.
 *
 * @interface IGenerateAuthCodeUseCase
 *
 * @method execute - Executes the auth code use case.
 * @param {string} userId - The ID of the user for whom the auth code is being generated.
 * @param {AuthCodeRequestDTO} request - The request data transfer object containing necessary information.
 * @returns {Promise<AuthCodeResponseDTO>} - A promise that resolves to the auth code response data transfer object.
 *
 * @example
 * const authCodeUseCase: IGenerateAuthCodeUseCase = ...; // get an instance of the use case
 * const userId = 'user-123';
 * const request: AuthCodeRequestDTO = { ... }; // populate request DTO
 * const response: AuthCodeResponseDTO = await authCodeUseCase.execute(userId, request);
 * console.log(response);
 */

export interface IGenerateAuthCodeUseCase {
	execute(userId: string, request: AuthCodeRequestDTO): Promise<AuthCodeResponseDTO>;
}
