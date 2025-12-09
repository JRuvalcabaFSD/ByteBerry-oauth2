import { describe, it, expect } from 'vitest';
import { InvalidTokenError } from '@shared';
import { AppError } from '@shared';

describe('JWT Errors', () => {
	describe('InvalidTokenError', () => {
		it('should create invalid token error with message and default status code', () => {
			const error = new InvalidTokenError('Token has expired');

			expect(error).toBeInstanceOf(Error);
			expect(error).toBeInstanceOf(AppError);
			expect(error).toBeInstanceOf(InvalidTokenError);
			expect(error.message).toBe('Token has expired');
			expect(error.errorType).toBe('oauth');
			expect(error.statusCode).toBe(401);
			expect(error.name).toBe('InvalidTokenError');
		});

		it('should create invalid token error with custom status code', () => {
			const error = new InvalidTokenError('Invalid token signature', 403);

			expect(error.message).toBe('Invalid token signature');
			expect(error.errorType).toBe('oauth');
			expect(error.statusCode).toBe(403);
			expect(error.name).toBe('InvalidTokenError');
		});

		it('should be catchable as AppError', () => {
			const error = new InvalidTokenError('JWT test error');

			try {
				throw error;
			} catch (caught) {
				expect(caught).toBeInstanceOf(AppError);
				expect(caught).toBeInstanceOf(InvalidTokenError);
				expect((caught as AppError).errorType).toBe('oauth');
			}
		});

		it('should maintain prototype chain', () => {
			const error = new InvalidTokenError('Prototype test');

			expect(error.constructor).toBe(InvalidTokenError);
			expect(Object.getPrototypeOf(error)).toBe(InvalidTokenError.prototype);
		});

		it('should have stack trace', () => {
			const error = new InvalidTokenError('Stack test');

			expect(error.stack).toBeDefined();
			expect(typeof error.stack).toBe('string');
			expect(error.stack).toContain('InvalidTokenError');
		});

		it('should handle token-specific error messages', () => {
			const messages = [
				'Token format is incorrect',
				'Invalid token structure',
				'Token validation failed',
				'Token content is malformed',
				'JWT token has expired',
				'Token expired at 2024-01-01T10:00:00Z',
				'Access token is no longer valid',
				'Token validity period has ended'
			];

			messages.forEach(message => {
				const error = new InvalidTokenError(message);
				expect(error.message).toBe(message);
				expect(error.name).toBe('InvalidTokenError');
				expect(error.statusCode).toBe(401);
			});
		});

		it('should handle different status codes', () => {
			const statusCodes = [401, 403, 422, 400];

			statusCodes.forEach(code => {
				const error = new InvalidTokenError('Token error', code);
				expect(error.statusCode).toBe(code);
				expect(error.errorType).toBe('oauth');
			});
		});

		it('should maintain inheritance chain', () => {
			const error = new InvalidTokenError('Inheritance test');

			expect(error instanceof Error).toBe(true);
			expect(error instanceof AppError).toBe(true);
			expect(error instanceof InvalidTokenError).toBe(true);
		});

		it('should have correct error type', () => {
			const error = new InvalidTokenError('Error type test');

			expect(error.errorType).toBe('oauth');
		});

		it('should handle empty message', () => {
			const error = new InvalidTokenError('');

			expect(error.message).toBe('');
			expect(error.name).toBe('InvalidTokenError');
			expect(error.statusCode).toBe(401);
			expect(error.errorType).toBe('oauth');
		});

		it('should handle long error messages', () => {
			const longMessage = 'JWT validation failed: ' + 'A'.repeat(1000);
			const error = new InvalidTokenError(longMessage);

			expect(error.message).toBe(longMessage);
		});

		it('should handle special characters in message', () => {
			const specialMessage = 'JWT error with émojis 🔐 and symbols @#$%^&*';
			const error = new InvalidTokenError(specialMessage);

			expect(error.message).toBe(specialMessage);
		});

		it('should handle multiline error messages', () => {
			const multilineMessage = 'JWT validation failed:\n- Token is expired\n- Signature is invalid';
			const error = new InvalidTokenError(multilineMessage);

			expect(error.message).toBe(multilineMessage);
		});

		it('should handle real JWT error scenarios', () => {
			// Scenario: Token parsing
			const malformedError = new InvalidTokenError('JWT must have 3 parts separated by dots');
			expect(malformedError.message).toContain('3 parts');
			expect(malformedError.statusCode).toBe(401);

			// Scenario: Token expiration
			const expiredError = new InvalidTokenError('Token expired at 2024-01-01T00:00:00Z', 401);
			expect(expiredError.message).toContain('expired');
			expect(expiredError.statusCode).toBe(401);

			// Scenario: Signature verification
			const signatureError = new InvalidTokenError('RS256 signature verification failed', 403);
			expect(signatureError.message).toContain('RS256');
			expect(signatureError.statusCode).toBe(403);

			// Scenario: Missing authorization
			const missingError = new InvalidTokenError('Authorization header missing');
			expect(missingError.message).toContain('Authorization');
			expect(missingError.statusCode).toBe(401);
		});

		it('should handle JWT claims validation scenarios', () => {
			const issuerError = new InvalidTokenError('Expected issuer: auth.example.com, got: unknown');
			const audienceError = new InvalidTokenError('Token audience [api.other.com] does not include api.example.com');

			expect(issuerError.message).toContain('auth.example.com');
			expect(audienceError.message).toContain('api.example.com');
			expect(issuerError.statusCode).toBe(401);
			expect(audienceError.statusCode).toBe(401);
		});

		it('should be serializable', () => {
			const error = new InvalidTokenError('Token validation failed');

			expect(error.toString()).toBe('InvalidTokenError: Token validation failed');
		});

		it('should have enumerable properties', () => {
			const error = new InvalidTokenError('Test message', 403);

			const messageDescriptor = Object.getOwnPropertyDescriptor(error, 'message');
			const statusCodeDescriptor = Object.getOwnPropertyDescriptor(error, 'statusCode');

			expect(messageDescriptor?.enumerable).toBe(true);
			expect(statusCodeDescriptor?.enumerable).toBe(true);
		});

		it('should maintain constructor references', () => {
			const error = new InvalidTokenError('Test');

			expect(error.constructor).toBe(InvalidTokenError);
			expect(error.constructor.name).toBe('InvalidTokenError');
		});

		it('should handle edge cases with message types', () => {
			const nullError = new InvalidTokenError(null as any);
			const undefinedError = new InvalidTokenError(undefined as any);
			const numericError = new InvalidTokenError(401 as any);
			const objectError = new InvalidTokenError({ error: 'test' } as any);

			expect(nullError.message).toBe('null');
			expect(undefinedError.message).toBe('undefined');
			expect(numericError.message).toBe('401');
			expect(objectError.message).toBe('[object Object]');
		});

		it('should handle edge cases with status codes', () => {
			const zeroStatus = new InvalidTokenError('Test', 0);
			const negativeStatus = new InvalidTokenError('Test', -1);
			const largeStatus = new InvalidTokenError('Test', 999);

			expect(zeroStatus.statusCode).toBe(0);
			expect(negativeStatus.statusCode).toBe(-1);
			expect(largeStatus.statusCode).toBe(999);
		});

		it('should handle status code edge cases with type coercion', () => {
			const stringStatus = new InvalidTokenError('Test', '404' as any);
			const floatStatus = new InvalidTokenError('Test', 401.5 as any);
			const nullStatus = new InvalidTokenError('Test', null as any);

			expect(stringStatus.statusCode).toBe('404');
			expect(floatStatus.statusCode).toBe(401.5);
			expect(nullStatus.statusCode).toBe(null);
		});

		it('should have readonly statusCode property', () => {
			const error = new InvalidTokenError('Test', 403);

			expect(error.statusCode).toBe(403);

			// TypeScript would prevent this, but we can check the property descriptor
			const descriptor = Object.getOwnPropertyDescriptor(error, 'statusCode');
			expect(descriptor?.writable).toBe(false);
		});

		it('should handle very long status codes and messages', () => {
			const veryLongMessage = 'A'.repeat(100000);
			const error = new InvalidTokenError(veryLongMessage, 999999);

			expect(error.message.length).toBe(100000);
			expect(error.statusCode).toBe(999999);
		});
	});
});
