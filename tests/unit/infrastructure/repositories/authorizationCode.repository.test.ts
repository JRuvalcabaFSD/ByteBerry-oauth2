import { AuthorizationCodeRepositoryImpl } from '@/infrastructure';
import { IAuthorizationCode, ILogger } from '@/interfaces';

describe('AuthorizationCodeRepositoryImpl (Coverage for specified lines)', () => {
  let mockAuthCode: IAuthorizationCode;
  let mockLogger: ILogger;
  let repository: AuthorizationCodeRepositoryImpl;

  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
    mockAuthCode = {
      code: 'valid-code-123',
      used: false,
      createAt: new Date(),
      metadata: {
        clientId: 'client-1',
        expiresAt: new Date(Date.now() + 3600000), // Válido por 1 hora
        codeChallenge: 'rDrwEEnh8J4V5h_YBxVkEnPLCzSKb17iKcvsPb-BD-4',
        redirectUri: 'http://localhost',
        scopes: [],
      },
    };

    mockLogger = {
      debug: jest.fn(),
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
      child: jest.fn(),
      log: jest.fn(),
    };

    repository = new AuthorizationCodeRepositoryImpl(mockLogger);
  });

  afterEach(() => {
    repository.stopCleanupTask();
    jest.useRealTimers();
  });

  describe('save', () => {
    it('should save a new authorization code and log info', async () => {
      await repository.save(mockAuthCode);

      expect(await repository.findByCode(mockAuthCode.code)).toEqual(mockAuthCode);
      expect(mockLogger.debug).toHaveBeenCalledWith('Saving authorization code', expect.any(Object));
    });
  });
  describe('findByCode', () => {
    it('should return the authorization code if found and log found', async () => {
      await repository.save(mockAuthCode);

      const foundCode = await repository.findByCode(mockAuthCode.code);

      expect(foundCode).toEqual(mockAuthCode);
      expect(mockLogger.debug).toHaveBeenCalledWith('Authorization code found', expect.any(Object));
    });

    it('should return null if not found and log not found', async () => {
      const nonExistingCode = 'non-exist';

      const foundCode = await repository.findByCode(nonExistingCode);

      expect(foundCode).toBeNull();
      expect(mockLogger.debug).toHaveBeenCalledWith('Authorization code not found', expect.any(Object));
    });
  });

  describe('markAsUsed', () => {
    it('should mark an existing code as used and log info', async () => {
      await repository.save(mockAuthCode);

      await repository.markAsUsed(mockAuthCode.code);

      const updateCode = await repository.findByCode(mockAuthCode.code);
      expect(updateCode?.used).toBe(true); // Better assertion
      expect(mockLogger.debug).toHaveBeenCalledWith('Marking authorization code as used', expect.any(Object));
    });
    it('should log a warning if the code is not found', async () => {
      const nonExistentCode = 'non-existent';

      await repository.markAsUsed(nonExistentCode);

      expect(mockLogger.warn).toHaveBeenCalledWith('Authorization code not found for marking', expect.any(Object));
    });
  });
  describe('delete', () => {
    it('should delete an existing code and log info', async () => {
      await repository.save(mockAuthCode);
      await repository.delete(mockAuthCode.code);

      expect(await repository.findByCode(mockAuthCode.code)).toBeNull();
      expect(mockLogger.info).toHaveBeenCalledWith('Authorization code deleted', expect.any(Object));
    });

    it('should log a warning if the code is not found for deletion', async () => {
      const nonExistentCode = 'non-existent';

      await repository.delete(nonExistentCode);

      expect(mockLogger.warn).toHaveBeenCalledWith('Authorization code not found for deletion', expect.any(Object));
    });
  });
  describe('cleanupExpired', () => {
    it('should delete only expired codes and log info when codes are deleted', async () => {
      const now = Date.now();
      jest.setSystemTime(now); // Fija la hora actual

      const expiringCode = { ...mockAuthCode, code: 'expiring-1', metadata: { ...mockAuthCode.metadata } };

      expiringCode.metadata.expiresAt = new Date(now - 1000);

      await repository.save(expiringCode);
      await repository.save(mockAuthCode);

      const deletedCount = await repository.cleanupExpired();

      expect(deletedCount).toBe(1);
      expect(await repository.count()).toBe(1);
      expect(await repository.findByCode(expiringCode.code)).toBeNull();
      expect(await repository.findByCode(mockAuthCode.code)).toEqual(mockAuthCode);
      expect(mockLogger.info).toHaveBeenCalledWith(
        'Expired authorization codes deleted',
        expect.objectContaining({ context: expect.any(String), deleteCount: 1 })
      );
    });

    it('should not log info if no codes are deleted', async () => {
      await repository.save(mockAuthCode);

      const deletedCount = await repository.cleanupExpired();

      expect(deletedCount).toBe(0);
      expect(mockLogger.info).not.toHaveBeenCalledWith('Expired authorization codes deleted', expect.any(Object));
    });
  });
  describe('clear', () => {
    it('should clear all codes and log warn/info', async () => {
      await repository.save(mockAuthCode);
      await repository.save({ ...mockAuthCode, code: 'another-code' });

      await repository.clear();

      expect(await repository.count()).toBe(0);
      expect(mockLogger.warn).toHaveBeenCalledWith('Clearing all authorization codes', expect.any(Object));
      expect(mockLogger.info).toHaveBeenCalledWith('All authorization codes cleared', expect.any(Object));
    });
  });

  describe('startCleanupTask and interval logic', () => {
    it('should start the cleanup interval and log info', async () => {
      const expiredCode = {
        ...mockAuthCode,
        code: 'expired-code',
        metadata: {
          ...mockAuthCode.metadata,
          expiresAt: new Date(Date.now() - 1000), // Expirado en el pasado
        },
      };

      await repository.save(expiredCode);
      expect(mockLogger.info).toHaveBeenCalledWith('Cleanup task started', expect.any(Object));

      jest.spyOn(repository, 'cleanupExpired');
      jest.advanceTimersByTime(60000);

      expect(repository.cleanupExpired).toHaveBeenCalled();

      jest.advanceTimersByTime(60000);

      await Promise.resolve();

      expect(mockLogger.info).toHaveBeenCalledWith('Cleanup task completed', expect.anything());
    });

    it('should log an error if cleanupExpired fails within the task', async () => {
      // Simular un error en cleanupExpired
      const cleanupExpiredSpy = jest.spyOn(repository, 'cleanupExpired').mockRejectedValue(new Error('Cleanup failed'));

      // Línea 237: } catch (error) {
      // Línea 238: this.logger.error('Cleanup task failed', { ... });
      jest.advanceTimersByTime(60000);
      await Promise.resolve();
      expect(cleanupExpiredSpy).toHaveBeenCalled();
      expect(mockLogger.error).toHaveBeenCalledWith('Cleanup task failed', expect.anything());

      cleanupExpiredSpy.mockRestore();
    });
  });
});
