import { ClientId } from '@/domain';
import { InvalidValueObjectError } from '@/shared';

describe('ClientId', () => {
  it('should create client id when valid value provided', () => {
    const clientId = ClientId.create('valid-client-id-123');

    expect(clientId.getValue()).toBe('valid-client-id-123');
  });

  it('should throw error when value is empty', () => {
    expect(() => ClientId.create('')).toThrow(InvalidValueObjectError);
    expect(() => ClientId.create('   ')).toThrow(InvalidValueObjectError);
  });

  it('should throw error when value too short', () => {
    expect(() => ClientId.create('short')).toThrow(InvalidValueObjectError);
  });

  it('should-throw-error-when-value-too-long', () => {
    const longValue = 'a'.repeat(129);
    expect(() => ClientId.create(longValue)).toThrow(InvalidValueObjectError);
  });

  it('should ReturnTrue When ComparingEqualClientIds', () => {
    const clientId1 = ClientId.create('test-client-id-123');
    const clientId2 = ClientId.create('test-client-id-123');

    expect(clientId1.equals(clientId2)).toBe(true);
  });
});
