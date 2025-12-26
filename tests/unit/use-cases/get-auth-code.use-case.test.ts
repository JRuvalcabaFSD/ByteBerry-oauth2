import { GenerateAuthCodeUseCase } from '@application';
import { AuthCodeRequestDTO } from '@application';
import { OAuthClientEntity } from '@domain';
import { IAuthCodeRepository, IValidateClientUseCase, ILogger } from '@interfaces';

describe('GenerateAuthCodeUseCase', () => {
	let repository: IAuthCodeRepository;
	let validateClient: IValidateClientUseCase;
	let logger: ILogger;
	let useCase: GenerateAuthCodeUseCase;

	beforeEach(() => {
		repository = {
			save: vi.fn(),
			findByCode: vi.fn(),
			cleanup: vi.fn(),
		};

		validateClient = {
			execute: vi.fn(),
		};

		logger = {
			debug: vi.fn(),
			info: vi.fn(),
			warn: vi.fn(),
			error: vi.fn(),
			log: vi.fn(),
			child: vi.fn(),
		};

		useCase = new GenerateAuthCodeUseCase(repository, validateClient, logger, 1);
	});

	it('should generate authorization code successfully', async () => {
		const request = AuthCodeRequestDTO.fromQuery({
			client_id: 'test-client-id-123',
			redirect_uri: 'https://example.com/callback',
			response_type: 'code',
			code_challenge: 'dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk',
			code_challenge_method: 'S256',
			state: 'random-state',
			scope: 'read write',
		});

		const clientInfo = {
			clientId: 'test-client-id-123',
			clientName: 'Test Client',
			isPublic: true,
			redirectUris: ['https://example.com/callback'],
			grantTypes: ['authorization_code'],
		};

		vi.mocked(validateClient.execute).mockResolvedValue(clientInfo);
		vi.mocked(repository.save).mockResolvedValue();

		const response = await useCase.execute('user-123', request);

		expect(response.code).toBeDefined();
		expect(response.state).toBe('random-state');
		expect(repository.save).toHaveBeenCalled();
		expect(logger.debug).toHaveBeenCalled();
	});

	it('should include state in response when provided', async () => {
		const request = AuthCodeRequestDTO.fromQuery({
			client_id: 'test-client-id-123',
			redirect_uri: 'https://example.com/callback',
			response_type: 'code',
			code_challenge: 'dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk',
			code_challenge_method: 'S256',
			state: 'xyz123',
		});

		const clientInfo = {
			clientId: 'test-client-id-123',
			clientName: 'Test Client',
			isPublic: true,
			redirectUris: ['https://example.com/callback'],
			grantTypes: ['authorization_code'],
		};

		vi.mocked(validateClient.execute).mockResolvedValue(clientInfo);

		const response = await useCase.execute('user-123', request);

		expect(response.state).toBe('xyz123');
	});

	it('should validate client before generating code', async () => {
		const request = AuthCodeRequestDTO.fromQuery({
			client_id: 'test-client-id-123',
			redirect_uri: 'https://example.com/callback',
			response_type: 'code',
			code_challenge: 'dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk',
			code_challenge_method: 'S256',
		});

		const clientInfo = {
			clientId: 'test-client-id-123',
			clientName: 'Test Client',
			isPublic: true,
			redirectUris: ['https://example.com/callback'],
			grantTypes: ['authorization_code'],
		};

		vi.mocked(validateClient.execute).mockResolvedValue(clientInfo);

		await useCase.execute('user-123', request);

		expect(validateClient.execute).toHaveBeenCalledWith({
			clientId: 'test-client-id-123',
			redirectUri: 'https://example.com/callback',
			grantType: 'authorization_code',
		});
	});

	it('should save authorization code entity', async () => {
		const request = AuthCodeRequestDTO.fromQuery({
			client_id: 'test-client-id-123',
			redirect_uri: 'https://example.com/callback',
			response_type: 'code',
			code_challenge: 'dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk',
			code_challenge_method: 'S256',
		});

		const clientInfo = {
			clientId: 'test-client-id-123',
			clientName: 'Test Client',
			isPublic: true,
			redirectUris: ['https://example.com/callback'],
			grantTypes: ['authorization_code'],
		};

		vi.mocked(validateClient.execute).mockResolvedValue(clientInfo);

		await useCase.execute('user-123', request);

		expect(repository.save).toHaveBeenCalledWith(
			expect.objectContaining({
				userId: 'user-123',
				redirectUri: 'https://example.com/callback',
			})
		);
	});
});
