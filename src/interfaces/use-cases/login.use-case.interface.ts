import { LoginRequestDTO, LoginResponseDTO } from '@application';

/**
 * Interface representing the use case for user login.
 *
 * @remarks
 * Implementations of this interface should handle the authentication logic
 * for logging in a user based on the provided credentials.
 *
 * @method execute
 * Executes the login process with the given request data.
 *
 * @param request - The login request data transfer object containing user credentials.
 * @returns A promise that resolves to a login response data transfer object.
 */

export interface ILoginUseCase {
	execute(request: LoginRequestDTO): Promise<LoginResponseDTO>;
}
