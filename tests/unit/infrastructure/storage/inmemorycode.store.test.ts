import { InMemoryCodeStore } from '@/infrastructure';
import { AuthorizationCodeEntity, ClientId, CodeChallenge } from '@/domain';
import { ILogger } from '@/interfaces';

describe('InMemoryCodeStore', () => {
  let store: InMemoryCodeStore;
  let mockLogger: jest.Mocked<ILogger>;
  let mockAuthCode: AuthorizationCodeEntity;

  beforeEach(() => {
    mockLogger = {
      debug: jest.fn(),
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
    } as unknown as jest.Mocked<ILogger>;

    store = new InMemoryCodeStore(mockLogger);

    const clientId = ClientId.create('test-client-12345');
    const codeChallenge = CodeChallenge.create('dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk', 'S256');

    mockAuthCode = AuthorizationCodeEntity.create({
      code: 'test-code-123',
      clientId,
      redirectUri: 'https://example.com/callback',
      codeChallenge,
      expirationMinutes: 5,
    });
  });

  afterEach(() => {
    store.shutdown();
  });

  it('should store and retrieve code when set and get called', () => {
    store.set('test-code', mockAuthCode);

    const retrieved = store.get('test-code');
    expect(retrieved).toBe(mockAuthCode);
  });

  it('should return undefined when code not found', () => {
    const retrieved = store.get('non-existent-code');
    expect(retrieved).toBeUndefined();
  });

  it('should return true when code exists', () => {
    store.set('test-code', mockAuthCode);

    expect(store.has('test-code')).toBe(true);
    expect(store.has('non-existent')).toBe(false);
  });

  it('should remove expired codes when cleanup called', () => {
    const expiredCode = AuthorizationCodeEntity.create({
      code: 'expired-code',
      clientId: ClientId.create('test-client-12345'),
      redirectUri: 'https://example.com/callback',
      codeChallenge: CodeChallenge.create('dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk', 'S256'),
      expirationMinutes: -1, // Already expired
    });

    store.set('expired', expiredCode);
    store.set('valid', mockAuthCode);

    store.cleanedExpired();

    expect(store.has('expired')).toBe(false);
    expect(store.has('valid')).toBe(true);
    expect(mockLogger.debug).toHaveBeenCalled();
  });

  it('should shutdown cleanly when shutdown called', () => {
    expect(() => store.shutdown()).not.toThrow();
  });
});
