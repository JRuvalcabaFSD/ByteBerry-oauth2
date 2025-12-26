import { ExchangeTokenUseCase } from '@application';
import { TokenRequestDTO } from '@application';
import { AuthCodeEntity, UserEntity, ClientIdVO, CodeChallengeVO } from '@domain';
import type { IAuthCodeRepository, IUserRepository, IOAuthClientRepository, IJwtService, IPkceVerifierUseCase, ILogger, IContainer } from '@interfaces';
import { InvalidAuthCodeError, OAuthError } from '@shared';

describe('ExchangeTokenUseCase', () => {
	let codeRepository: IAuthCodeRepository;
	let userRepository: IUserRepository;
	let clientRepository: IOAuthClientRepository;
	let jwtService: IJwtService;
	let pkceVerifier: IPkceVerifierUseCase;
	let logger: ILogger;
	let container: IContainer;
	let useCase: ExchangeTokenUseCase;

	beforeEach(() => {
		codeRepository = {
			save: vi.fn(),
			findByCode: vi.fn(),
			cleanup: vi.fn(),
		};

		userRepository = {
			findByEmail: vi.fn(),
			findByUserName: vi.fn(),
			findById: vi.fn(),
			validateCredentials: vi.fn(),
		};

		clientRepository = {
			findByClientId: vi.fn(),
		};

		jwtService = {
			generateAccessToken: vi.fn().mockReturnValue('generated-jwt-token'),
			verifyToken: vi.fn(),
			decodeToken: vi.fn(),
		};

		pkceVerifier = {
			verify: vi.fn().mockReturnValue(true),
		};

		logger = {
			debug: vi.fn(),
			info: vi.fn(),
			warn: vi.fn(),
			error: vi.fn(),
			log: vi.fn(),
			child: vi.fn(),
		};

		container = {
			resolve: vi.fn((token: string) => {
				const services: Record<string, unknown> = {
					AuthCodeRepository: codeRepository,
					UserRepository: userRepository,
					OAuthClientRepository: clientRepository,
					JwtService: jwtService,
					PKCEVerifierUseCase: pkceVerifier,
					Logger: logger,
					Config: { jwtAccessTokenExpiresIn: 900 },
				};
				return services[token];
			}),
			register: vi.fn(),
			registerSingleton: vi.fn(),
			registerInstance: vi.fn(),
			isRegistered: vi.fn(),
		} as unknown as IContainer;

		useCase = new ExchangeTokenUseCase(container);
	});

	it('should exchange authorization code for access token successfully', async () => {
		const request = TokenRequestDTO.fromBody({
			grant_type: 'authorization_code',
			code: 'valid-auth-code',
			redirect_uri: 'https://example.com/callback',
			client_id: 'test-client-id-12345678',
			code_verifier: 'dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk',
		});

		const authCode = AuthCodeEntity.create({
			code: 'valid-auth-code',
			userId: 'user-123',
			clientId: ClientIdVO.create('test-client-id-12345678'),
			redirectUri: 'https://example.com/callback',
			codeChallenge: CodeChallengeVO.create('dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk', 'S256'),
			scope: 'read write',
			expirationMinutes: 10,
		});

		const user = UserEntity.create({
			id: 'user-123',
			email: 'test@example.com',
			username: 'testuser',
			passwordHash: 'hashed',
			fullName: 'Test User',
			roles: ['user'],
			isActive: true,
			emailVerified: true,
			createdAt: new Date(),
			updatedAt: new Date(),
		});

		vi.mocked(codeRepository.findByCode).mockResolvedValue(authCode);
		vi.mocked(userRepository.findById).mockResolvedValue(user);

		const response = await useCase.execute(request);

		expect(response.toJson().access_token).toBe('generated-jwt-token');
		expect(response.toJson().token_type).toBe('Bearer');
		expect(codeRepository.save).toHaveBeenCalled();
	});

	it('should throw error for invalid authorization code', async () => {
		const request = TokenRequestDTO.fromBody({
			grant_type: 'authorization_code',
			code: 'invalid-code',
			redirect_uri: 'https://example.com/callback',
			client_id: 'test-client-id-12345678',
			code_verifier: 'dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk',
		});

		vi.mocked(codeRepository.findByCode).mockResolvedValue(null);

		await expect(useCase.execute(request)).rejects.toThrow(InvalidAuthCodeError);
	});

	it('should throw error for expired authorization code', async () => {
		const request = TokenRequestDTO.fromBody({
			grant_type: 'authorization_code',
			code: 'expired-code',
			redirect_uri: 'https://example.com/callback',
			client_id: 'test-client-id-12345678',
			code_verifier: 'dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk',
		});

		const expiredCode = AuthCodeEntity.create({
			code: 'expired-code',
			userId: 'user-123',
			clientId: ClientIdVO.create('test-client-id-12345678'),
			redirectUri: 'https://example.com/callback',
			codeChallenge: CodeChallengeVO.create('dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk', 'S256'),
			expirationMinutes: -1, // Already expired
		});

		vi.mocked(codeRepository.findByCode).mockResolvedValue(expiredCode);

		await expect(useCase.execute(request)).rejects.toThrow(InvalidAuthCodeError);
	});

	it('should throw error for PKCE verification failure', async () => {
		const request = TokenRequestDTO.fromBody({
			grant_type: 'authorization_code',
			code: 'valid-code',
			redirect_uri: 'https://example.com/callback',
			client_id: 'test-client-id-12345678',
			code_verifier: 'wrong-verifier-value-here-12345678901234567890',
		});

		const authCode = AuthCodeEntity.create({
			code: 'valid-code',
			userId: 'user-123',
			clientId: ClientIdVO.create('test-client-id-12345678'),
			redirectUri: 'https://example.com/callback',
			codeChallenge: CodeChallengeVO.create('dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk', 'S256'),
			expirationMinutes: 10,
		});

		vi.mocked(codeRepository.findByCode).mockResolvedValue(authCode);
		vi.mocked(pkceVerifier.verify).mockReturnValue(false);

		await expect(useCase.execute(request)).rejects.toThrow(InvalidAuthCodeError);
	});

	it('should throw error when user not found', async () => {
		const request = TokenRequestDTO.fromBody({
			grant_type: 'authorization_code',
			code: 'valid-code',
			redirect_uri: 'https://example.com/callback',
			client_id: 'test-client-id-12345678',
			code_verifier: 'dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk',
		});

		const authCode = AuthCodeEntity.create({
			code: 'valid-code',
			userId: 'non-existent-user',
			clientId: ClientIdVO.create('test-client-id-12345678'),
			redirectUri: 'https://example.com/callback',
			codeChallenge: CodeChallengeVO.create('dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk', 'S256'),
			expirationMinutes: 10,
		});

		vi.mocked(codeRepository.findByCode).mockResolvedValue(authCode);
		vi.mocked(userRepository.findById).mockResolvedValue(null);

		await expect(useCase.execute(request)).rejects.toThrow(OAuthError);
	});
});
