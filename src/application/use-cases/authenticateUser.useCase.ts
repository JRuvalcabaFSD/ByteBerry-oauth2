import { ILogger, IUserRepository } from '@/interfaces';
import { AuthenticateUserRequestDto, AuthenticateUserResponseDto } from '../dtos/user.dto';
import { getErrMsg, InvalidClientError, InvalidGrantError, InvalidRequestError, LogContextClass, LogContextMethod } from '@/shared';

/**
 * Use case for authenticating a user with email and password credentials.
 *
 * This class handles the authentication logic by validating the provided credentials,
 * interacting with the user repository, and logging relevant events. It throws
 * appropriate OAuth2 errors for invalid requests or authentication failures.
 *
 * @remarks
 * - Throws {@link InvalidClientError} if email or password is missing.
 * - Throws {@link InvalidGrantError} if authentication fails.
 * - Logs debug, warning, and error messages during the authentication process.
 *
 * @param repository - The user repository used to authenticate users.
 * @param logger - The logger instance for logging authentication events.
 *
 * @method execute
 * Authenticates a user based on the provided request DTO.
 *
 * @param request - The authentication request containing email and password.
 * @returns A promise that resolves to an authentication response DTO with user details.
 * @throws InvalidClientError | InvalidGrantError | Error
 */

@LogContextClass()
export class AuthenticateUserUseCase {
  /**
   * Creates an instance of the use case with the required dependencies.
   *
   * @param repository - The user repository used for accessing user data.
   * @param logger - The logger instance for logging authentication events and errors.
   */

  constructor(
    private readonly repository: IUserRepository,
    private readonly logger: ILogger
  ) {}

  /**
   * Authenticates a user with the provided email and password.
   *
   * @param request - The authentication request containing the user's email and password.
   * @returns A promise that resolves to an object containing the authenticated user's ID, email, and username.
   * @throws {InvalidClientError} If the email or password is missing from the request.
   * @throws {InvalidGrantError} If authentication fails due to invalid credentials.
   * @throws {InvalidRequestError} If the request is invalid.
   * @throws {Error} For any unexpected errors during authentication.
   */

  @LogContextMethod()
  public async execute(request: AuthenticateUserRequestDto): Promise<AuthenticateUserResponseDto> {
    this.logger.debug('Authenticating user', { email: request.email });

    try {
      if (!request.email || !request.password) throw new InvalidClientError('Email and password are required');

      const user = await this.repository.authenticate(request.email, request.password);
      if (!user) {
        this.logger.warn('Authentication failed', { email: request.email });
        throw new InvalidGrantError('Invalid email or password');
      }

      this.logger.debug('User authenticated successfully', { userId: user.id, email: user.email });
      return {
        userId: user.id,
        email: user.email,
        username: user.username,
      };
    } catch (error) {
      if (error instanceof InvalidRequestError || error instanceof InvalidGrantError) {
        throw error;
      }

      this.logger.error('Unexpected error during authentication', { error: getErrMsg(error), email: request.email });
      throw error;
    }
  }
}
