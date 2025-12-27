import { ValidateClientRequestDto, ValidateClientResponseDto } from '@application';

/**
 * Interface for the use case that validates an OAuth2 client.
 *
 * @remarks
 * This use case is responsible for validating the credentials and details of a client
 * attempting to interact with the OAuth2 system.
 *
 * @method execute
 * @param data - The request data containing client information to be validated.
 * @returns A promise that resolves to the response containing the validation result.
 */

export interface IValidateClientUseCase {
	execute(data: ValidateClientRequestDto): Promise<ValidateClientResponseDto>;
}
