import { CodeChallenge } from '@/domain';
import { InvalidValueObjectError } from '@/shared';

describe('CodeChallenge', () => {
  const validChallenge = 'dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk';

  it('should create code challenge when valid s256 provided', () => {
    const codeChallenge = CodeChallenge.create(validChallenge, 'S256');

    expect(codeChallenge.getChallenge()).toBe(validChallenge);
    expect(codeChallenge.getMethod()).toBe('S256');
    expect(codeChallenge.isPlainMethod()).toBe(false);
  });

  it('should create code challenge when valid plain provided', () => {
    const codeChallenge = CodeChallenge.create(validChallenge, 'plain');

    expect(codeChallenge.getMethod()).toBe('plain');
    expect(codeChallenge.isPlainMethod()).toBe(true);
  });

  it('should throw error when challenge too short', () => {
    expect(() => CodeChallenge.create('short', 'S256')).toThrow(InvalidValueObjectError);
  });

  it('should throw error when challenge not base64url', () => {
    const invalidChallenge = 'invalid+challenge/with=invalid+chars!!';
    expect(() => CodeChallenge.create(invalidChallenge, 'S256')).toThrow(InvalidValueObjectError);
  });

  it('should verify plain when method is plain', () => {
    const codeChallenge = CodeChallenge.create(validChallenge, 'plain');

    expect(codeChallenge.verifyPlain(validChallenge)).toBe(true);
    expect(codeChallenge.verifyPlain('wrong-verifier')).toBe(false);
  });
});
