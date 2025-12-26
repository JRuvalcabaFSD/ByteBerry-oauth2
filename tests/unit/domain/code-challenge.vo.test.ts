import { CodeChallengeVO } from '@domain';
import { ValueObjectError } from '@domain';

describe('CodeChallengeVO', () => {
	const validChallenge = 'dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk';

	it('should create valid CodeChallengeVO with S256 method', () => {
		const codeChallenge = CodeChallengeVO.create(validChallenge, 'S256');

		expect(codeChallenge.getChallenge()).toBe(validChallenge);
		expect(codeChallenge.getMethod()).toBe('S256');
		expect(codeChallenge.isPlainMethod()).toBe(false);
	});

	it('should create valid CodeChallengeVO with plain method', () => {
		const codeChallenge = CodeChallengeVO.create(validChallenge, 'plain');

		expect(codeChallenge.getMethod()).toBe('plain');
		expect(codeChallenge.isPlainMethod()).toBe(true);
	});

	it('should throw error for invalid challenge', () => {
		expect(() => CodeChallengeVO.create('', 'S256')).toThrow(ValueObjectError);
		expect(() => CodeChallengeVO.create('short', 'S256')).toThrow(ValueObjectError);
	});

	it('should throw error for invalid method', () => {
		expect(() => CodeChallengeVO.create(validChallenge, 'MD5' as any)).toThrow(ValueObjectError);
	});

	it('should verify plain challenge correctly', () => {
		const codeChallenge = CodeChallengeVO.create(validChallenge, 'plain');

		expect(codeChallenge.verifyPlain(validChallenge)).toBe(true);
		expect(codeChallenge.verifyPlain('wrong-verifier')).toBe(false);
	});
});
