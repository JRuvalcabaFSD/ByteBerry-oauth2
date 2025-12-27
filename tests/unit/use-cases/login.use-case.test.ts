import { LoginUseCase } from '@application';
import { LoginRequestDTO } from '@application';
import { UserEntity, SessionEntity } from '@domain';
import { ISessionRepository, IUserRepository, IUuid, ILogger } from '@interfaces';
import { UnauthorizedError } from '@shared';

describe('LoginUseCase', () => {
	let sessionRepository: ISessionRepository;
	let userRepository: IUserRepository;
	let uuid: IUuid;
	let logger: ILogger;
	let useCase: LoginUseCase;

	beforeEach(() => {
		sessionRepository = {
			save: vi.fn(),
			findById: vi.fn(),
			deleteById: vi.fn(),
			deleteByUserId: vi.fn(),
			cleanup: vi.fn(),
			findByUserId: vi.fn(),
			countByUserId: vi.fn(),
			getAuditTrail: vi.fn(),
		};

		userRepository = {
			findByEmail: vi.fn(),
			findByUserName: vi.fn(),
			findById: vi.fn(),
			validateCredentials: vi.fn(),
		};

		uuid = {
			generate: vi.fn().mockReturnValue('session-uuid-123'),
			isValid: vi.fn(),
		};

		logger = {
			debug: vi.fn(),
			info: vi.fn(),
			warn: vi.fn(),
			error: vi.fn(),
			log: vi.fn(),
			child: vi.fn(),
		};

		useCase = new LoginUseCase(sessionRepository, userRepository, uuid, logger);
	});

	it('should login user successfully', async () => {
		const user = UserEntity.create({
			id: 'user-123',
			email: 'test@example.com',
			username: 'testuser',
			passwordHash: 'hashed-password',
			fullName: 'Test User',
			roles: ['user'],
			isActive: true,
			emailVerified: true,
			createdAt: new Date(),
			updatedAt: new Date(),
		});

		const loginRequest = LoginRequestDTO.fromBody({
			emailOrUserName: 'test@example.com',
			password: 'password123',
			rememberMe: 'false',
		});

		vi.mocked(userRepository.validateCredentials).mockResolvedValue(user);
		vi.mocked(sessionRepository.save).mockResolvedValue();

		const response = await useCase.execute(loginRequest);

		expect(response.user.email).toBe('test@example.com');
		expect(response.sessionId).toBe('session-uuid-123');
		expect(sessionRepository.save).toHaveBeenCalled();
	});

	it('should throw UnauthorizedError for invalid credentials', async () => {
		const loginRequest = LoginRequestDTO.fromBody({
			emailOrUserName: 'test@example.com',
			password: 'wrongpassword',
		});

		vi.mocked(userRepository.validateCredentials).mockResolvedValue(null);

		await expect(useCase.execute(loginRequest)).rejects.toThrow(UnauthorizedError);
		expect(logger.warn).toHaveBeenCalled();
	});

	it('should throw UnauthorizedError for inactive user', async () => {
		const inactiveUser = UserEntity.create({
			id: 'user-123',
			email: 'test@example.com',
			username: 'testuser',
			passwordHash: 'hashed-password',
			fullName: 'Test User',
			roles: ['user'],
			isActive: false,
			emailVerified: true,
			createdAt: new Date(),
			updatedAt: new Date(),
		});

		const loginRequest = LoginRequestDTO.fromBody({
			emailOrUserName: 'test@example.com',
			password: 'password123',
		});

		vi.mocked(userRepository.validateCredentials).mockResolvedValue(inactiveUser);

		await expect(useCase.execute(loginRequest)).rejects.toThrow(UnauthorizedError);
	});

	it('should create extended session when rememberMe is true', async () => {
		const user = UserEntity.create({
			id: 'user-123',
			email: 'test@example.com',
			username: 'testuser',
			passwordHash: 'hashed-password',
			fullName: 'Test User',
			roles: ['user'],
			isActive: true,
			emailVerified: true,
			createdAt: new Date(),
			updatedAt: new Date(),
		});

		const loginRequest = LoginRequestDTO.fromBody({
			emailOrUserName: 'test@example.com',
			password: 'password123',
			rememberMe: 'true',
		});

		vi.mocked(userRepository.validateCredentials).mockResolvedValue(user);
		vi.mocked(sessionRepository.save).mockResolvedValue();

		await useCase.execute(loginRequest);

		expect(sessionRepository.save).toHaveBeenCalledWith(
			expect.objectContaining({
				userId: 'user-123',
			})
		);
	});
});
