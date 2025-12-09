import { ValidateClientRequestDto, ValidateClientResponseDto } from '@application';

/**
 * Use case interface for validating client codes in OAuth2 flow.
 *
 * @interface IValidateCodeUseCase
 *
 * @remarks
 * This interface defines the contract for validating client authorization codes.
 * Implementations should handle the validation logic for OAuth2 client credentials
 * and authorization codes.
 *
 * @example
 * ```typescript
 * class ValidateCodeUseCase implements IValidateCodeUseCase {
 *   async execute(request: ValidateClientRequestDto): Promise<ValidateClientResponseDto> {
 *     // Validation logic here
 *   }
 * }
 * ```
 */

export interface IValidateClientUseCase {
	/**
	 * Executes the use case to validate a client code.
	 *
	 * @param {ValidateClientRequestDto} request - The client validation request data.
	 * @return {*}  {Promise<ValidateClientResponseDto>} - A promise that resolves to the client validation response.
	 * @memberof IValidateCodeUseCase
	 */
	execute(request: ValidateClientRequestDto): Promise<ValidateClientResponseDto>;
}
