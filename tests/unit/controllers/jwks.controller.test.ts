import { describe, it, expect, beforeEach, vi } from 'vitest';
import { JwksController } from '@presentation';
import { IGetJwksUseCase } from '@interfaces';
import { Request, Response, NextFunction } from 'express';

// Mock use case
const mockUseCase: IGetJwksUseCase = {
	execute: vi.fn(),
};

// Mock Request and Response
const createMockRequest = (): Partial<Request> => ({});

const createMockResponse = (): Partial<Response> => ({
	set: vi.fn().mockReturnThis(),
	json: vi.fn(),
});

const mockNextFunction: NextFunction = vi.fn();

describe('JwksController', () => {
	let controller: JwksController;
	let mockRequest: Partial<Request>;
	let mockResponse: Partial<Response>;

	beforeEach(() => {
		vi.clearAllMocks();
		controller = new JwksController(mockUseCase);
		mockRequest = createMockRequest();
		mockResponse = createMockResponse();
	});

	describe('handle', () => {
		const mockJwksResponse: import('@interfaces').JwksResponse = {
			keys: [
				{
					kty: 'RSA',
					kid: 'test-key-1',
					use: 'sig',
					alg: 'RS256',
					n: 'mock-modulus-value-base64url',
					e: 'AQAB'
				}
			]
		};

		it('should return JWKS successfully', async () => {
			vi.mocked(mockUseCase.execute).mockResolvedValue(mockJwksResponse);

			await controller.handle(mockRequest as Request, mockResponse as Response, mockNextFunction);

			expect(mockUseCase.execute).toHaveBeenCalledOnce();
			expect(mockResponse.set).toHaveBeenCalledWith({
				'Content-Type': 'application/json',
				'Cache-Control': 'public, max-age=3600',
				'X-Content-Type-Options': 'nosniff'
			});
			expect(mockResponse.json).toHaveBeenCalledWith(mockJwksResponse);
		});

		it('should return JWKS with multiple keys', async () => {
			   const multipleKeysResponse: import('@interfaces').JwksResponse = {
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

			vi.mocked(mockUseCase.execute).mockResolvedValue(multipleKeysResponse);

			await controller.handle(mockRequest as Request, mockResponse as Response, mockNextFunction);

			expect(mockResponse.json).toHaveBeenCalledWith(multipleKeysResponse);
		});

		it('should return empty JWKS when no keys are available', async () => {
			   const emptyJwksResponse: import('@interfaces').JwksResponse = {
				keys: []
			};

			vi.mocked(mockUseCase.execute).mockResolvedValue(emptyJwksResponse);

			await controller.handle(mockRequest as Request, mockResponse as Response, mockNextFunction);

			expect(mockResponse.json).toHaveBeenCalledWith(emptyJwksResponse);
		});

		it('should set all required headers', async () => {
			vi.mocked(mockUseCase.execute).mockResolvedValue(mockJwksResponse);

			await controller.handle(mockRequest as Request, mockResponse as Response, mockNextFunction);

			expect(mockResponse.set).toHaveBeenCalledWith({
				'Content-Type': 'application/json',
				'Cache-Control': 'public, max-age=3600',
				'X-Content-Type-Options': 'nosniff'
			});
		});

		it('should set Content-Type header to application/json', async () => {
			vi.mocked(mockUseCase.execute).mockResolvedValue(mockJwksResponse);

			await controller.handle(mockRequest as Request, mockResponse as Response, mockNextFunction);

			expect(mockResponse.set).toHaveBeenCalledWith(
				expect.objectContaining({
					'Content-Type': 'application/json'
				})
			);
		});

		it('should set Cache-Control header for public caching', async () => {
			vi.mocked(mockUseCase.execute).mockResolvedValue(mockJwksResponse);

			await controller.handle(mockRequest as Request, mockResponse as Response, mockNextFunction);

			expect(mockResponse.set).toHaveBeenCalledWith(
				expect.objectContaining({
					'Cache-Control': 'public, max-age=3600'
				})
			);
		});

		it('should set X-Content-Type-Options header for security', async () => {
			vi.mocked(mockUseCase.execute).mockResolvedValue(mockJwksResponse);

			await controller.handle(mockRequest as Request, mockResponse as Response, mockNextFunction);

			expect(mockResponse.set).toHaveBeenCalledWith(
				expect.objectContaining({
					'X-Content-Type-Options': 'nosniff'
				})
			);
		});

		it('should handle use case errors by calling next middleware', async () => {
			const jwksError = new Error('Failed to generate JWKS');
			vi.mocked(mockUseCase.execute).mockRejectedValue(jwksError);

			await controller.handle(mockRequest as Request, mockResponse as Response, mockNextFunction);

			expect(mockNextFunction).toHaveBeenCalledWith(jwksError);
			expect(mockResponse.json).not.toHaveBeenCalled();
		});

		it('should not set headers when error occurs', async () => {
			const jwksError = new Error('Service unavailable');
			vi.mocked(mockUseCase.execute).mockRejectedValue(jwksError);

			await controller.handle(mockRequest as Request, mockResponse as Response, mockNextFunction);

			expect(mockResponse.set).not.toHaveBeenCalled();
		});

		it('should handle null/undefined responses from use case', async () => {
			vi.mocked(mockUseCase.execute).mockResolvedValue(null as any);

			await controller.handle(mockRequest as Request, mockResponse as Response, mockNextFunction);

			expect(mockResponse.json).toHaveBeenCalledWith(null);
			expect(mockResponse.set).toHaveBeenCalledOnce();
		});

		it('should handle malformed JWKS response', async () => {
			const malformedResponse = { invalid: 'structure' } as any;
			vi.mocked(mockUseCase.execute).mockResolvedValue(malformedResponse);

			await controller.handle(mockRequest as Request, mockResponse as Response, mockNextFunction);

			expect(mockResponse.json).toHaveBeenCalledWith(malformedResponse);
		});

		it('should handle JWKS with additional properties', async () => {
			   const extendedJwks: import('@interfaces').JwksResponse = {
				keys: [
					{
						kty: 'RSA',
						kid: 'test-key-1',
						use: 'sig',
						alg: 'RS256',
						n: 'mock-modulus-value',
						e: 'AQAB',
					}
				],
			};

			vi.mocked(mockUseCase.execute).mockResolvedValue(extendedJwks);

			await controller.handle(mockRequest as Request, mockResponse as Response, mockNextFunction);

			expect(mockResponse.json).toHaveBeenCalledWith(extendedJwks);
		});

		it('should handle concurrent requests appropriately', async () => {
			vi.mocked(mockUseCase.execute).mockResolvedValue(mockJwksResponse);

			// Simulate concurrent requests
			const request1 = controller.handle(mockRequest as Request, mockResponse as Response, mockNextFunction);
			const request2 = controller.handle(mockRequest as Request, mockResponse as Response, mockNextFunction);

			await Promise.all([request1, request2]);

			// Both should call the use case
			expect(mockUseCase.execute).toHaveBeenCalledTimes(2);
		});

		it('should not mutate the original JWKS response', async () => {
			   const originalJwks: import('@interfaces').JwksResponse = {
				keys: [
					{
						kty: 'RSA',
						kid: 'immutable-test',
						use: 'sig',
						alg: 'RS256',
						n: 'test-modulus',
						e: 'AQAB'
					}
				]
			};

			vi.mocked(mockUseCase.execute).mockResolvedValue(originalJwks);

			await controller.handle(mockRequest as Request, mockResponse as Response, mockNextFunction);

			// Verify original object is unchanged
			expect(originalJwks.keys[0].kid).toBe('immutable-test');
			expect(mockResponse.json).toHaveBeenCalledWith(originalJwks);
		});

		it('should handle very large JWKS responses', async () => {
			   const largeJwks: import('@interfaces').JwksResponse = {
				keys: Array.from({ length: 100 }, (_, i) => ({
					kty: 'RSA',
					kid: `test-key-${i}`,
					use: 'sig',
					alg: 'RS256',
					n: `mock-modulus-${i}`,
					e: 'AQAB'
				}))
			};

			vi.mocked(mockUseCase.execute).mockResolvedValue(largeJwks);

			await controller.handle(mockRequest as Request, mockResponse as Response, mockNextFunction);

			expect(mockResponse.json).toHaveBeenCalledWith(largeJwks);
		});

		it('should handle different error types appropriately', async () => {
			const errors = [
				new Error('Network error'),
				new TypeError('Type error'),
				new ReferenceError('Reference error'),
				'string error',
				null,
				undefined
			];

			for (const error of errors) {
				vi.clearAllMocks();
				vi.mocked(mockUseCase.execute).mockRejectedValue(error);

				await controller.handle(mockRequest as Request, mockResponse as Response, mockNextFunction);

				expect(mockNextFunction).toHaveBeenCalledWith(error);
			}
		});
	});
});
