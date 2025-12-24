import { LoginRequestDTO, LoginResponseDTO } from '@application';
import { SessionEntity } from '@domain';
import type { ILogger, ILoginUseCase, ISessionRepository, IUserRepository, IUuid } from '@interfaces';
import { LogContextClass, LogContextMethod, UnauthorizedError, LoginValidationError } from '@shared';

/**
 * Use case for handling user login operations.
 *
 * The `LoginUseCase` class encapsulates the authentication logic for validating user credentials,
 * creating user sessions, and returning session information. It supports session TTL customization
 * based on the "remember me" flag and logs key events for auditing and debugging.
 *
 * @remarks
 * - Validates login requests and user credentials.
 * - Handles both standard and extended session durations.
 * - Throws specific errors for validation failures and unauthorized access.
 * - Persists session data and returns a response DTO with user and session details.
 *
 * @example
 * ```typescript
 * const useCase = new LoginUseCase(sessionRepo, userRepo, uuidService, logger);
 * const response = await useCase.execute(loginRequestDto);
 * ```
 *
 * @see LoginRequestDTO
 * @see LoginResponseDTO
 * @see ISessionRepository
 * @see IUserRepository
 * @see IUuid
 * @see ILogger
 */

@LogContextClass()
export class LoginUseCase implements ILoginUseCase {
	private readonly DEFAULT_SESSION_TTL = 3600;
	private readonly EXTENDED_SESSION_TTL = 30 * 24 * 3600;

	/**
	 * Creates an instance of the LoginUseCase.
	 *
	 * @param sessionRepository - Repository for managing user sessions.
	 * @param userRepository - Repository for accessing user data.
	 * @param uuid - Service for generating unique identifiers.
	 * @param logger - Logger service for application logging.
	 */
	constructor(
		private readonly sessionRepository: ISessionRepository,
		private readonly userRepository: IUserRepository,
		private readonly uuid: IUuid,
		private readonly logger: ILogger
	) {}

	/**
	 * Handles the login process for a user.
	 *
	 * @param request - The login request data transfer object containing user credentials and additional metadata.
	 * @returns A promise that resolves to a LoginResponseDTO containing user and session information upon successful authentication.
	 * @throws {LoginValidationError} If the login request fails validation.
	 * @throws {UnAuthorizedError} If the credentials are invalid or the user account is inactive.
	 *
	 * @remarks
	 * - Logs various stages of the login attempt for debugging and auditing.
	 * - Validates the login request and user credentials.
	 * - Creates a new session with a TTL based on the "remember me" flag.
	 * - Persists the session and returns the response DTO.
	 */

	@LogContextMethod()
	public async execute(request: LoginRequestDTO): Promise<LoginResponseDTO> {
		this.logger.debug('Login attempt', {
			emailOrPassword: request.emailOrUserName,
			rememberMe: request.rememberMe,
			ipAddress: request.ipAddress,
		});

		const validateErrors = request.validate();
		if (validateErrors.length > 0) {
			this.logger.warn('Login validation failed', { errors: validateErrors });
			throw new LoginValidationError('Invalid login request', validateErrors);
		}

		const user = await this.userRepository.validateCredentials(request.emailOrUserName, request.password);

		if (!user) {
			this.logger.warn('Login failed - invalid credentials', {
				emailOrPassword: request.emailOrUserName,
				ipAddress: request.ipAddress,
			});
			throw new UnauthorizedError('Invalid email/username or password');
		}

		if (!user.canLogin()) {
			this.logger.warn('Login failed - user inactive');
			throw new UnauthorizedError('User account is inactive');
		}

		const sessionTTl = request.rememberMe ? this.EXTENDED_SESSION_TTL : this.DEFAULT_SESSION_TTL;

		const session = SessionEntity.create({
			id: this.uuid.generate(),
			userId: user.id,
			ttlSeconds: sessionTTl,
			userAgent: request.userAgent ?? null,
			ipAddress: request.ipAddress ?? null,
			metadata: {
				loginMethod: 'password',
				rememberMe: request.rememberMe,
				loginAt: new Date().toISOString(),
			},
		});

		await this.sessionRepository.save(session);

		this.logger.debug('Login successful', {
			userId: user.id,
			email: user.email,
			sessionId: session.id,
			expiresAt: session.expiresAt.toISOString(),
			rememberMe: request.rememberMe,
		});

		return LoginResponseDTO.fromEntities(user, session);
	}
}
