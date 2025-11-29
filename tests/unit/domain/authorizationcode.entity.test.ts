import { AuthorizationCodeEntity, ClientId, CodeChallenge } from '@/domain';

describe('AuthorizationCodeEntity', () => {
  const mockClientId = ClientId.create('test-client-12345');
  const mockCodeChallenge = CodeChallenge.create('dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk', 'S256');

  it('should create entity when valid parameters provided', () => {
    const authCode = AuthorizationCodeEntity.create({
      code: 'test-code-123',
      clientId: mockClientId,
      userId: 'test-user',
      redirectUri: 'https://example.com/callback',
      codeChallenge: mockCodeChallenge,
      expirationMinutes: 5,
      scope: 'read write',
      state: 'xyz',
    });

    expect(authCode.code).toBe('test-code-123');
    expect(authCode.clientId).toBe(mockClientId);
    expect(authCode.redirectUri).toBe('https://example.com/callback');
    expect(authCode.scope).toBe('read write');
    expect(authCode.state).toBe('xyz');
  });

  it('should return false when code not expired', () => {
    const authCode = AuthorizationCodeEntity.create({
      code: 'test-code',
      clientId: mockClientId,
      userId: 'test-user',
      redirectUri: 'https://example.com/callback',
      codeChallenge: mockCodeChallenge,
      expirationMinutes: 5,
    });

    expect(authCode.isExpired()).toBe(false);
  });

  it('should return true when code is expired', () => {
    const authCode = AuthorizationCodeEntity.create({
      code: 'test-code',
      clientId: mockClientId,
      userId: 'test-user',
      redirectUri: 'https://example.com/callback',
      codeChallenge: mockCodeChallenge,
      expirationMinutes: -1, // Expired 1 minute ago
    });

    expect(authCode.isExpired()).toBe(true);
  });

  it('should mark as used when method called', () => {
    const authCode = AuthorizationCodeEntity.create({
      code: 'test-code',
      clientId: mockClientId,
      userId: 'test-user',
      redirectUri: 'https://example.com/callback',
      codeChallenge: mockCodeChallenge,
    });

    expect(authCode.isUsed()).toBe(false);
    authCode.markAsUsed();
    expect(authCode.isUsed()).toBe(true);
  });

  it('should create without optional params when not provided', () => {
    const authCode = AuthorizationCodeEntity.create({
      code: 'test-code',
      clientId: mockClientId,
      userId: 'test-user',
      redirectUri: 'https://example.com/callback',
      codeChallenge: mockCodeChallenge,
    });

    expect(authCode.scope).toBeUndefined();
    expect(authCode.scope).toBeUndefined();
  });
});
