// tests/unit/container/factories.test.ts
import { createConfig } from '@/config';
import { Container, createWinstonLoggerService, createHttpServer, TOKENS, createHealthController } from '@/container';
import { createClockService, createUuidService, WinstonLoggerService, HttpServer } from '@/infrastructure';

describe('Factories', () => {
  describe('createWinstonLoggerService', () => {
    it('should_CreateWinstonLoggerService_When_Called', () => {
      // Given
      const container = new Container();
      container.registerSingleton(TOKENS.Config, createConfig);
      container.registerSingleton(TOKENS.Clock, createClockService);

      // When
      const logger = createWinstonLoggerService(container);

      // Then
      expect(logger).toBeInstanceOf(WinstonLoggerService);
    });

    it('should_ReturnFunctionalLogger_When_Created', () => {
      // Given
      const container = new Container();
      container.registerSingleton(TOKENS.Config, createConfig);
      container.registerSingleton(TOKENS.Clock, createClockService);

      // When
      const logger = createWinstonLoggerService(container);

      // Then
      expect(typeof logger.info).toBe('function');
      expect(typeof logger.debug).toBe('function');
      expect(typeof logger.warn).toBe('function');
      expect(typeof logger.error).toBe('function');
      expect(typeof logger.child).toBe('function');
    });

    it('should_NotThrow_When_LoggingWithCreatedLogger', () => {
      // Given
      const container = new Container();
      container.registerSingleton(TOKENS.Config, createConfig);
      container.registerSingleton(TOKENS.Clock, createClockService);
      const logger = createWinstonLoggerService(container);

      // When & Then
      expect(() => logger.info('test')).not.toThrow();
    });
  });

  describe('createHttpServer', () => {
    it('should_CreateHttpServer_When_Called', () => {
      // Given
      const container = new Container();
      container.registerSingleton(TOKENS.Config, createConfig);
      container.registerSingleton(TOKENS.Clock, createClockService);
      container.registerSingleton(TOKENS.Uuid, createUuidService);
      container.registerSingleton(TOKENS.Logger, createWinstonLoggerService);
      container.registerSingleton(TOKENS.HealthController, createHealthController);

      // When
      const httpServer = createHttpServer(container);

      // Then
      expect(httpServer).toBeInstanceOf(HttpServer);
    });

    it('should_ReturnFunctionalServer_When_Created', () => {
      // Given
      const container = new Container();
      container.registerSingleton(TOKENS.Config, createConfig);
      container.registerSingleton(TOKENS.Clock, createClockService);
      container.registerSingleton(TOKENS.Uuid, createUuidService);
      container.registerSingleton(TOKENS.Logger, createWinstonLoggerService);
      container.registerSingleton(TOKENS.HealthController, createHealthController);

      // When
      const httpServer = createHttpServer(container);

      // Then
      expect(typeof httpServer.start).toBe('function');
      expect(typeof httpServer.stop).toBe('function');
      expect(typeof httpServer.getApp).toBe('function');
      expect(typeof httpServer.isRunning).toBe('function');
      expect(typeof httpServer.getServerInfo).toBe('function');
    });

    it('should_CreateServerWithExpressApp_When_Called', () => {
      // Given
      const container = new Container();
      container.registerSingleton(TOKENS.Config, createConfig);
      container.registerSingleton(TOKENS.Clock, createClockService);
      container.registerSingleton(TOKENS.Uuid, createUuidService);
      container.registerSingleton(TOKENS.Logger, createWinstonLoggerService);
      container.registerSingleton(TOKENS.HealthController, createHealthController);

      // When
      const httpServer = createHttpServer(container);
      const app = httpServer.getApp();

      // Then
      expect(app).toBeDefined();
      expect(typeof app.use).toBe('function');
      expect(typeof app.get).toBe('function');
    });
  });
});
