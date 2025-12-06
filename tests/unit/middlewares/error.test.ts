/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response, NextFunction } from 'express';

import { createErrorMiddleware } from '@infrastructure';
import type { IConfig, ILogger } from '@interfaces';
import { CorsOriginError } from '@shared';

describe('ErrorMiddleware', () => {
	let mockLogger: ILogger;
	let mockConfig: IConfig;
	let mockRequest: Partial<Request>;
	let mockResponse: Partial<Response>;
	let nextFunction: NextFunction;

	beforeEach(() => {
		mockLogger = {
			info: vi.fn(),
			error: vi.fn(),
			warn: vi.fn(),
			debug: vi.fn(),
		} as any;

		mockConfig = {
			isDevelopment: vi.fn().mockReturnValue(false),
			logRequests: false,
		} as any;

		mockRequest = {
			method: 'GET',
			url: '/test',
			originalUrl: '/test',
			requestId: 'test-request-id',
		};

		mockResponse = {
			status: vi.fn().mockReturnThis(),
			json: vi.fn(),
		};

		nextFunction = vi.fn();
	});

	describe('Default Error Handler', () => {
		it('should return 500 for unhandled errors', () => {
			const middleware = createErrorMiddleware(mockLogger, mockConfig);
			const error = new Error('Unhandled error');

			middleware(error, mockRequest as Request, mockResponse as Response, nextFunction);

			expect(mockResponse.status).toHaveBeenCalledWith(500);
			expect(mockResponse.json).toHaveBeenCalledWith({
				error: 'Internal Server Error',
				message: 'Something went wrong',
				requestId: 'test-request-id',
				timestamp: expect.any(String),
			});
		});

		it('should show detailed error message in development', () => {
			mockConfig.isDevelopment = vi.fn().mockReturnValue(true);
			const middleware = createErrorMiddleware(mockLogger, mockConfig);
			const error = new Error('Detailed error message');

			middleware(error, mockRequest as Request, mockResponse as Response, nextFunction);

			expect(mockResponse.json).toHaveBeenCalledWith(
				expect.objectContaining({
					message: 'Detailed error message',
				})
			);
		});

		it('should hide error details in production', () => {
			mockConfig.isDevelopment = vi.fn().mockReturnValue(false);
			const middleware = createErrorMiddleware(mockLogger, mockConfig);
			const error = new Error('Sensitive error info');

			middleware(error, mockRequest as Request, mockResponse as Response, nextFunction);

			expect(mockResponse.json).toHaveBeenCalledWith(
				expect.objectContaining({
					message: 'Something went wrong',
				})
			);
		});

		it('should use "unknown" requestId if not present', () => {
			mockRequest.requestId = undefined;
			const middleware = createErrorMiddleware(mockLogger, mockConfig);
			const error = new Error('Test error');

			middleware(error, mockRequest as Request, mockResponse as Response, nextFunction);

			expect(mockResponse.json).toHaveBeenCalledWith(
				expect.objectContaining({
					requestId: 'unknown',
				})
			);
		});
	});

	describe('CorsOriginError Handler', () => {
		it('should handle CorsOriginError with 200 status', () => {
			const middleware = createErrorMiddleware(mockLogger, mockConfig);
			const error = new CorsOriginError('https://malicious.com');

			middleware(error, mockRequest as Request, mockResponse as Response, nextFunction);

			expect(mockResponse.status).toHaveBeenCalledWith(200);
		});

		it('should return CORS error message in development', () => {
			mockConfig.isDevelopment = vi.fn().mockReturnValue(true);
			const middleware = createErrorMiddleware(mockLogger, mockConfig);
			const error = new CorsOriginError('https://malicious.com');

			middleware(error, mockRequest as Request, mockResponse as Response, nextFunction);

			expect(mockResponse.json).toHaveBeenCalledWith({
				error: 'Invalid CORS',
				message: error.message,
				requestId: 'test-request-id',
				timestamp: expect.any(String),
			});
		});

		it('should return generic CORS message in production', () => {
			mockConfig.isDevelopment = vi.fn().mockReturnValue(false);
			const middleware = createErrorMiddleware(mockLogger, mockConfig);
			const error = new CorsOriginError('https://malicious.com');

			middleware(error, mockRequest as Request, mockResponse as Response, nextFunction);

			expect(mockResponse.json).toHaveBeenCalledWith(
				expect.objectContaining({
					message: 'Origin not allowed by CORS',
				})
			);
		});
	});

	describe('Error Logging', () => {
		it('should log error when logRequests is true', () => {
			const configWithLogging = {
				...mockConfig,
				logRequests: true,
			};
			const middleware = createErrorMiddleware(mockLogger, configWithLogging);
			const error = new Error('Test error');
			error.stack = 'Error stack trace';

			middleware(error, mockRequest as Request, mockResponse as Response, nextFunction);

			expect(mockLogger.error).toHaveBeenCalledWith(
				'[ErrorMiddleware] Unhandled error in request',
				expect.objectContaining({
					requestId: 'test-request-id',
					error: 'Test error',
					method: 'GET',
					url: '/test',
				})
			);
		});

		it('should not log error when logRequests is false', () => {
			const configWithoutLogging = {
				...mockConfig,
				logRequests: false,
			};
			const middleware = createErrorMiddleware(mockLogger, configWithoutLogging);
			const error = new Error('Test error');

			middleware(error, mockRequest as Request, mockResponse as Response, nextFunction);

			expect(mockLogger.error).not.toHaveBeenCalled();
		});

		it('should log with error name if available', () => {
			const configWithLogging = {
				...mockConfig,
				logRequests: true,
			};
			const middleware = createErrorMiddleware(mockLogger, configWithLogging);
			const error = new CorsOriginError('https://test.com');

			middleware(error, mockRequest as Request, mockResponse as Response, nextFunction);

			expect(mockLogger.error).toHaveBeenCalledWith('[ErrorMiddleware] CorsOriginError error in request', expect.any(Object));
		});

		it('should include stack trace in error log', () => {
			const configWithLogging = {
				...mockConfig,
				logRequests: true,
			};
			const middleware = createErrorMiddleware(mockLogger, configWithLogging);
			const error = new Error('Test error');
			error.stack = 'Error: Test error\n    at line 1';

			middleware(error, mockRequest as Request, mockResponse as Response, nextFunction);

			expect(mockLogger.error).toHaveBeenCalledWith(
				expect.any(String),
				expect.objectContaining({
					stack: expect.stringContaining('Error: Test error'),
				})
			);
		});
	});

	describe('Request Information', () => {
		it('should include method and url in error log', () => {
			const configWithLogging = {
				...mockConfig,
				logRequests: true,
			};
			mockRequest.method = 'POST';
			mockRequest.originalUrl = '/api/users';
			const middleware = createErrorMiddleware(mockLogger, configWithLogging);
			const error = new Error('Test error');

			middleware(error, mockRequest as Request, mockResponse as Response, nextFunction);

			expect(mockLogger.error).toHaveBeenCalledWith(
				expect.any(String),
				expect.objectContaining({
					method: 'POST',
					url: '/api/users',
				})
			);
		});

		it('should fallback to req.url if originalUrl is not available', () => {
			const configWithLogging = {
				...mockConfig,
				logRequests: true,
			};
			mockRequest.originalUrl = undefined;
			mockRequest.url = '/fallback-url';
			const middleware = createErrorMiddleware(mockLogger, configWithLogging);
			const error = new Error('Test error');

			middleware(error, mockRequest as Request, mockResponse as Response, nextFunction);

			expect(mockLogger.error).toHaveBeenCalledWith(
				expect.any(String),
				expect.objectContaining({
					url: '/fallback-url',
				})
			);
		});
	});
});
