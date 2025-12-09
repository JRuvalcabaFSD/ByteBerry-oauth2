import { AuthResponseDto, AuthCodeRequestCommand } from '@application';

/**
 * Use case interface for generating OAuth2 authorization codes.
 *
 * This interface defines the contract for generating authorization codes
 * during the OAuth2 authorization code flow. It takes an authentication
 * request and returns an authentication response containing the generated
 * authorization code.
 *
 * @interface IGenerateAuthCodeUseCase
 *
 * @example
 * ```typescript
 * class GenerateAuthCodeUseCase implements IGenerateAuthCodeUseCase {
 *   async execute(request: AuthRequestDto): Promise<AuthResponseDto> {
 *     // Implementation logic
 *   }
 * }
 * ```
 */

export interface IGenerateAuthCodeUseCase {
	/**
	 * Executes the use case to generate an authorization code.
	 *
	 * @param {AuthCodeRequestCommand} request - The authentication request containing necessary parameters.
	 * @return {*}  {Promise<AuthResponseDto>} A promise that resolves to an authentication response with the generated authorization code.
	 * @memberof IGenerateAuthCodeUseCase
	 */
	execute(request: AuthCodeRequestCommand): Promise<AuthResponseDto>;
}
