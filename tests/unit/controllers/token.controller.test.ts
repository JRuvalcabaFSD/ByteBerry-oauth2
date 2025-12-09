import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TokenController } from '@presentation';
import { TokenRequestCommand } from '@application';
import { IExchangeCodeForTokenUseCase } from '@interfaces';
import { Request, Response, NextFunction } from 'express';

// Mock use case
const mockUseCase: IExchangeCodeForTokenUseCase = {
	execute: vi.fn(),
};

// Mock Request and Response
const createMockRequest = (body: Record<string, any> = {}): Partial<Request> => ({
	body,
});

const createMockResponse = (): Partial<Response> => ({
	json: vi.fn(),
});

const mockNextFunction: NextFunction = vi.fn();

describe('TokenController', () => {
	let controller: TokenController;
	let mockRequest: Partial<Request>;
	let mockResponse: Partial<Response>;

	beforeEach(() => {
		vi.clearAllMocks();
		controller = new TokenController(mockUseCase);
		mockRequest = createMockRequest();
		mockResponse = createMockResponse();
	});

	describe('handle', () => {
		const validTokenRequest = {
			grant_type: 'authorization_code',
			code: 'auth-code-123',
			redirect_uri: 'https://example.com/callback',
			client_id: 'test-client-id',
			code_verifier: 'dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk'
		};

		const mockTokenResponse = {
			access_token: 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...',
			token_type: 'Bearer',
			expires_in: 3600,
			scope: 'read write'
		};

		it('should exchange authorization code for token successfully', async () => {
			mockRequest = createMockRequest(validTokenRequest);
			vi.mocked(mockUseCase.execute).mockResolvedValue(mockTokenResponse);

			await controller.handle(mockRequest as Request, mockResponse as Response, mockNextFunction);

			   expect(mockUseCase.execute).toHaveBeenCalledWith(expect.objectContaining({
				   grant_type: 'authorization_code',
				   code: 'auth-code-123',
				   redirect_uri: 'https://example.com/callback',
				   client_id: 'test-client-id',
				   code_verifier: 'dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk'
			   }));
			expect(mockResponse.json).toHaveBeenCalledWith(mockTokenResponse);
		});

		it('should handle token request without optional scope', async () => {
			const responseWithoutScope = {
				access_token: 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...',
				token_type: 'Bearer',
				expires_in: 3600
			};

			mockRequest = createMockRequest(validTokenRequest);
			vi.mocked(mockUseCase.execute).mockResolvedValue(responseWithoutScope);

			await controller.handle(mockRequest as Request, mockResponse as Response, mockNextFunction);

			expect(mockResponse.json).toHaveBeenCalledWith(responseWithoutScope);
		});

		it('should handle TokenRequestCommand validation errors', async () => {
			const invalidRequest = {
				grant_type: 'invalid_grant_type',
				// Missing required fields
			};

			mockRequest = createMockRequest(invalidRequest);

			await controller.handle(mockRequest as Request, mockResponse as Response, mockNextFunction);

			expect(mockNextFunction).toHaveBeenCalledWith(
				expect.objectContaining({
					name: 'InvalidRequestError'
				})
			);
			expect(mockUseCase.execute).not.toHaveBeenCalled();
		});

		it('should handle use case execution errors', async () => {
			const useCaseError = new Error('Token generation failed');

			mockRequest = createMockRequest(validTokenRequest);
			vi.mocked(mockUseCase.execute).mockRejectedValue(useCaseError);

			await controller.handle(mockRequest as Request, mockResponse as Response, mockNextFunction);

			expect(mockNextFunction).toHaveBeenCalledWith(useCaseError);
		});

		it('should handle empty request body', async () => {
			const emptyBody = {};
			mockRequest = createMockRequest(emptyBody);

			await controller.handle(mockRequest as Request, mockResponse as Response, mockNextFunction);

			expect(mockNextFunction).toHaveBeenCalledWith(
				expect.objectContaining({
					message: 'Missing required parameters'
				})
			);
		});

		it('should handle missing client_id', async () => {
			const requestMissingClientId = {
				grant_type: 'authorization_code',
				code: 'test-code',
				redirect_uri: 'https://example.com/callback',
				code_verifier: 'test-verifier'
			};
			mockRequest = createMockRequest(requestMissingClientId);

			await controller.handle(mockRequest as Request, mockResponse as Response, mockNextFunction);

			expect(mockNextFunction).toHaveBeenCalledWith(
				expect.objectContaining({
					message: 'Client Id is required'
				})
			);
		});

		it('should handle missing code', async () => {
			const requestMissingCode = {
				grant_type: 'authorization_code',
				client_id: 'test-client',
				redirect_uri: 'https://example.com/callback',
				code_verifier: 'test-verifier'
			};
			mockRequest = createMockRequest(requestMissingCode);

			await controller.handle(mockRequest as Request, mockResponse as Response, mockNextFunction);

			expect(mockNextFunction).toHaveBeenCalledWith(
				expect.objectContaining({
					message: 'code are required (PKCE)'
				})
			);
		});

		it('should handle missing code_verifier', async () => {
			const requestMissingCodeVerifier = {
				grant_type: 'authorization_code',
				client_id: 'test-client',
				code: 'test-code',
				redirect_uri: 'https://example.com/callback'
			};
			mockRequest = createMockRequest(requestMissingCodeVerifier);

			await controller.handle(mockRequest as Request, mockResponse as Response, mockNextFunction);

			expect(mockNextFunction).toHaveBeenCalledWith(
				expect.objectContaining({
					message: 'code_verifier are required (PKCE)'
				})
			);
		});

		it('should handle unsupported grant type', async () => {
			const requestWithInvalidGrantType = {
				...validTokenRequest,
				grant_type: 'client_credentials'
			};
			mockRequest = createMockRequest(requestWithInvalidGrantType);

			await controller.handle(mockRequest as Request, mockResponse as Response, mockNextFunction);

			expect(mockNextFunction).toHaveBeenCalledWith(
				expect.objectContaining({
					message: 'Only authorization_code grant type is supported'
				})
			);
		});

		it('should handle all required PKCE parameters', async () => {
			const completeRequest = {
				grant_type: 'authorization_code',
				code: 'complete-auth-code',
				client_id: 'complete-client-id',
				redirect_uri: 'https://complete.example.com/callback',
				code_verifier: 'complete-code-verifier-value'
			};

			mockRequest = createMockRequest(completeRequest);
			vi.mocked(mockUseCase.execute).mockResolvedValue(mockTokenResponse);

			await controller.handle(mockRequest as Request, mockResponse as Response, mockNextFunction);

			expect(mockUseCase.execute).toHaveBeenCalledWith(expect.objectContaining({
				code: 'complete-auth-code',
				client_id: 'complete-client-id',
				redirect_uri: 'https://complete.example.com/callback',
				code_verifier: 'complete-code-verifier-value'
			}));
		});

		it('should handle token response with additional properties', async () => {
			const extendedTokenResponse = {
				access_token: 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...',
				token_type: 'Bearer',
				expires_in: 3600,
				scope: 'read write',
				refresh_token: 'refresh_token_value'
			};

			mockRequest = createMockRequest(validTokenRequest);
			vi.mocked(mockUseCase.execute).mockResolvedValue(extendedTokenResponse);

			await controller.handle(mockRequest as Request, mockResponse as Response, mockNextFunction);

			expect(mockResponse.json).toHaveBeenCalledWith(extendedTokenResponse);
		});

		it('should not mutate the original token response', async () => {
			const originalResponse = {
				access_token: 'original-token',
				token_type: 'Bearer',
				expires_in: 3600,
				scope: 'read write'
			};

			mockRequest = createMockRequest(validTokenRequest);
			vi.mocked(mockUseCase.execute).mockResolvedValue(originalResponse);

			await controller.handle(mockRequest as Request, mockResponse as Response, mockNextFunction);

			// Verify original object is unchanged
			expect(originalResponse.access_token).toBe('original-token');
			expect(mockResponse.json).toHaveBeenCalledWith(originalResponse);
		});

		it('should handle null/undefined responses from use case', async () => {
			mockRequest = createMockRequest(validTokenRequest);
			vi.mocked(mockUseCase.execute).mockResolvedValue(null as any);

			await controller.handle(mockRequest as Request, mockResponse as Response, mockNextFunction);

			expect(mockResponse.json).toHaveBeenCalledWith(null);
		});

		it('should handle different error types from use case', async () => {
			const errors = [
				new Error('Network error'),
				new TypeError('Type error'),
				'string error',
				{ error: 'object error' }
			];

			for (const error of errors) {
				vi.clearAllMocks();
				mockRequest = createMockRequest(validTokenRequest);
				vi.mocked(mockUseCase.execute).mockRejectedValue(error);

				await controller.handle(mockRequest as Request, mockResponse as Response, mockNextFunction);

				expect(mockNextFunction).toHaveBeenCalledWith(error);
			}
		});

		it('should handle malformed request body', async () => {
			const malformedRequest = {
				invalid_field: 'invalid_value',
				another_invalid: 123
			};

			mockRequest = createMockRequest(malformedRequest);

			await controller.handle(mockRequest as Request, mockResponse as Response, mockNextFunction);

			expect(mockNextFunction).toHaveBeenCalledWith(
				expect.objectContaining({
					name: 'InvalidRequestError'
				})
			);
		});

		it('should handle concurrent requests appropriately', async () => {
			mockRequest = createMockRequest(validTokenRequest);
			vi.mocked(mockUseCase.execute).mockResolvedValue(mockTokenResponse);

			// Simulate concurrent requests
			const request1 = controller.handle(mockRequest as Request, mockResponse as Response, mockNextFunction);
			const request2 = controller.handle(mockRequest as Request, mockResponse as Response, mockNextFunction);

			await Promise.all([request1, request2]);

			// Both should call the use case
			expect(mockUseCase.execute).toHaveBeenCalledTimes(2);
		});
	});
});
