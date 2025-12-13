import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ValidateClientUseCase } from '@application';
import { OAuthClientEntity } from '@domain';
import { IOAthClientRepository, ILogger } from '@interfaces';
import { InvalidRequestError, OAuthError, UnauthorizedClientError } from '@shared';

// Mocks
const mockRepository: IOAthClientRepository = {
	findByClientId: vi.fn(),
};

const mockLogger: ILogger = {
	debug: vi.fn(),
	info: vi.fn(),
	warn: vi.fn(),
	error: vi.fn(),
	log: vi.fn(),
	child: vi.fn().mockReturnThis(),
};

describe('ValidateClientUseCase', () => {
	let useCase: ValidateClientUseCase;

	beforeEach(() => {
		vi.clearAllMocks();
		useCase = new ValidateClientUseCase(mockRepository, mockLogger);
	});

	describe('execute', () => {
		const validRequest = {
			clientId: 'test-client-id',
			redirectUri: 'https://example.com/callback',
			grandType: 'authorization_code'
		};

		const mockClient = OAuthClientEntity.create({
			id: '123',
			clientId: 'test-client-id',
			clientName: 'Test Client',
			redirectUris: ['https://example.com/callback'],
			grantTypes: ['authorization_code', 'refresh_token'],
			isPublic: false
		});

		it('should validate client successfully with all parameters', async () => {
			vi.mocked(mockRepository.findByClientId).mockResolvedValue(mockClient);

			const result = await useCase.execute(validRequest);

			expect(result).toEqual({
				clientId: 'test-client-id',
				clientName: 'Test Client',
				isPublic: false,
				redirectUris: ['https://example.com/callback'],
				grantTypes: ['authorization_code', 'refresh_token']
			});

			expect(mockRepository.findByClientId).toHaveBeenCalledWith('test-client-id');
			expect(mockLogger.debug).toHaveBeenCalledWith('Validating OAuth client', { clientId: 'test-client-id' });
			expect(mockLogger.debug).toHaveBeenCalledWith('Client validate successfully', {
				clientId: 'test-client-id',
				clientName: 'Test Client'
			});
		});

		it('should validate client successfully without optional parameters', async () => {
			vi.mocked(mockRepository.findByClientId).mockResolvedValue(mockClient);

			const result = await useCase.execute({ clientId: 'test-client-id' });

			expect(result).toEqual({
				clientId: 'test-client-id',
				clientName: 'Test Client',
				isPublic: false,
				redirectUris: ['https://example.com/callback'],
				grantTypes: ['authorization_code', 'refresh_token']
			});

			expect(mockRepository.findByClientId).toHaveBeenCalledWith('test-client-id');
		});

		it('should throw InvalidRequestError when clientId is missing', async () => {
			await expect(useCase.execute({ clientId: '' }))
				.rejects
				.toThrow(InvalidRequestError);

			expect(mockRepository.findByClientId).not.toHaveBeenCalled();
		});

		it('should throw UnauthorizedClientError when client is not found', async () => {
			vi.mocked(mockRepository.findByClientId).mockResolvedValue(null);

			await expect(useCase.execute(validRequest))
				.rejects
				.toThrow(UnauthorizedClientError);

			expect(mockRepository.findByClientId).toHaveBeenCalledWith('test-client-id');
			expect(mockLogger.warn).toHaveBeenCalledWith('Client not found', { clientId: 'test-client-id' });
		});

		it('should warn and continue when redirect URI is invalid', async () => {
			const clientWithDifferentUris = OAuthClientEntity.create({
				...mockClient,
				redirectUris: ['https://different.com/callback']
			});
			vi.mocked(mockRepository.findByClientId).mockResolvedValue(clientWithDifferentUris);

			const result = await useCase.execute({
				...validRequest,
				redirectUri: 'https://invalid.com/callback'
			});

			expect(result).toBeDefined();
			expect(mockLogger.warn).toHaveBeenCalledWith('Invalid redirect URI', {
				clientId: 'test-client-id',
				redirectUri: 'https://invalid.com/callback'
			});
		});

		it('should throw InvalidRequestError when grant type is not supported', async () => {
			const clientWithLimitedGrants = OAuthClientEntity.create({
				...mockClient,
				grantTypes: ['client_credentials']
			});
			vi.mocked(mockRepository.findByClientId).mockResolvedValue(clientWithLimitedGrants);

			await expect(useCase.execute({
				...validRequest,
				grandType: 'authorization_code'
			})).rejects.toThrow(InvalidRequestError);

			expect(mockLogger.warn).toHaveBeenCalledWith('Unsupported grant type', {
				clientId: 'test-client-id',
				grandType: 'authorization_code'
			});
		});

		it('should handle repository errors and rethrow non-OAuth errors', async () => {
			const genericError = new Error('Database connection failed');
			vi.mocked(mockRepository.findByClientId).mockRejectedValue(genericError);

			await expect(useCase.execute(validRequest))
				.rejects
				.toThrow('Database connection failed');

			expect(mockLogger.error).toHaveBeenCalledWith('Unexpected error validating client', {
				error: 'Database connection failed',
				clientId: 'test-client-id'
			});
		});

		it('should not log error for OAuth errors', async () => {
			vi.mocked(mockRepository.findByClientId).mockResolvedValue(null);

			await expect(useCase.execute(validRequest))
				.rejects
				.toThrow(UnauthorizedClientError);

			expect(mockLogger.error).not.toHaveBeenCalled();
		});
	});
});
