import { GenerateAuthorizationCodeUseCase } from '@/application';
import { AuthorizationCodeEntity } from '@/domain';
import { IAuthorizationCodeRepository, ILogger, IUuid } from '@/interfaces';

describe('GenerateAuthorizationCodeUseCase', () => {
  let mockRepo: jest.Mocked<IAuthorizationCodeRepository>;
  let mockLogger: jest.Mocked<ILogger>;
  let mockUuid: jest.Mocked<IUuid>;
  let usecase: GenerateAuthorizationCodeUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    mockRepo = {
      cleanupExpired: jest.fn(),
      delete: jest.fn(),
      findByCode: jest.fn(),
      markAsUsed: jest.fn(),
      save: jest.fn().mockResolvedValue(undefined),
    };

    mockLogger = {
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
      child: jest.fn().mockReturnThis(),
      debug: jest.fn(),
      log: jest.fn(),
    };

    mockUuid = {
      generate: jest.fn().mockReturnValue('550e8400-e29b-41d4-a716-446655440000'),
      isValid: jest.fn().mockReturnValue(true),
    };

    usecase = new GenerateAuthorizationCodeUseCase(mockRepo, mockUuid, mockLogger);
  });

  it('should generate and persist an authorization code', async () => {
    await usecase.execute({
      clientId: 'client123',
      redirectUri: 'https://example.com/callback',
      codeChallenge: 'abc123',
      scopes: ['read', 'write'],
    });

    expect(mockRepo.save).toHaveBeenCalled();
    expect(mockLogger.info).toHaveBeenCalled();

    const saved = mockRepo.save.mock.calls[0][0];
    expect(saved.code).toMatch(/^AC_/);
  });

  it('should fail if it cannot be generated authorization code is invalid', async () => {
    jest.spyOn(AuthorizationCodeEntity.prototype, 'isValid').mockReturnValueOnce(false);

    await expect(
      usecase.execute({
        clientId: 'client123',
        redirectUri: 'https://example.com/callback',
        codeChallenge: 'abc123',
        scopes: ['read', 'write'],
      })
    ).rejects.toThrow('Generated authorization code is invalid');
  });
});
