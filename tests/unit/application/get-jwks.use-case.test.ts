import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GetJwksUseCase } from '@application';
import { IJwksService, JwksResponse } from '@interfaces';

// Mocks
const mockJwksService: IJwksService = {
	getJwks: vi.fn(),
};

describe('GetJwksUseCase', () => {
	let useCase: GetJwksUseCase;

	beforeEach(() => {
		vi.clearAllMocks();
		useCase = new GetJwksUseCase(mockJwksService);
	});

	describe('execute', () => {
		const mockJwksResponse: JwksResponse = {
			keys: [
				{
					kty: 'RSA',
					kid: 'test-key-1',
					use: 'sig',
					alg: 'RS256',
					n: 'mock-modulus-value',
					e: 'AQAB'
				}
			]
		};

		it('should return JWKS from service successfully', async () => {
			vi.mocked(mockJwksService.getJwks).mockResolvedValue(mockJwksResponse);

			const result = await useCase.execute();

			expect(result).toEqual(mockJwksResponse);
			expect(mockJwksService.getJwks).toHaveBeenCalledOnce();
		});

		it('should return JWKS with multiple keys', async () => {
			const multipleKeysResponse: JwksResponse = {
				keys: [
					{
						kty: 'RSA',
						kid: 'test-key-1',
						use: 'sig',
						alg: 'RS256',
						n: 'mock-modulus-value-1',
						e: 'AQAB'
					},
					{
						kty: 'RSA',
						kid: 'test-key-2',
						use: 'sig',
						alg: 'RS256',
						n: 'mock-modulus-value-2',
						e: 'AQAB'
					}
				]
			};

			vi.mocked(mockJwksService.getJwks).mockResolvedValue(multipleKeysResponse);

			const result = await useCase.execute();

			expect(result).toEqual(multipleKeysResponse);
			expect(result.keys).toHaveLength(2);
			expect(mockJwksService.getJwks).toHaveBeenCalledOnce();
		});

		it('should return empty JWKS when no keys are available', async () => {
			const emptyJwksResponse: JwksResponse = {
				keys: []
			};

			vi.mocked(mockJwksService.getJwks).mockResolvedValue(emptyJwksResponse);

			const result = await useCase.execute();

			expect(result).toEqual(emptyJwksResponse);
			expect(result.keys).toHaveLength(0);
			expect(mockJwksService.getJwks).toHaveBeenCalledOnce();
		});

		it('should handle service errors', async () => {
			const serviceError = new Error('Failed to load JWKS');
			vi.mocked(mockJwksService.getJwks).mockRejectedValue(serviceError);

			await expect(useCase.execute())
				.rejects
				.toThrow('Failed to load JWKS');

			expect(mockJwksService.getJwks).toHaveBeenCalledOnce();
		});

		it('should propagate service errors without modification', async () => {
			const customError = new Error('Key generation failed');
			vi.mocked(mockJwksService.getJwks).mockRejectedValue(customError);

			await expect(useCase.execute())
				.rejects
				.toBe(customError);

			expect(mockJwksService.getJwks).toHaveBeenCalledOnce();
		});
	});
});
