import { ExchangeAuthorizationCodeUseCase } from '@/application';
import { AuthorizationCodeEntity } from '@/domain';
import { IAuthorizationCodeRepository, ILogger } from '@/interfaces';
import { BadRequestError } from '@/shared';

describe('ExchangeAuthorizationCodeUseCase', () => {
  const repo: jest.Mocked<IAuthorizationCodeRepository> = {
    save: jest.fn(),
    findByCode: jest.fn(),
    markAsUsed: jest.fn(),
    delete: jest.fn(),
    cleanupExpired: jest.fn(),
  };

  const mockLogger: jest.Mocked<ILogger> = {
    child: jest.fn(),
    debug: jest.fn(),
    error: jest.fn(),
    info: jest.fn(),
    log: jest.fn(),
    warn: jest.fn(),
  };

  const useCase = new ExchangeAuthorizationCodeUseCase(repo, mockLogger);

  const validCode = new AuthorizationCodeEntity('AC_1760144531907_4c386500e71f478c', {
    clientId: 'client',
    codeChallenge: 'BTDpZonjviT4z9wQIHLLe-KAghBGtV_C7wzIjS2rLJI',
    expiresAt: new Date(Date.now() + 10000),
    redirectUri: 'http://localhost',
    scopes: [],
  });

  beforeEach(() => jest.clearAllMocks());

  it('should exchange a valid code', async () => {
    repo.findByCode.mockResolvedValue(validCode);
    await useCase.execute({
      code: 'AC_1760144531907_4c386500e71f478c',
      clientId: 'client',
      codeVerifier: 'wRLf8CyOfNcgqv3a5QJX-MLLnfprd1JgIZsCnJhc7rd4Lp8Pfsqlu32_Sew07xAW',
      redirectUri: 'http://localhost',
    });
    expect(repo.markAsUsed).toHaveBeenCalledWith('AC_1760144531907_4c386500e71f478c');
  });
  it('should throw if code not found', async () => {
    repo.findByCode.mockResolvedValue(null);

    await expect(
      useCase.execute({
        code: 'AC_1760144531907_4c386500e71f478c',
        clientId: 'client',
        codeVerifier: 'wRLf8CyOfNcgqv3a5QJX-MLLnfprd1JgIZsCnJhc7rd4Lp8Pfsqlu32_Sew07xAW',
        redirectUri: 'http://localhost',
      })
    ).rejects.toThrow(BadRequestError);
  });
  it('should throw if code expired', async () => {
    // Mock con la estructura correcta que espera el use case
    const expiredCode = {
      used: false, // No 'isUsed', sino 'used'
      metadata: {
        // Los datos deben estar en 'metadata'
        clientId: 'client',
        codeChallenge: 'BTDpZonjviT4z9wQIHLLe-KAghBGtV_C7wzIjS2rLJI',
        expiresAt: new Date(Date.now() - 1000), // Expirado (1 segundo atrás)
        redirectUri: 'http://localhost',
        scopes: [],
      },
    } as any;

    repo.findByCode.mockResolvedValue(expiredCode);

    await expect(
      useCase.execute({
        code: 'AC_1760144531907_4c386500e71f478c',
        clientId: 'client',
        codeVerifier: 'wRLf8CyOfNcgqv3a5QJX-MLLnfprd1JgIZsCnJhc7rd4Lp8Pfsqlu32_Sew07xAW',
        redirectUri: 'http://localhost',
      })
    ).rejects.toThrow(BadRequestError);
  });
  it('should throw if code used', async () => {
    // Mock con la estructura correcta que espera el use case
    const usedCode = {
      used: true, // No 'isUsed', sino 'used'
      metadata: {
        // Los datos deben estar en 'metadata'
        clientId: 'client',
        codeChallenge: 'BTDpZonjviT4z9wQIHLLe-KAghBGtV_C7wzIjS2rLJI',
        expiresAt: new Date(Date.now() - 1000), // Expirado (1 segundo atrás)
        redirectUri: 'http://localhost',
        scopes: [],
      },
    } as any;

    repo.findByCode.mockResolvedValue(usedCode);

    await expect(
      useCase.execute({
        code: 'AC_1760144531907_4c386500e71f478c',
        clientId: 'client',
        codeVerifier: 'wRLf8CyOfNcgqv3a5QJX-MLLnfprd1JgIZsCnJhc7rd4Lp8Pfsqlu32_Sew07xAW',
        redirectUri: 'http://localhost',
      })
    ).rejects.toThrow(BadRequestError);
  });
  it('should throw if code used', async () => {
    // Mock con la estructura correcta que espera el use case
    const badUriCode = {
      used: false, // No 'isUsed', sino 'used'
      metadata: {
        // Los datos deben estar en 'metadata'
        clientId: 'client',
        codeChallenge: 'BTDpZonjviT4z9wQIHLLe-KAghBGtV_C7wzIjS2rLJI',
        expiresAt: new Date(Date.now() + 1000), // Expirado (1 segundo atrás)
        redirectUri: 'http://google.com',
        scopes: [],
      },
    } as any;

    repo.findByCode.mockResolvedValue(badUriCode);

    await expect(
      useCase.execute({
        code: 'AC_1760144531907_4c386500e71f478c',
        clientId: 'client',
        codeVerifier: 'wRLf8CyOfNcgqv3a5QJX-MLLnfprd1JgIZsCnJhc7rd4Lp8Pfsqlu32_Sew07xAW',
        redirectUri: 'http://localhost',
      })
    ).rejects.toThrow(BadRequestError);
  });
});
