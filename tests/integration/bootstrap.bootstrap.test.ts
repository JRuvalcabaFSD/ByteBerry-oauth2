// tests/integration/bootstrap/bootstrap.test.ts
import { bootstrap, BootstrapResult } from '@/bootstrap';
import { Config } from '@/config/env.config';
import { IHttpServer } from '@/interfaces';

describe('Bootstrap', () => {
  let bootstrapResult: BootstrapResult;

  beforeEach(() => {
    // Configurar env para tests
    process.env.NODE_ENV = 'test';
    process.env.PORT = '0'; // Puerto aleatorio
    process.env.LOG_LEVEL = 'error'; // Silenciar logs
    process.env.SERVICE_NAME = 'test-service';
    process.env.CORS_ORIGINS = 'http://localhost:3000';

    Config.resetInstance();
  });

  afterEach(async () => {
    if (bootstrapResult?.shutdown) {
      await bootstrapResult.shutdown.shutdown();
    }
  });

  describe('Successful Bootstrap', () => {
    it('should return container and shutdown when bootstrap succeeds', async () => {
      // When
      bootstrapResult = await bootstrap();

      // Then
      expect(bootstrapResult).toBeDefined();
      expect(bootstrapResult.container).toBeDefined();
      expect(bootstrapResult.shutdown).toBeDefined();
    });

    it('should start http server when bootstrap succeeds', async () => {
      // When
      bootstrapResult = await bootstrap();
      const httpServer = bootstrapResult.container.resolve<IHttpServer>(Symbol.for('HttpServer'));
      await httpServer.start();

      // Debug information
      console.log('Server instance exists:', !!httpServer);
      console.log('Server is running:', httpServer.isRunning());

      // Then
      expect(httpServer).toBeDefined();
      expect(httpServer.isRunning()).toBe(true);
    });

    it('should validate all critical services when bootstrap succeeds', async () => {
      // When
      bootstrapResult = await bootstrap();

      // Then   Resolver servicios críticos sin error
      expect(() => bootstrapResult.container.resolve(Symbol.for('Config'))).not.toThrow();
      expect(() => bootstrapResult.container.resolve(Symbol.for('Logger'))).not.toThrow();
      expect(() => bootstrapResult.container.resolve(Symbol.for('Clock'))).not.toThrow();
      expect(() => bootstrapResult.container.resolve(Symbol.for('Uuid'))).not.toThrow();
      expect(() => bootstrapResult.container.resolve(Symbol.for('HttpServer'))).not.toThrow();
    });

    it('should register shutdown cleanup when bootstrap succeeds', async () => {
      // Given
      bootstrapResult = await bootstrap();
      const httpServer = bootstrapResult.container.resolve<IHttpServer>(Symbol.for('HttpServer'));

      // When
      await bootstrapResult.shutdown.shutdown();

      // Then
      expect(httpServer.isRunning()).toBe(false);
    });
  });

  describe('Bootstrap Failure Scenarios', () => {
    it('should throw bootstrap error when invalid port provided', async () => {
      // Given
      process.env.PORT = 'invalid-port';
      Config.resetInstance();

      // When & Then
      await expect(bootstrap()).rejects.toThrow();
    });

    it('should throw bootstrap error when required env var missing', async () => {
      // Given - First mock dotenv to prevent any .env file loading
      jest.doMock('dotenv', () => ({
        config: jest.fn(() => ({ parsed: {} })), // Return empty parsed object
      }));

      // Reset modules to ensure fresh imports
      jest.resetModules();

      // Delete the environment variable AFTER mocking dotenv
      delete process.env.CORS_ORIGINS;
      delete process.env.SERVICE_NAME; // Also delete other required vars if needed

      // Verify it's actually deleted
      expect(process.env.CORS_ORIGINS).toBeUndefined();

      // Reset config instance to force re-reading environment
      const { Config } = await import('@config'); // Dynamic import after reset
      Config.resetInstance();

      // Import bootstrap after all setup
      const { bootstrap } = await import('@/bootstrap/bootstrap');

      // When & Then
      await expect(bootstrap()).rejects.toThrow(/CORS_ORIGINS.*required/);

      // Cleanup
      jest.dontMock('dotenv');
      jest.resetModules();
    });
  });

  describe('Multiple Bootstrap Calls', () => {
    it('should allow multiple bootstraps when previous shutdown completes', async () => {
      // Given
      const first = await bootstrap();
      await first.shutdown.shutdown();

      // When
      const second = await bootstrap();

      // Then
      expect(second.container).toBeDefined();
      expect(second.shutdown).toBeDefined();

      // Cleanup
      await second.shutdown.shutdown();
    });
  });
});
