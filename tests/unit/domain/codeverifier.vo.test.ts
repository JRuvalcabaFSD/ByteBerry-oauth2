import { CodeVerifier } from '@/domain';
import { InvalidValueObjectError } from '@/shared';

describe('CodeVerifier', () => {
  const validVerifier = 'dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk';

  it('should create code verifier when valid value provided', () => {
    const codeVerifier = CodeVerifier.create(validVerifier);

    expect(codeVerifier.getValue()).toBe(validVerifier);
  });

  it('should throw error when value is empty', () => {
    expect(() => CodeVerifier.create('')).toThrow(InvalidValueObjectError);
    expect(() => CodeVerifier.create('   ')).toThrow(InvalidValueObjectError);
  });

  it('should throw error when value too short', () => {
    expect(() => CodeVerifier.create('short')).toThrow(InvalidValueObjectError);
  });

  it('should throw error when value too long', () => {
    const longValue = 'a'.repeat(129);
    expect(() => CodeVerifier.create(longValue)).toThrow(InvalidValueObjectError);
  });

  it('should throw error when not base64url encoded', () => {
    const invalidVerifier = 'invalid+verifier/with=invalid+chars!!';
    expect(() => CodeVerifier.create(invalidVerifier)).toThrow(InvalidValueObjectError);
  });
});
