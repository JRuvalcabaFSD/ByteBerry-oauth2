import { describe, it, expect, beforeEach, vi } from 'vitest';
import { AuthorizationController } from '@presentation';
import { AuthCodeRequestCommand } from '@application';
import { IGenerateAuthCodeUseCase } from '@interfaces';
import { InvalidRequestError } from '@shared';
import { Request, Response, NextFunction } from 'express';

// Mocks
const mockUseCase: IGenerateAuthCodeUseCase = {
	execute: vi.fn(),
};

// Mock Request and Response
const createMockRequest = (query: Record<string, any> = {}): Partial<Request> => ({
	query,
});

const createMockResponse = (): Partial<Response> => ({
	redirect: vi.fn(),
});

const mockNextFunction: NextFunction = vi.fn();

describe('AuthorizationController', () => {
	let controller: AuthorizationController;
	let mockRequest: Partial<Request>;
	let mockResponse: Partial<Response>;

	beforeEach(() => {
		vi.clearAllMocks();
		controller = new AuthorizationController(mockUseCase);
		mockRequest = createMockRequest();
		mockResponse = createMockResponse();
	});

	describe('handle', () => {
		const validQuery = {
			response_type: 'code',
			client_id: 'test-client-id',
			redirect_uri: 'https://example.com/callback',
			code_challenge: 'dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk',
			code_challenge_method: 'S256',
			scope: 'read write',
			state: 'random-state-value'
		};

		const mockAuthResponse = {
			code: 'generated-auth-code-123',
			state: 'random-state-value'
		};

		it('should handle successful authorization request with all parameters', async () => {
			mockRequest = createMockRequest(validQuery);
			vi.mocked(mockUseCase.execute).mockResolvedValue(mockAuthResponse);

			await controller.handle(mockRequest as Request, mockResponse as Response, mockNextFunction);

			expect(mockUseCase.execute).toHaveBeenCalledWith(expect.objectContaining({
				client_id: 'test-client-id',
				response_type: 'code',
				redirect_uri: 'https://example.com/callback',
				code_challenge: 'dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk',
				code_challenge_method: 'S256',
				scope: 'read write',
				state: 'random-state-value'
			}));
			expect(mockResponse.redirect).toHaveBeenCalledWith(
				'https://example.com/callback?code=generated-auth-code-123&state=random-state-value'
			);
		});

		it('should handle successful authorization request without optional state', async () => {
			   const queryWithoutState: Partial<typeof validQuery> = { ...validQuery };
			   queryWithoutState.state = undefined;

			const responseWithoutState = {
				code: 'generated-auth-code-456',
			};

			mockRequest = createMockRequest(queryWithoutState);
			vi.mocked(mockUseCase.execute).mockResolvedValue(responseWithoutState);

			await controller.handle(mockRequest as Request, mockResponse as Response, mockNextFunction);

			expect(mockResponse.redirect).toHaveBeenCalledWith(
				'https://example.com/callback?code=generated-auth-code-456'
			);
		});

		it('should handle successful authorization request without optional scope', async () => {
			   const queryWithoutScope: Partial<typeof validQuery> = { ...validQuery };
			   queryWithoutScope.scope = undefined;

			mockRequest = createMockRequest(queryWithoutScope);
			vi.mocked(mockUseCase.execute).mockResolvedValue(mockAuthResponse);

			await controller.handle(mockRequest as Request, mockResponse as Response, mockNextFunction);

			expect(mockUseCase.execute).toHaveBeenCalledWith(expect.objectContaining({
				scope: undefined
			}));
		});

		it('should throw InvalidRequestError for invalid redirect_uri format', async () => {
			const queryWithInvalidUri = {
				...validQuery,
				redirect_uri: 'not-a-valid-uri'
			};

			mockRequest = createMockRequest(queryWithInvalidUri);
			vi.mocked(mockUseCase.execute).mockResolvedValue(mockAuthResponse);

			await controller.handle(mockRequest as Request, mockResponse as Response, mockNextFunction);

			expect(mockNextFunction).toHaveBeenCalledWith(
				expect.objectContaining({
					name: 'InvalidRequestError',
					message: 'Invalid redirect_uri: must be a valid absolute URL'
				})
			);
		});

		it('should handle AuthCodeRequestCommand validation errors', async () => {
			const invalidQuery = {
				response_type: 'invalid',
				// Missing required fields
			};

			mockRequest = createMockRequest(invalidQuery);

			await controller.handle(mockRequest as Request, mockResponse as Response, mockNextFunction);

			expect(mockNextFunction).toHaveBeenCalledWith(
				expect.objectContaining({
					name: 'InvalidRequestError'
				})
			);
			expect(mockUseCase.execute).not.toHaveBeenCalled();
		});

		it('should handle use case execution errors', async () => {
			const useCaseError = new Error('Database connection failed');

			mockRequest = createMockRequest(validQuery);
			vi.mocked(mockUseCase.execute).mockRejectedValue(useCaseError);

			await controller.handle(mockRequest as Request, mockResponse as Response, mockNextFunction);

			expect(mockNextFunction).toHaveBeenCalledWith(useCaseError);
		});

		it('should handle missing required parameters', async () => {
			const emptyQuery = {};
			mockRequest = createMockRequest(emptyQuery);

			await controller.handle(mockRequest as Request, mockResponse as Response, mockNextFunction);

			expect(mockNextFunction).toHaveBeenCalledWith(
				expect.objectContaining({
					message: 'Missing required parameters'
				})
			);
		});

		it('should handle missing client_id', async () => {
			const queryMissingClientId = {
				response_type: 'code',
				redirect_uri: 'https://example.com/callback',
				code_challenge: 'challenge',
				code_challenge_method: 'S256'
			};
			mockRequest = createMockRequest(queryMissingClientId);

			await controller.handle(mockRequest as Request, mockResponse as Response, mockNextFunction);

			expect(mockNextFunction).toHaveBeenCalledWith(
				expect.objectContaining({
					message: 'Client Id is required'
				})
			);
		});

		it('should handle missing redirect_uri', async () => {
			const queryMissingRedirectUri = {
				response_type: 'code',
				client_id: 'test-client',
				code_challenge: 'challenge',
				code_challenge_method: 'S256'
			};
			mockRequest = createMockRequest(queryMissingRedirectUri);

			await controller.handle(mockRequest as Request, mockResponse as Response, mockNextFunction);

			expect(mockNextFunction).toHaveBeenCalledWith(
				expect.objectContaining({
					message: 'redirect_uri are required (PKCE)'
				})
			);
		});

		it('should handle missing PKCE parameters', async () => {
			const queryMissingPKCE = {
				response_type: 'code',
				client_id: 'test-client',
				redirect_uri: 'https://example.com/callback'
			};
			mockRequest = createMockRequest(queryMissingPKCE);

			await controller.handle(mockRequest as Request, mockResponse as Response, mockNextFunction);

			expect(mockNextFunction).toHaveBeenCalledWith(
				expect.objectContaining({
					message: 'code_challenge and code_challenge_method are required (PKCE)'
				})
			);
		});

		it('should handle unsupported response_type', async () => {
			const queryWithInvalidResponseType = {
				...validQuery,
				response_type: 'token'
			};
			mockRequest = createMockRequest(queryWithInvalidResponseType);

			await controller.handle(mockRequest as Request, mockResponse as Response, mockNextFunction);

			expect(mockNextFunction).toHaveBeenCalledWith(
				expect.objectContaining({
					message: 'Only response_type=code is supported'
				})
			);
		});

		it('should handle empty scope parameter correctly', async () => {
			const queryWithEmptyScope = {
				...validQuery,
				scope: '   ' // Empty or whitespace only
			};
			mockRequest = createMockRequest(queryWithEmptyScope);
			vi.mocked(mockUseCase.execute).mockResolvedValue(mockAuthResponse);

			await controller.handle(mockRequest as Request, mockResponse as Response, mockNextFunction);

			expect(mockUseCase.execute).toHaveBeenCalledWith(expect.objectContaining({
				scope: undefined
			}));
		});

		it('should handle state parameter with special characters', async () => {
			const queryWithSpecialState = {
				...validQuery,
				state: 'state-with-special-chars!@#$%'
			};
			const responseWithSpecialState = {
				code: 'test-code',
				state: 'state-with-special-chars!@#$%'
			};

			mockRequest = createMockRequest(queryWithSpecialState);
			vi.mocked(mockUseCase.execute).mockResolvedValue(responseWithSpecialState);

			await controller.handle(mockRequest as Request, mockResponse as Response, mockNextFunction);

			expect(mockResponse.redirect).toHaveBeenCalledWith(
				'https://example.com/callback?code=test-code&state=state-with-special-chars%21%40%23%24%25'
			);
		});

		it('should properly URL encode query parameters in redirect', async () => {
			const responseWithSpecialChars = {
				code: 'code with spaces',
				state: 'state&with=special'
			};

			mockRequest = createMockRequest(validQuery);
			vi.mocked(mockUseCase.execute).mockResolvedValue(responseWithSpecialChars);

			await controller.handle(mockRequest as Request, mockResponse as Response, mockNextFunction);

			expect(mockResponse.redirect).toHaveBeenCalledWith(
				'https://example.com/callback?code=code+with+spaces&state=state%26with%3Dspecial'
			);
		});
	});
});
