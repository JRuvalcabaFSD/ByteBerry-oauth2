import { describe, it, expect } from 'vitest';
import { DomainValidator, InvalidValueObjectError } from '@shared';
import { AppError } from '@shared';

describe('Domain Errors', () => {
	describe('DomainValidator', () => {
		it('should create domain validator error extending AppError', () => {
			const error = new DomainValidator('Domain validation failed');

			expect(error).toBeInstanceOf(Error);
			expect(error).toBeInstanceOf(AppError);
			expect(error).toBeInstanceOf(DomainValidator);
			expect(error.message).toBe('Domain validation failed');
			expect(error.name).toBe('DomainValidator');
			expect(error.errorType).toBe('domain');
		});

		it('should have correct error type', () => {
			const error = new DomainValidator('Test error');

			expect(error.errorType).toBe('domain');
		});

		it('should be catchable as AppError', () => {
			const error = new DomainValidator('Test error');

			try {
				throw error;
			} catch (caught) {
				expect(caught).toBeInstanceOf(AppError);
				expect(caught).toBeInstanceOf(DomainValidator);
				expect((caught as AppError).errorType).toBe('domain');
			}
		});

		it('should maintain prototype chain', () => {
			const error = new DomainValidator('Prototype test');

			expect(error.constructor).toBe(DomainValidator);
			expect(Object.getPrototypeOf(error)).toBe(DomainValidator.prototype);
		});

		it('should have stack trace', () => {
			const error = new DomainValidator('Stack test');

			expect(error.stack).toBeDefined();
			expect(typeof error.stack).toBe('string');
			expect(error.stack).toContain('DomainValidator');
		});

		it('should handle empty message', () => {
			const error = new DomainValidator('');

			expect(error.message).toBe('');
			expect(error.name).toBe('DomainValidator');
			expect(error.errorType).toBe('domain');
		});

		it('should handle long messages', () => {
			const longMessage = 'A'.repeat(1000);
			const error = new DomainValidator(longMessage);

			expect(error.message).toBe(longMessage);
		});

		it('should handle special characters in message', () => {
			const specialMessage = 'Error with émojis 🚀 and symbols @#$%^&*';
			const error = new DomainValidator(specialMessage);

			expect(error.message).toBe(specialMessage);
		});
	});

	describe('InvalidValueObjectError', () => {
		it('should create invalid value object error extending DomainValidator', () => {
			const error = new InvalidValueObjectError('Email format is invalid');

			expect(error).toBeInstanceOf(Error);
			expect(error).toBeInstanceOf(AppError);
			expect(error).toBeInstanceOf(DomainValidator);
			expect(error).toBeInstanceOf(InvalidValueObjectError);
			expect(error.message).toBe('Invalid object: Email format is invalid');
			expect(error.name).toBe('InvalidValueObjectError');
			expect(error.errorType).toBe('domain');
		});

		it('should format message correctly with reason', () => {
			const reasons = [
				'Password must be at least 8 characters',
				'Invalid email format',
				'Username contains invalid characters',
				'Phone number format is incorrect'
			];

			reasons.forEach(reason => {
				const error = new InvalidValueObjectError(reason);
				expect(error.message).toBe(`Invalid object: ${reason}`);
			});
		});

		it('should handle empty reason', () => {
			const error = new InvalidValueObjectError('');

			expect(error.message).toBe('Invalid object: ');
		});

		it('should handle reason with special characters', () => {
			const reasonWithSpecialChars = 'Value contains @#$%^&* characters';
			const error = new InvalidValueObjectError(reasonWithSpecialChars);

			expect(error.message).toBe(`Invalid object: ${reasonWithSpecialChars}`);
		});

		it('should be catchable as DomainValidator', () => {
			const error = new InvalidValueObjectError('Test validation error');

			try {
				throw error;
			} catch (caught) {
				expect(caught).toBeInstanceOf(DomainValidator);
				expect(caught).toBeInstanceOf(InvalidValueObjectError);
				expect((caught as DomainValidator).errorType).toBe('domain');
			}
		});

		it('should be catchable as AppError', () => {
			const error = new InvalidValueObjectError('Test app error');

			try {
				throw error;
			} catch (caught) {
				expect(caught).toBeInstanceOf(AppError);
				expect(caught).toBeInstanceOf(InvalidValueObjectError);
			}
		});

		it('should maintain correct inheritance chain', () => {
			const error = new InvalidValueObjectError('Inheritance test');

			expect(error instanceof Error).toBe(true);
			expect(error instanceof AppError).toBe(true);
			expect(error instanceof DomainValidator).toBe(true);
			expect(error instanceof InvalidValueObjectError).toBe(true);
		});

		it('should have correct name property', () => {
			const error = new InvalidValueObjectError('Name test');

			expect(error.name).toBe('InvalidValueObjectError');
		});

		it('should maintain prototype chain', () => {
			const error = new InvalidValueObjectError('Prototype test');

			expect(error.constructor).toBe(InvalidValueObjectError);
			expect(Object.getPrototypeOf(error)).toBe(InvalidValueObjectError.prototype);
		});

		it('should have stack trace', () => {
			const error = new InvalidValueObjectError('Stack test');

			expect(error.stack).toBeDefined();
			expect(typeof error.stack).toBe('string');
			expect(error.stack).toContain('InvalidValueObjectError');
		});

		it('should handle multiline reason', () => {
			const multilineReason = 'Validation failed:\n- Field A is required\n- Field B is invalid';
			const error = new InvalidValueObjectError(multilineReason);

			expect(error.message).toBe(`Invalid object: ${multilineReason}`);
		});

		it('should handle reason with quotes and special characters', () => {
			const complexReason = 'Value "test@example.com" failed validation: format error';
			const error = new InvalidValueObjectError(complexReason);

			expect(error.message).toBe(`Invalid object: ${complexReason}`);
		});
	});

	describe('Error hierarchy', () => {
		it('should maintain correct inheritance for DomainValidator', () => {
			const error = new DomainValidator('Test');

			expect(error instanceof Error).toBe(true);
			expect(error instanceof AppError).toBe(true);
			expect(error instanceof DomainValidator).toBe(true);
			expect(error instanceof InvalidValueObjectError).toBe(false);
		});

		it('should maintain correct inheritance for InvalidValueObjectError', () => {
			const error = new InvalidValueObjectError('Test');

			expect(error instanceof Error).toBe(true);
			expect(error instanceof AppError).toBe(true);
			expect(error instanceof DomainValidator).toBe(true);
			expect(error instanceof InvalidValueObjectError).toBe(true);
		});
	});

	describe('Error serialization', () => {
		it('should serialize DomainValidator correctly', () => {
			const error = new DomainValidator('Domain validation error');

			expect(error.toString()).toBe('DomainValidator: Domain validation error');
		});

		it('should serialize InvalidValueObjectError correctly', () => {
			const error = new InvalidValueObjectError('Object validation failed');

			expect(error.toString()).toBe('InvalidValueObjectError: Invalid object: Object validation failed');
		});
	});

	describe('Error properties', () => {
		it('should have enumerable message property', () => {
			const error = new DomainValidator('Test message');
			const descriptor = Object.getOwnPropertyDescriptor(error, 'message');

			expect(descriptor?.enumerable).toBe(true);
		});

		it('should have enumerable errorType property', () => {
			const error = new DomainValidator('Test');
			const descriptor = Object.getOwnPropertyDescriptor(error, 'errorType');

			expect(descriptor?.enumerable).toBe(true);
			expect(error.errorType).toBe('domain');
		});

		it('should maintain constructor references', () => {
			const domainError = new DomainValidator('test');
			const valueObjectError = new InvalidValueObjectError('test');

			expect(domainError.constructor).toBe(DomainValidator);
			expect(valueObjectError.constructor).toBe(InvalidValueObjectError);
			expect(domainError.constructor.name).toBe('DomainValidator');
			expect(valueObjectError.constructor.name).toBe('InvalidValueObjectError');
		});
	});

	describe('Edge cases', () => {
		it('should handle null reason in InvalidValueObjectError', () => {
			const error = new InvalidValueObjectError(null as any);

			expect(error.message).toBe('Invalid object: null');
		});

		it('should handle undefined reason in InvalidValueObjectError', () => {
			const error = new InvalidValueObjectError(undefined as any);

			expect(error.message).toBe('Invalid object: undefined');
		});

		it('should handle numeric reason in InvalidValueObjectError', () => {
			const error = new InvalidValueObjectError(123 as any);

			expect(error.message).toBe('Invalid object: 123');
		});

		it('should handle object reason in InvalidValueObjectError', () => {
			const objectReason = { error: 'test' };
			const error = new InvalidValueObjectError(objectReason as any);

			expect(error.message).toBe('Invalid object: [object Object]');
		});

		it('should handle extremely long reasons', () => {
			const longReason = 'A'.repeat(10000);
			const error = new InvalidValueObjectError(longReason);

			expect(error.message).toBe(`Invalid object: ${longReason}`);
			expect(error.message.length).toBe(longReason.length + 'Invalid object: '.length);
		});
	});
});
