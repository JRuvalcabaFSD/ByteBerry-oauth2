import { hash } from 'bcrypt';

import { CreateUserRequestDto, CreateUserResponseDto } from '..';
import { ILogger, IUserRepository, IUuid } from '@/interfaces';
import { getErrMsg, InvalidRequestError, LogContextClass, LogContextMethod } from '@/shared';
import { UserEntity } from '@/domain';

/**
 * Use case for creating a new user in the system.
 *
 * This class handles the business logic for registering a new user, including:
 * - Validating the request data (email and password are required).
 * - Checking for existing users with the same email.
 * - Hashing the user's password.
 * - Creating a new user entity and persisting it via the repository.
 * - Logging relevant events and errors.
 *
 * @constructor
 * @param repository - The user repository for data persistence and retrieval.
 * @param logger - Logger instance for debug and error logging.
 * @param uuid - UUID generator for creating unique user IDs.
 *
 * @method execute
 * Executes the user creation process.
 * @param request - The data required to create a new user.
 * @returns A promise resolving to the response DTO containing user details.
 * @throws InvalidRequestError If the request is invalid or the user already exists.
 * @throws Error For unexpected errors during user creation.
 */

@LogContextClass()
export class CreateUserUseCase {
  /**
   * Creates an instance of the use case with required dependencies.
   *
   * @param repository - The user repository for data access operations.
   * @param logger - The logger instance for logging activities.
   * @param uuid - The UUID generator for creating unique identifiers.
   */

  constructor(
    private readonly repository: IUserRepository,
    private readonly logger: ILogger,
    private readonly uuid: IUuid
  ) {}

  /**
   * Creates a new user with the provided email, username, and password.
   *
   * @param request - The data required to create a new user, including email, password, and optional username.
   * @returns A promise that resolves to a response DTO containing the new user's ID, email, username, and creation timestamp.
   * @throws {InvalidRequestError} If the email or password is missing, or if a user with the given email already exists.
   * @throws {Error} For any unexpected errors during user creation.
   */

  @LogContextMethod()
  public async execute(request: CreateUserRequestDto): Promise<CreateUserResponseDto> {
    this.logger.debug('Creating new user', { email: request.email });

    try {
      if (!request.email || !request.password) throw new InvalidRequestError('Email and password are required');

      const existingUser = await this.repository.findByEmail(request.email);
      if (existingUser) throw new InvalidRequestError('User with this email already exists');

      const passwordHash = await hash(request.password, 10);
      const user = UserEntity.create({
        id: this.uuid.generate(),
        email: request.email,
        username: request.username ?? null,
        passwordHash,
      });

      await this.repository.register(user);

      this.logger.debug('User created successfully', { userId: user.id, email: user.email });

      return {
        userId: user.id,
        email: user.email,
        username: user.username,
        createdAt: user.createdAt.toISOString(),
      };
    } catch (error) {
      if (error instanceof InvalidRequestError) {
        throw error;
      }

      this.logger.error('Unexpected error creating user', { error: getErrMsg(error), email: request.email });
      throw error;
    }
  }
}
