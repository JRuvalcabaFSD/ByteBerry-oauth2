import { describe, it, expect } from 'vitest';
import { ClientIdVO } from '@domain';

describe('ClientIdVO', () => {
	describe('create', () => {
		it('should create ClientIdVO with valid client ID', () => {
			const validClientId = 'my-client-id-123';
			const clientId = ClientIdVO.create(validClientId);

			expect(clientId.getValue()).toBe(validClientId);
		});

		it('should create ClientIdVO with minimum valid length (8 characters)', () => {
			const minValidClientId = '12345678';
			const clientId = ClientIdVO.create(minValidClientId);

			expect(clientId.getValue()).toBe(minValidClientId);
		});

		it('should create ClientIdVO with maximum valid length (128 characters)', () => {
			const maxValidClientId = 'a'.repeat(128);
			const clientId = ClientIdVO.create(maxValidClientId);

			expect(clientId.getValue()).toBe(maxValidClientId);
		});

		it('should create ClientIdVO with special characters', () => {
			const specialClientId = 'client-123_test.app@example';
			const clientId = ClientIdVO.create(specialClientId);

			expect(clientId.getValue()).toBe(specialClientId);
		});

		it('should throw error for empty client ID', () => {
			expect(() => ClientIdVO.create(''))
				.toThrow('Client ID cannot be empty');
		});

		it('should throw error for null client ID', () => {
			expect(() => ClientIdVO.create(null as any))
				.toThrow('Client ID cannot be empty');
		});

		it('should throw error for undefined client ID', () => {
			expect(() => ClientIdVO.create(undefined as any))
				.toThrow('Client ID cannot be empty');
		});

		it('should throw error for whitespace-only client ID', () => {
			expect(() => ClientIdVO.create('   '))
				.toThrow('Client ID cannot be empty');

			expect(() => ClientIdVO.create('\t\n  '))
				.toThrow('Client ID cannot be empty');
		});

		it('should throw error for client ID shorter than 8 characters', () => {
			expect(() => ClientIdVO.create('1234567'))
				.toThrow('Client ID must be between 8 and 128 characters');

			expect(() => ClientIdVO.create('a'))
				.toThrow('Client ID must be between 8 and 128 characters');
		});

		it('should throw error for client ID longer than 128 characters', () => {
			const longClientId = 'a'.repeat(129);

			expect(() => ClientIdVO.create(longClientId))
				.toThrow('Client ID must be between 8 and 128 characters');
		});

		it('should accept client ID with leading/trailing spaces when trimmed length is valid', () => {
			// Note: The implementation checks trim().length === 0, but doesn't trim the actual value
			// So this should throw since the actual length includes spaces
			const clientIdWithSpaces = '  my-client-id-123  ';

			expect(() => ClientIdVO.create(clientIdWithSpaces))
				.not.toThrow();

			const clientId = ClientIdVO.create(clientIdWithSpaces);
			expect(clientId.getValue()).toBe(clientIdWithSpaces);
		});
	});

	describe('getValue', () => {
		it('should return the original client ID value', () => {
			const originalValue = 'test-client-id-456';
			const clientId = ClientIdVO.create(originalValue);

			expect(clientId.getValue()).toBe(originalValue);
		});

		it('should return consistent value across multiple calls', () => {
			const originalValue = 'consistent-client-id';
			const clientId = ClientIdVO.create(originalValue);

			expect(clientId.getValue()).toBe(originalValue);
			expect(clientId.getValue()).toBe(originalValue);
			expect(clientId.getValue()).toBe(originalValue);
		});
	});

	describe('equals', () => {
		it('should return true for ClientIdVO with same value', () => {
			const value = 'same-client-id';
			const clientId1 = ClientIdVO.create(value);
			const clientId2 = ClientIdVO.create(value);

			expect(clientId1.equals(clientId2)).toBe(true);
			expect(clientId2.equals(clientId1)).toBe(true);
		});

		it('should return false for ClientIdVO with different values', () => {
			const clientId1 = ClientIdVO.create('client-id-123');
			const clientId2 = ClientIdVO.create('client-id-456');

			expect(clientId1.equals(clientId2)).toBe(false);
			expect(clientId2.equals(clientId1)).toBe(false);
		});

		it('should return true for same instance', () => {
			const clientId = ClientIdVO.create('self-client-id');

			expect(clientId.equals(clientId)).toBe(true);
		});

		it('should be case sensitive', () => {
			const clientId1 = ClientIdVO.create('Client-ID-123');
			const clientId2 = ClientIdVO.create('client-id-123');

			expect(clientId1.equals(clientId2)).toBe(false);
		});

		it('should consider whitespace differences', () => {
			const clientId1 = ClientIdVO.create('client-id-123');
			const clientId2 = ClientIdVO.create('client-id-123 ');

			expect(clientId1.equals(clientId2)).toBe(false);
		});

		it('should handle special characters correctly', () => {
			const value = 'client@123_test.app-id';
			const clientId1 = ClientIdVO.create(value);
			const clientId2 = ClientIdVO.create(value);

			expect(clientId1.equals(clientId2)).toBe(true);
		});
	});

	describe('immutability', () => {
		it('should be immutable after creation', () => {
			const clientId = ClientIdVO.create('immutable-client-id');
			const originalValue = clientId.getValue();

			// Attempting to modify should not work (in a real scenario, this would be prevented by TypeScript)
			// Since the value field is private readonly, we can't actually modify it
			expect(clientId.getValue()).toBe(originalValue);
		});

		it('should maintain independence between instances', () => {
			const clientId1 = ClientIdVO.create('independent-1');
			const clientId2 = ClientIdVO.create('independent-2');

			expect(clientId1.getValue()).toBe('independent-1');
			expect(clientId2.getValue()).toBe('independent-2');
			expect(clientId1.equals(clientId2)).toBe(false);
		});
	});

	describe('edge cases', () => {
		it('should handle numeric strings', () => {
			const numericClientId = '12345678';
			const clientId = ClientIdVO.create(numericClientId);

			expect(clientId.getValue()).toBe(numericClientId);
		});

		it('should handle mixed alphanumeric with special characters', () => {
			const mixedClientId = 'client123-test_456.app@domain';
			const clientId = ClientIdVO.create(mixedClientId);

			expect(clientId.getValue()).toBe(mixedClientId);
		});

		it('should handle unicode characters', () => {
			const unicodeClientId = 'clienté123-tëst';
			const clientId = ClientIdVO.create(unicodeClientId);

			expect(clientId.getValue()).toBe(unicodeClientId);
		});

		it('should handle exactly 8 character boundary cases', () => {
			const exactly8Chars = '12345678';
			const exactly7Chars = '1234567';

			expect(() => ClientIdVO.create(exactly8Chars)).not.toThrow();
			expect(() => ClientIdVO.create(exactly7Chars)).toThrow();
		});

		it('should handle exactly 128 character boundary cases', () => {
			const exactly128Chars = 'a'.repeat(128);
			const exactly129Chars = 'a'.repeat(129);

			expect(() => ClientIdVO.create(exactly128Chars)).not.toThrow();
			expect(() => ClientIdVO.create(exactly129Chars)).toThrow();
		});
	});
});
