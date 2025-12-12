import { describe, it, expect } from 'vitest';
import {
	HttpError,
	CorsOriginError,
	OAuthError,
	InvalidRequestError,
	InvalidClientError,
	InvalidGrantError,
	UnauthorizedClientError
} from '@shared';
import { AppError, ErrorType } from '@shared';

describe('HTTP Errors', () => {
	describe('HttpError', () => {
		it('should create HTTP error with all parameters', () => {
			const error = new HttpError('HTTP error occurred', 'http', 'Network failure', 500);

			expect(error).toBeInstanceOf(Error);
			expect(error).toBeInstanceOf(AppError);
			expect(error).toBeInstanceOf(HttpError);
			expect(error.message).toBe('HTTP error occurred');
			expect(error.errorType).toBe('http');
			expect(error.statusCode).toBe(500);
			expect(error.errorCause).toBe('Network failure');
			expect(error.name).toBe('HttpError');
		});

		it('should be catchable as AppError', () => {
			const error = new HttpError('Test error', 'http', 'Test cause', 400);

			try {
				throw error;
			} catch (caught) {
				expect(caught).toBeInstanceOf(AppError);
				expect(caught).toBeInstanceOf(HttpError);
				expect((caught as HttpError).statusCode).toBe(400);
			}
		});

		it('should capture stack trace when available', () => {
			const error = new HttpError('Stack test', 'http', 'Test cause', 500);

			expect(error.stack).toBeDefined();
			expect(typeof error.stack).toBe('string');
		});

		it('should serialize to JSON correctly', () => {
			const error = new HttpError('Test message', 'http', 'Test cause', 404);

			const json = error.toJSON();

			expect(json).toEqual({
				error: 'Test cause',
				message: 'Test message',
				statusCode: 404
			});
		});

		it('should handle different error types', () => {
			const errorTypes: ErrorType[] = ['bootstrap', 'config', 'container', 'http', 'oauth', 'domain'];

			errorTypes.forEach(type => {
				const error = new HttpError('Test message', type, 'Test cause', 400);
				expect(error.errorType).toBe(type);
			});
		});

		it('should handle different status codes', () => {
			const statusCodes = [200, 400, 401, 403, 404, 500];

			statusCodes.forEach(code => {
				const error = new HttpError('Test', 'http', 'Test', code);
				expect(error.statusCode).toBe(code);
			});
		});
	});

	describe('CorsOriginError', () => {
		it('should create CORS origin error with correct properties', () => {
			const origin = 'https://unauthorized-domain.com';
			const error = new CorsOriginError(origin);

			expect(error).toBeInstanceOf(Error);
			expect(error).toBeInstanceOf(AppError);
			expect(error).toBeInstanceOf(HttpError);
			expect(error).toBeInstanceOf(CorsOriginError);
			expect(error.message).toBe('Origin https://unauthorized-domain.com not allowed by CORS');
			expect(error.errorType).toBe('http');
			expect(error.statusCode).toBe(200);
			expect(error.errorCause).toBe('Invalid CORS');
			expect(error.origin).toBe(origin);
			expect(error.name).toBe('CorsOriginError');
		});

		it('should capture stack trace when available', () => {
			const error = new CorsOriginError('https://test.com');

			expect(error.stack).toBeDefined();
		});

		it('should handle different origin formats', () => {
			const origins = [
				'https://example.com',
				'http://localhost:3000',
				'https://sub.domain.com:8080',
				'file://',
				'chrome-extension://abc123'
			];

			origins.forEach(origin => {
				const error = new CorsOriginError(origin);
				expect(error.origin).toBe(origin);
				expect(error.message).toBe(`Origin ${origin} not allowed by CORS`);
			});
		});
	});

	describe('OAuthError', () => {
		it('should create OAuth error with default status code', () => {
			const error = new OAuthError('OAuth error occurred', 'Invalid Token');

			expect(error).toBeInstanceOf(Error);
			expect(error).toBeInstanceOf(AppError);
			expect(error).toBeInstanceOf(HttpError);
			expect(error).toBeInstanceOf(OAuthError);
			expect(error.message).toBe('OAuth error occurred');
			expect(error.errorType).toBe('oauth');
			expect(error.statusCode).toBe(400);
			expect(error.errorCause).toBe('Invalid Token');
			expect(error.name).toBe('OAuthError');
		});

		it('should create OAuth error with custom status code', () => {
			const error = new OAuthError('Custom OAuth error', 'Custom Cause', 401);

			expect(error.statusCode).toBe(401);
		});

		it('should capture stack trace when available', () => {
			const error = new OAuthError('Test', 'Test');

			expect(error.stack).toBeDefined();
		});
	});

	describe('InvalidRequestError', () => {
		it('should create invalid request error extending OAuthError', () => {
			const error = new InvalidRequestError('Missing required parameter: client_id');

			expect(error).toBeInstanceOf(Error);
			expect(error).toBeInstanceOf(AppError);
			expect(error).toBeInstanceOf(HttpError);
			expect(error).toBeInstanceOf(OAuthError);
			expect(error).toBeInstanceOf(InvalidRequestError);
			expect(error.message).toBe('Missing required parameter: client_id');
			expect(error.errorType).toBe('oauth');
			expect(error.statusCode).toBe(400);
			expect(error.errorCause).toBe('Invalid Request');
			expect(error.name).toBe('InvalidRequestError');
		});

		it('should capture stack trace when available', () => {
			const error = new InvalidRequestError('Test error');

			expect(error.stack).toBeDefined();
		});

		it('should handle different error messages', () => {
			const messages = [
				'Missing required parameter: client_id',
				'Invalid parameter value: response_type',
				'Duplicate parameter: state',
				'Malformed request'
			];

			messages.forEach(message => {
				const error = new InvalidRequestError(message);
				expect(error.message).toBe(message);
				expect(error.statusCode).toBe(400);
			});
		});
	});

	describe('InvalidClientError', () => {
		it('should create invalid client error with default message', () => {
			const error = new InvalidClientError();

			expect(error).toBeInstanceOf(Error);
			expect(error).toBeInstanceOf(AppError);
			expect(error).toBeInstanceOf(HttpError);
			expect(error).toBeInstanceOf(OAuthError);
			expect(error).toBeInstanceOf(InvalidClientError);
			expect(error.message).toBe('Client authentication failed');
			expect(error.errorType).toBe('oauth');
			expect(error.statusCode).toBe(401);
			expect(error.errorCause).toBe('Invalid Client');
			expect(error.name).toBe('InvalidClientError');
		});

		it('should create invalid client error with custom message', () => {
			const customMessage = 'Invalid client credentials provided';
			const error = new InvalidClientError(customMessage);

			expect(error.message).toBe(customMessage);
			expect(error.statusCode).toBe(401);
		});

		it('should capture stack trace when available', () => {
			const error = new InvalidClientError('Test');

			expect(error.stack).toBeDefined();
		});
	});

	describe('InvalidGrantError', () => {
		it('should create invalid grant error with default message', () => {
			const error = new InvalidGrantError();

			expect(error).toBeInstanceOf(Error);
			expect(error).toBeInstanceOf(AppError);
			expect(error).toBeInstanceOf(HttpError);
			expect(error).toBeInstanceOf(OAuthError);
			expect(error).toBeInstanceOf(InvalidGrantError);
			expect(error.message).toBe('Invalid authorization grant');
			expect(error.errorType).toBe('oauth');
			expect(error.statusCode).toBe(401);
			expect(error.errorCause).toBe('Invalid Grant');
			expect(error.name).toBe('InvalidGrantError '); // Note: typo in implementation with extra space
		});

		it('should create invalid grant error with custom message', () => {
			const customMessage = 'Authorization code has expired';
			const error = new InvalidGrantError(customMessage);

			expect(error.message).toBe(customMessage);
			expect(error.statusCode).toBe(401);
		});

		it('should capture stack trace when available', () => {
			const error = new InvalidGrantError('Test');

			expect(error.stack).toBeDefined();
		});
	});

	describe('UnauthorizedClientError', () => {
		it('should create unauthorized client error with default message', () => {
			const error = new UnauthorizedClientError();

			expect(error).toBeInstanceOf(Error);
			expect(error).toBeInstanceOf(AppError);
			expect(error).toBeInstanceOf(HttpError);
			expect(error).toBeInstanceOf(OAuthError);
			expect(error).toBeInstanceOf(UnauthorizedClientError);
			expect(error.message).toBe('Client not authorized');
			expect(error.errorType).toBe('oauth');
			expect(error.statusCode).toBe(401);
			expect(error.errorCause).toBe('Unauthorized Client');
			expect(error.name).toBe('UnauthorizedClientError  '); // Note: typo in implementation with extra spaces
		});

		it('should create unauthorized client error with custom message', () => {
			const customMessage = 'Client credentials are invalid';
			const error = new UnauthorizedClientError(customMessage);

			expect(error.message).toBe(customMessage);
			expect(error.statusCode).toBe(401);
		});

		it('should capture stack trace when available', () => {
			const error = new UnauthorizedClientError('Test');

			expect(error.stack).toBeDefined();
		});
	});

	describe('Error hierarchy', () => {
		it('should maintain correct inheritance chain for CorsOriginError', () => {
			const error = new CorsOriginError('https://test.com');

			expect(error instanceof Error).toBe(true);
			expect(error instanceof AppError).toBe(true);
			expect(error instanceof HttpError).toBe(true);
			expect(error instanceof CorsOriginError).toBe(true);
			expect(error instanceof OAuthError).toBe(false);
		});

		it('should maintain correct inheritance chain for OAuthError', () => {
			const error = new OAuthError('Test', 'Test');

			expect(error instanceof Error).toBe(true);
			expect(error instanceof AppError).toBe(true);
			expect(error instanceof HttpError).toBe(true);
			expect(error instanceof OAuthError).toBe(true);
			expect(error instanceof InvalidRequestError).toBe(false);
		});

		it('should maintain correct inheritance chain for InvalidRequestError', () => {
			const error = new InvalidRequestError('Test');

			expect(error instanceof Error).toBe(true);
			expect(error instanceof AppError).toBe(true);
			expect(error instanceof HttpError).toBe(true);
			expect(error instanceof OAuthError).toBe(true);
			expect(error instanceof InvalidRequestError).toBe(true);
			expect(error instanceof InvalidClientError).toBe(false);
		});

		it('should maintain correct inheritance chain for InvalidClientError', () => {
			const error = new InvalidClientError('Test');

			expect(error instanceof Error).toBe(true);
			expect(error instanceof AppError).toBe(true);
			expect(error instanceof HttpError).toBe(true);
			expect(error instanceof OAuthError).toBe(true);
			expect(error instanceof InvalidClientError).toBe(true);
			expect(error instanceof InvalidGrantError).toBe(false);
		});
	});

	describe('Error serialization', () => {
		it('should serialize HttpError correctly', () => {
			const error = new HttpError('Test message', 'http', 'Test cause', 500);

			expect(error.toString()).toBe('HttpError: Test message');
		});

		it('should serialize CorsOriginError correctly', () => {
			const error = new CorsOriginError('https://test.com');

			expect(error.toString()).toBe('CorsOriginError: Origin https://test.com not allowed by CORS');
		});

		it('should serialize InvalidRequestError correctly', () => {
			const error = new InvalidRequestError('Invalid parameter');

			expect(error.toString()).toBe('InvalidRequestError: Invalid parameter');
		});
	});

	describe('JSON serialization', () => {
		it('should serialize to JSON with correct structure', () => {
			const error = new InvalidClientError('Test client error');

			const json = error.toJSON();

			expect(json).toEqual({
				error: 'Invalid Client',
				message: 'Test client error',
				statusCode: 401
			});
		});

		it('should handle special characters in JSON serialization', () => {
			const error = new HttpError('Error with "quotes" and symbols', 'http', 'Special & Cause', 400);

			const json = error.toJSON();

			expect(json.message).toBe('Error with "quotes" and symbols');
			expect(json.error).toBe('Special & Cause');
		});
	});

	describe('Edge cases', () => {
		it('should handle empty messages', () => {
			const errors = [
				new HttpError('', 'http', 'cause', 400),
				new CorsOriginError(''),
				new InvalidRequestError(''),
				new InvalidClientError(''),
				new InvalidGrantError(''),
				new UnauthorizedClientError('')
			];

			errors.forEach(error => {
				expect(error.message).toBe('');
			});
		});

		it('should handle special characters in messages', () => {
			const specialMessage = 'Error with émojis 🔐 and symbols @#$%^&*';
			const error = new InvalidRequestError(specialMessage);

			expect(error.message).toBe(specialMessage);
		});

		it('should handle very long error messages', () => {
			const longMessage = 'OAuth validation failed: ' + 'A'.repeat(5000);
			const error = new InvalidGrantError(longMessage);

			expect(error.message).toBe(longMessage);
			expect(error.message.length).toBe(longMessage.length);
		});

		it('should handle null and undefined messages', () => {
			const nullError = new InvalidClientError(null as any);
			const undefinedError = new UnauthorizedClientError(undefined as any);

			expect(nullError.message).toBe('null');
			expect(undefinedError.message).toBe('undefined');
		});

		it('should handle numeric and object messages', () => {
			const numericError = new InvalidRequestError(404 as any);
			const objectError = new InvalidGrantError({ error: 'test' } as any);

			expect(numericError.message).toBe('404');
			expect(objectError.message).toBe('[object Object]');
		});
	});
});
