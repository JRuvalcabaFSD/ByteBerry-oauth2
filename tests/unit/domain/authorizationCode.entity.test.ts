import { AuthorizationCodeEntity } from '@/domain';

describe('AuthorizationCode Entity', () => {
  it('should mark code as used', () => {
    const ac = new AuthorizationCodeEntity('AC_1760144531907_4c386500e71f478c', {
      clientId: 'c',
      codeChallenge: 'u',
      scopes: [],
      redirectUri: 'http://cb',
      expiresAt: new Date(Date.now() + 10000),
    });

    expect(ac.used).toBe(false);
    ac.markAsUsed();
    expect(ac.used).toBe(true);
  });

  it('should expire properly', () => {
    const ac = new AuthorizationCodeEntity('AC_1760144531907_4c386500e71f478c', {
      clientId: 'c',
      codeChallenge: 'u',
      scopes: [],
      redirectUri: 'http://cb',
      expiresAt: new Date(Date.now() - 10000),
    });
    expect(ac.isExpired()).toBe(true);
  });
});
