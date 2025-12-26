import { CodeVerifierVO } from '@domain';
import { ValueObjectError } from '@domain';

describe('CodeVerifierVO', () => {
	const validVerifier = 'dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk';

	it('should create valid CodeVerifierVO', () => {
		const codeVerifier = CodeVerifierVO.create(validVerifier);

		expect(codeVerifier.getValue()).toBe(validVerifier);
	});

	it('should throw error for empty verifier', () => {
		expect(() => CodeVerifierVO.create('')).toThrow(ValueObjectError);
		expect(() => CodeVerifierVO.create('   ')).toThrow(ValueObjectError);
	});

	it('should throw error for verifier too short', () => {
		const shortVerifier = 'a'.repeat(42);
		expect(() => CodeVerifierVO.create(shortVerifier)).toThrow(ValueObjectError);
	});

	it('should throw error for verifier too long', () => {
		const longVerifier = 'a'.repeat(129);
		expect(() => CodeVerifierVO.create(longVerifier)).toThrow(ValueObjectError);
	});

	it('should throw error for invalid characters in verifier', () => {
		const invalidVerifier = 'invalid@verifier#with$special%chars'.padEnd(43, 'a');
		expect(() => CodeVerifierVO.create(invalidVerifier)).toThrow(ValueObjectError);
	});
});
