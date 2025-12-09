
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { IHashService } from '@interfaces';




// Mock the crypto import correctamente, todo dentro del callback
vi.mock('crypto', () => {
	return {
		createHash: vi.fn()
	};
});

// Importar la implementación y el mock después del mock
import { NodeHashService } from '@infrastructure';
import * as crypto from 'crypto';


describe('SHA256HashService', () => {
	let hashService: IHashService;
	let mockHashInstance: any;

	beforeEach(() => {
		vi.clearAllMocks();

		// Create mock hash instance
		mockHashInstance = {
			update: vi.fn().mockReturnThis(),
			digest: vi.fn()
		};

		// Setup crypto mock
			vi.mocked(crypto.createHash).mockReturnValue(mockHashInstance);

		hashService = new NodeHashService();
	});

	 describe('sha256', () => {
	 	it('should hash string data correctly', () => {
	 		const testData = 'test-string-to-hash';
	 		const expectedHash = 'base64url-encoded-hash-result';

	 		mockHashInstance.digest.mockReturnValue(expectedHash);

	 		const result = hashService.sha256(testData);

			expect(crypto.createHash).toHaveBeenCalledWith('sha256');
			expect(mockHashInstance.update).toHaveBeenCalledWith(testData);
	 		expect(mockHashInstance.digest).toHaveBeenCalledWith('base64url');
	 		expect(result).toBe(expectedHash);
	 	});

	 	it('should handle empty string', () => {
	 		const emptyString = '';
	 		const expectedHash = 'empty-string-hash';

	 		mockHashInstance.digest.mockReturnValue(expectedHash);

	 		const result = hashService.sha256(emptyString);

			expect(crypto.createHash).toHaveBeenCalledWith('sha256');
			expect(mockHashInstance.update).toHaveBeenCalledWith(emptyString);
			expect(mockHashInstance.digest).toHaveBeenCalledWith('base64url');
			expect(result).toBe(expectedHash);
		});

	 	it('should handle unicode characters', () => {
	 		const unicodeData = 'Test with émojis 🚀 and ñ characters';
	 		const expectedHash = 'unicode-hash-result';

	 		mockHashInstance.digest.mockReturnValue(expectedHash);

	 		const result = hashService.sha256(unicodeData);

			expect(crypto.createHash).toHaveBeenCalledWith('sha256');
			expect(mockHashInstance.update).toHaveBeenCalledWith(unicodeData);
	 		expect(mockHashInstance.digest).toHaveBeenCalledWith('base64url');
	 		expect(result).toBe(expectedHash);
	 	});

	 	it('should handle very long strings', () => {
	 		const longString = 'a'.repeat(10000);
	 		const expectedHash = 'long-string-hash';

	 		mockHashInstance.digest.mockReturnValue(expectedHash);

	 		const result = hashService.sha256(longString);

			expect(crypto.createHash).toHaveBeenCalledWith('sha256');
			expect(mockHashInstance.update).toHaveBeenCalledWith(longString);
	 		expect(mockHashInstance.digest).toHaveBeenCalledWith('base64url');
	 		expect(result).toBe(expectedHash);
	 	});

	 	it('should handle special characters', () => {
	 		const specialChars = '!@#$%^&*()_+-=[]{}|;:,.<>?`~';
	 		const expectedHash = 'special-chars-hash';

	 		mockHashInstance.digest.mockReturnValue(expectedHash);

	 		const result = hashService.sha256(specialChars);

			expect(crypto.createHash).toHaveBeenCalledWith('sha256');
			expect(mockHashInstance.update).toHaveBeenCalledWith(specialChars);
	 		expect(mockHashInstance.digest).toHaveBeenCalledWith('base64url');
	 		expect(result).toBe(expectedHash);
	 	});

	 	it('should handle newlines and tabs', () => {
	 		const dataWithWhitespace = 'line1\nline2\tindented';
	 		const expectedHash = 'whitespace-hash';

	 		mockHashInstance.digest.mockReturnValue(expectedHash);

	 		const result = hashService.sha256(dataWithWhitespace);

			expect(crypto.createHash).toHaveBeenCalledWith('sha256');
			expect(mockHashInstance.update).toHaveBeenCalledWith(dataWithWhitespace);
	 		expect(mockHashInstance.digest).toHaveBeenCalledWith('base64url');
	 		expect(result).toBe(expectedHash);
	 	});

	 	it('should always use SHA256 algorithm', () => {
	 		hashService.sha256('any data');

			expect(crypto.createHash).toHaveBeenCalledWith('sha256');
	 	});

		it('should always use UTF-8 encoding for input', () => {
			const testData = 'encoding test';
			hashService.sha256(testData);

			expect(mockHashInstance.update).toHaveBeenCalledWith(testData);
		});

	 	it('should always output base64url format', () => {
	 		hashService.sha256('format test');

	 		expect(mockHashInstance.digest).toHaveBeenCalledWith('base64url');
	 	});

		it('should handle crypto errors', () => {
			const cryptoError = new Error('Hash creation failed');
			vi.mocked(crypto.createHash).mockImplementation(() => {
				throw cryptoError;
			});

			expect(() => hashService.sha256('test'))
				.toThrow('Hash creation failed');
		});

	 	it('should handle update errors', () => {
	 		const updateError = new Error('Hash update failed');
	 		mockHashInstance.update.mockImplementation(() => {
	 			throw updateError;
	 		});

	 		expect(() => hashService.sha256('test'))
	 			.toThrow('Hash update failed');
	 	});

	 	it('should handle digest errors', () => {
	 		const digestError = new Error('Hash digest failed');
	 		mockHashInstance.digest.mockImplementation(() => {
	 			throw digestError;
	 		});

	 		expect(() => hashService.sha256('test'))
	 			.toThrow('Hash digest failed');
	 	});

	 	it('should create new hash instance for each call', () => {
	 		hashService.sha256('first');
	 		hashService.sha256('second');

			expect(crypto.createHash).toHaveBeenCalledTimes(2);
	 	});

	 	it('should call methods in correct order', () => {
	 		const testData = 'order test';
	 		hashService.sha256(testData);

	 		// Verify call order
			const createHashCall = vi.mocked(crypto.createHash).mock.invocationCallOrder[0];
	 		const updateCall = mockHashInstance.update.mock.invocationCallOrder[0];
	 		const digestCall = mockHashInstance.digest.mock.invocationCallOrder[0];

	 		expect(createHashCall).toBeLessThan(updateCall);
	 		expect(updateCall).toBeLessThan(digestCall);
	 	});

	 	it('should return the exact value from digest', () => {
	 		const digestValue = 'exact-digest-value-12345';
	 		mockHashInstance.digest.mockReturnValue(digestValue);

	 		const result = hashService.sha256('test');

	 		expect(result).toBe(digestValue);
	 	});

	 	it('should handle null return from digest', () => {
	 		mockHashInstance.digest.mockReturnValue(null);

	 		const result = hashService.sha256('test');

	 		expect(result).toBeNull();
	 	});

	 	it('should handle undefined return from digest', () => {
	 		mockHashInstance.digest.mockReturnValue(undefined);

	 		const result = hashService.sha256('test');

	 		expect(result).toBeUndefined();
	 	});
	});

	describe('consistency', () => {
		it('should be deterministic for same input', () => {
			const testData = 'consistency test';
			const expectedHash = 'consistent-hash-result';

			mockHashInstance.digest.mockReturnValue(expectedHash);

			const result1 = hashService.sha256(testData);

			// Reset and call again
			vi.mocked(crypto.createHash).mockReturnValue(mockHashInstance);
			mockHashInstance.digest.mockReturnValue(expectedHash);

			const result2 = hashService.sha256(testData);

			expect(result1).toBe(result2);
		});

	 	it('should produce different hashes for different inputs', () => {
	 		mockHashInstance.digest
	 			.mockReturnValueOnce('hash-for-input1')
	 			.mockReturnValueOnce('hash-for-input2');

	 		const result1 = hashService.sha256('input1');
	 		const result2 = hashService.sha256('input2');

	 		expect(result1).not.toBe(result2);
	 	});
	});

	describe('edge cases', () => {
	 	it('should handle zero-length string', () => {
	 		const result = hashService.sha256('');

			expect(mockHashInstance.update).toHaveBeenCalledWith('');
	 		expect(mockHashInstance.digest).toHaveBeenCalledWith('base64url');
	 	});

	 	it('should handle single character', () => {
	 		const result = hashService.sha256('x');

			expect(mockHashInstance.update).toHaveBeenCalledWith('x');
	 	});

	 	it('should handle only whitespace', () => {
	 		const whitespaceOnly = '   \t\n  ';

	 		hashService.sha256(whitespaceOnly);

			expect(mockHashInstance.update).toHaveBeenCalledWith(whitespaceOnly);
	 	});

	 	it('should handle binary-like content', () => {
	 		const binaryLike = '\x00\x01\x02\x03\xFF\xFE';

	 		hashService.sha256(binaryLike);

			expect(mockHashInstance.update).toHaveBeenCalledWith(binaryLike);
	 	});
	});

	describe('integration behavior', () => {
	 	it('should work with real-world PKCE code verifier', () => {
	 		const codeVerifier = 'dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk';
	 		const expectedChallenge = 'E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM';

	 		mockHashInstance.digest.mockReturnValue(expectedChallenge);

	 		const result = hashService.sha256(codeVerifier);

	 		expect(result).toBe(expectedChallenge);
			expect(mockHashInstance.update).toHaveBeenCalledWith(codeVerifier);
	 	});
	});
});
