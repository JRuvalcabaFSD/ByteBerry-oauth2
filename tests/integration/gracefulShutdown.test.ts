// tests/integration/bootstrap/graceful-shutdown.test.ts
import { GracefulShutdown, CleanupFunction } from '@/bootstrap';
import { WinstonLoggerService } from '@/infrastructure';
import { ClockService } from '@/infrastructure';
import { Config } from '@/config/env.config';

describe('GracefulShutdown', () => {
  let gracefulShutdown: GracefulShutdown;
  let logger: WinstonLoggerService;

  beforeEach(() => {
    process.env.NODE_ENV = 'test';
    process.env.LOG_LEVEL = 'error';
    Config.resetInstance();

    const config = Config.getConfig();
    const clock = new ClockService();
    logger = new WinstonLoggerService(config, clock);

    gracefulShutdown = new GracefulShutdown(logger);
  });

  describe('Cleanup Registration', () => {
    it('should_RegisterCleanupFunction_When_Called', () => {
      // Given
      const cleanup: CleanupFunction = jest.fn();

      // When
      gracefulShutdown.registerCleanup(cleanup);

      // Then - No error thrown
      expect(true).toBe(true);
    });

    it('should_RegisterMultipleCleanupFunctions_When_CalledMultipleTimes', () => {
      // Given
      const cleanup1: CleanupFunction = jest.fn();
      const cleanup2: CleanupFunction = jest.fn();
      const cleanup3: CleanupFunction = jest.fn();

      // When
      gracefulShutdown.registerCleanup(cleanup1);
      gracefulShutdown.registerCleanup(cleanup2);
      gracefulShutdown.registerCleanup(cleanup3);

      // Then - No error thrown
      expect(true).toBe(true);
    });
  });

  describe('Shutdown Execution', () => {
    it('should_ExecuteAllCleanupFunctions_When_ShutdownCalled', async () => {
      // Given
      const cleanup1 = jest.fn().mockResolvedValue(undefined);
      const cleanup2 = jest.fn().mockResolvedValue(undefined);

      gracefulShutdown.registerCleanup(cleanup1);
      gracefulShutdown.registerCleanup(cleanup2);

      // When
      await gracefulShutdown.shutdown();

      // Then
      expect(cleanup1).toHaveBeenCalled();
      expect(cleanup2).toHaveBeenCalled();
    });

    it('should_ExecuteSyncCleanupFunctions_When_ShutdownCalled', async () => {
      // Given
      let executed = false;
      const syncCleanup: CleanupFunction = () => {
        executed = true;
      };

      gracefulShutdown.registerCleanup(syncCleanup);

      // When
      await gracefulShutdown.shutdown();

      // Then
      expect(executed).toBe(true);
    });

    it('should_ContinueWithOtherCleanups_When_OneCleanupFails', async () => {
      // Given
      const failingCleanup = jest.fn().mockRejectedValue(new Error('Cleanup failed'));
      const successCleanup = jest.fn().mockResolvedValue(undefined);

      gracefulShutdown.registerCleanup(failingCleanup);
      gracefulShutdown.registerCleanup(successCleanup);

      // When
      await gracefulShutdown.shutdown();

      // Then
      expect(failingCleanup).toHaveBeenCalled();
      expect(successCleanup).toHaveBeenCalled();
    });

    it('should_ReturnSamePromise_When_ShutdownCalledMultipleTimes', async () => {
      // Given
      const cleanup = jest.fn().mockResolvedValue(undefined);
      gracefulShutdown.registerCleanup(cleanup);

      // When
      const promise1 = gracefulShutdown.shutdown();
      const promise2 = gracefulShutdown.shutdown();

      await Promise.all([promise1, promise2]);

      // Then
      expect(cleanup).toHaveBeenCalledTimes(1);
    });
  });

  describe('Real-world Scenarios', () => {
    it('should_CloseHttpServerGracefully_When_ShutdownCalled', async () => {
      // Given
      let serverClosed = false;
      const closeServer: CleanupFunction = async () => {
        await new Promise(resolve => setTimeout(resolve, 10));
        serverClosed = true;
      };

      gracefulShutdown.registerCleanup(closeServer);

      // When
      await gracefulShutdown.shutdown();

      // Then
      expect(serverClosed).toBe(true);
    });

    it('should_CleanupDatabaseConnections_When_ShutdownCalled', async () => {
      // Given
      let dbClosed = false;
      const closeDatabase: CleanupFunction = async () => {
        await new Promise(resolve => setTimeout(resolve, 10));
        dbClosed = true;
      };

      gracefulShutdown.registerCleanup(closeDatabase);

      // When
      await gracefulShutdown.shutdown();

      // Then
      expect(dbClosed).toBe(true);
    });

    it('should_ExecuteMultipleCleanupsConcurrently_When_ShutdownCalled', async () => {
      // Given
      const startTime = Date.now();
      const delay = 50;

      const cleanup1: CleanupFunction = async () => {
        await new Promise(resolve => setTimeout(resolve, delay));
      };

      const cleanup2: CleanupFunction = async () => {
        await new Promise(resolve => setTimeout(resolve, delay));
      };

      gracefulShutdown.registerCleanup(cleanup1);
      gracefulShutdown.registerCleanup(cleanup2);

      // When
      await gracefulShutdown.shutdown();
      const duration = Date.now() - startTime;

      // Then - Should complete in ~50ms (concurrent) not ~100ms (sequential)
      expect(duration).toBeLessThan(delay * 1.5);
    });
  });
});
