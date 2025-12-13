import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GenerateAuthCodeUseCase, AuthCodeRequestCommand } from '@application';
import { InvalidRequestError } from '@shared';
import type {
	IAuthCodeRepository,
	IValidateClientUseCase,
	ILogger
} from '@interfaces';

// Mocks
const mockRepository: IAuthCodeRepository = {
	findByCode: vi.fn(),
	save: vi.fn(),
	cleanup: vi.fn()
};

const mockValidateClient: IValidateClientUseCase = {
	execute: vi.fn()
};

const mockLogger: ILogger = {
	debug: vi.fn(),
	info: vi.fn(),
	warn: vi.fn(),
	error: vi.fn(),
	log: vi.fn(),
	child: vi.fn(() => mockLogger)
};

describe('GenerateAuthCodeUseCase', () => {
	let useCase: GenerateAuthCodeUseCase;
	let validCommand: any;

	beforeEach(() => {
		vi.clearAllMocks();
		useCase = new GenerateAuthCodeUseCase(
			mockRepository,
			mockValidateClient,
			mockLogger
		);
		validCommand = {
			response_type: 'code',
			client_id: 'test-client-id',
			redirect_uri: 'https://example.com/callback',
			code_challenge: 'E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM',
			code_challenge_method: 'S256' as const,
			scope: 'read write',
			state: 'xyz'
		};
	});

		it('should generate authorization code successfully', async () => {
			// Setup
			const clientInfo = {
				clientId: 'test-client-id',
				clientName: 'Test Client',
				isPublic: true,
				redirectUris: ['https://example.com/callback'],
				grantTypes: ['authorization_code']
			};

			vi.mocked(mockValidateClient.execute).mockResolvedValue(clientInfo);
			vi.mocked(mockRepository.save).mockResolvedValue(undefined);

			// Execute
			const result = await useCase.execute(validCommand);

			// Verify
			expect(result).toEqual({
				code: expect.any(String),
				state: 'xyz'
			});

			expect(result.code).toHaveLength(44); // Base64 encoded 32 bytes = 44 chars

			expect(mockValidateClient.execute).toHaveBeenCalledWith({
				clientId: 'test-client-id',
				redirectUri: 'https://example.com/callback',
				grandType: 'authorization_code'
			});
			expect(mockLogger.debug).toHaveBeenCalledWith(
				expect.stringContaining('Generating authorization code'),
				{ client_id: 'test-client-id' }
			);

			expect(mockLogger.debug).toHaveBeenCalledWith(
				expect.stringContaining('Client validated for authorization'),
				expect.objectContaining({
					clientId: 'test-client-id',
					redirectUri: expect.any(Array),
					grandType: expect.any(Array)
				})
			);

			expect(mockLogger.debug).toHaveBeenCalledWith(
				expect.stringContaining('Authorization code generated successfully'),
				expect.objectContaining({
					client_id: 'test-client-id',
					code_length: 44
				})
			);
		});

		it('should generate authorization code without scope and state', async () => {
			// Setup
			const commandWithoutOptionals = {
				response_type: 'code',
				client_id: 'test-client-id',
				redirect_uri: 'https://example.com/callback',
				code_challenge: 'E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM',
				code_challenge_method: 'S256' as const
			};

			const clientInfo = {
				clientId: 'test-client-id',
				clientName: 'Test Client',
				isPublic: true,
				redirectUris: ['https://example.com/callback'],
				grantTypes: ['authorization_code']
			};

			vi.mocked(mockValidateClient.execute).mockResolvedValue(clientInfo);

			// Execute
			const result = await useCase.execute(commandWithoutOptionals);

			// Verify
			expect(result).toEqual({
				code: expect.any(String),
				state: undefined
			});
		});

		it('should log successful code generation', async () => {
			const clientInfo = {
				clientId: 'test-client-id',
				clientName: 'Test Client',
				isPublic: true,
				redirectUris: ['https://example.com/callback'],
				grantTypes: ['authorization_code']
			};

			vi.mocked(mockValidateClient.execute).mockResolvedValue(clientInfo);
			vi.mocked(mockRepository.save).mockResolvedValue(undefined);

			await useCase.execute(validCommand);

			expect(mockLogger.debug).toHaveBeenCalledWith(
				expect.stringContaining('Authorization code generated successfully'),
				expect.objectContaining({
					client_id: 'test-client-id',
					code_length: 44 // Base64 encoded 32 bytes
				})
			);
		});
		it('should throw InvalidRequestError for invalid response_type', async () => {
			const invalidCommand = {
				...validCommand,
				response_type: 'token'
			};

			await expect(useCase.execute(invalidCommand as any))
				.rejects
				.toThrow(InvalidRequestError);

			await expect(useCase.execute(invalidCommand as any))
				.rejects
				.toThrow('Only response_type=code is supported');
		});

		it('should throw InvalidRequestError for missing code_challenge', async () => {
			const invalidCommand = {
				...validCommand,
				code_challenge: ''
			};

			await expect(useCase.execute(invalidCommand as any))
				.rejects
				.toThrow(InvalidRequestError);

			await expect(useCase.execute(invalidCommand as any))
				.rejects
				.toThrow('code_challenge and code_challenge_method are required (PKCE)');
		});

		it('should throw InvalidRequestError for missing code_challenge_method', async () => {
			const invalidCommand = {
				...validCommand,
				code_challenge_method: ''
			};

			await expect(useCase.execute(invalidCommand as any))
				.rejects
				.toThrow(InvalidRequestError);
		});

		it('should throw InvalidRequestError for missing redirect_uri', async () => {
			const invalidCommand = {
				...validCommand,
				redirect_uri: ''
			};

			await expect(useCase.execute(invalidCommand as any))
				.rejects
				.toThrow(InvalidRequestError);

			await expect(useCase.execute(invalidCommand as any))
				.rejects
				.toThrow('redirect_uri are required (PKCE)');
		});

		it('should throw InvalidRequestError when client validation fails', async () => {
			const error = new Error('Client not found');
			vi.mocked(mockValidateClient.execute).mockRejectedValue(error);

			await expect(useCase.execute(validCommand))
				.rejects
				.toThrow(InvalidRequestError);

			await expect(useCase.execute(validCommand))
				.rejects
				.toThrow('Client not found');
		});

		it('should throw InvalidRequestError for invalid client_id format', async () => {
			const invalidCommand = {
				...validCommand,
				client_id: 'short' // Too short for ClientIdVO
			};

			// Mock client validation to fail with VO creation
			vi.mocked(mockValidateClient.execute).mockImplementation(async (req) => {
				// This will trigger the ClientIdVO.create error
				throw new Error('Client ID must be between 8 and 128 characters');
			});

			await expect(useCase.execute(invalidCommand))
				.rejects
				.toThrow(InvalidRequestError);
		});

		it('should throw InvalidRequestError for invalid code_challenge format', async () => {
			const invalidCommand = {
				...validCommand,
				code_challenge: 'short' // Too short for CodeChallengeVO
			};

			const clientInfo = {
				clientId: 'test-client-id',
				clientName: 'Test Client',
				isPublic: true,
				redirectUris: ['https://example.com/callback'],
				grantTypes: ['authorization_code']
			};

			vi.mocked(mockValidateClient.execute).mockResolvedValue(clientInfo);

			await expect(useCase.execute(invalidCommand))
				.rejects
				.toThrow(InvalidRequestError);
		});

		it('should handle repository save failures', async () => {
			const clientInfo = {
				clientId: 'test-client-id',
				clientName: 'Test Client',
				isPublic: true,
				redirectUris: ['https://example.com/callback'],
				grantTypes: ['authorization_code']
			};

			vi.mocked(mockValidateClient.execute).mockResolvedValue(clientInfo);
			const saveError = new Error('Database error');
			vi.mocked(mockRepository.save).mockRejectedValue(saveError);

			await expect(useCase.execute(validCommand))
				.rejects
				.toThrow(saveError);

			expect(mockLogger.error).toHaveBeenCalledWith(
				expect.stringContaining('Unexpected error generating authorization code'),
				{
					error: 'Database error',
					client_id: 'test-client-id'
				}
			);
		});

	it('should log successful code generation', async () => {
		const clientInfo = {
			clientId: 'test-client-id',
			clientName: 'Test Client',
			isPublic: true,
			redirectUris: ['https://example.com/callback'],
			grantTypes: ['authorization_code']
		};

		vi.mocked(mockValidateClient.execute).mockResolvedValue(clientInfo);
		vi.mocked(mockRepository.save).mockResolvedValue(undefined);

		await useCase.execute(validCommand);

		expect(mockLogger.debug).toHaveBeenCalledWith(
			expect.stringContaining('Authorization code generated successfully'),
			expect.objectContaining({
				client_id: 'test-client-id',
				code_length: 44 // Base64 encoded 32 bytes
			})
		);
	});

		it('should handle plain code challenge method', async () => {
			const plainCommand = {
				...validCommand,
				code_challenge_method: 'plain' as const,
				code_challenge: 'plain-verifier-12345678901234567890123456789012' // Valid length for plain
			};

			const clientInfo = {
				clientId: 'test-client-id',
				clientName: 'Test Client',
				isPublic: true,
				redirectUris: ['https://example.com/callback'],
				grantTypes: ['authorization_code']
			};

			vi.mocked(mockValidateClient.execute).mockResolvedValue(clientInfo);

			const result = await useCase.execute(plainCommand);

			expect(result.code).toBeDefined();
			expect(result.state).toBe('xyz');
		});
	});
