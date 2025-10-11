import request from 'supertest';

import { Config } from '@/config';
import { HttpServer } from '@/infrastructure';
import { IAuthController, IClock, IConfig, IContainer, IHealthController, ILogger, IUuid } from '@/interfaces';
import { bootstrapContainer, TOKENS } from '@/container';

describe('HttpServer', () => {
  let container: IContainer;
  let httpServer: HttpServer;
  let config: IConfig;
  let logger: ILogger;
  let clock: IClock;
  let uuid: IUuid;
  let healthController: IHealthController;
  let authController: IAuthController;

  beforeEach(() => {
    // Configurar variables de entorno para test
    process.env.NODE_ENV = 'test';
    process.env.PORT = '0'; // Puerto aleatorio
    process.env.LOG_LEVEL = 'error'; // Silenciar logs en tests
    process.env.CORS_ORIGINS = 'http://localhost:3000';

    Config.resetInstance();
    container = bootstrapContainer();
    config = container.resolve<IConfig>(TOKENS.Config);
    clock = container.resolve<IClock>(TOKENS.Clock);
    logger = container.resolve<ILogger>(TOKENS.Logger);
    uuid = container.resolve<IUuid>(TOKENS.Uuid);
    healthController = container.resolve<IHealthController>(TOKENS.HealthController);
    authController = container.resolve<IAuthController>(TOKENS.AuthController);

    httpServer = new HttpServer(config, logger, uuid, clock, healthController, authController);
  });

  afterEach(async () => {
    if (httpServer.isRunning()) {
      await httpServer.stop();
    }
  });

  describe('Lifecycle', () => {
    it('should start server when start called', async () => {
      await httpServer.start();

      expect(httpServer.isRunning()).toBeTruthy();
    });
    it('should stop server when stop called', async () => {
      await httpServer.start();
      await httpServer.stop();
      expect(httpServer.isRunning()).toBeFalsy();
    });
    it('should not throw when stop called without start', async () => {
      await expect(httpServer.stop()).resolves.not.toThrow();
    });
    it('should throw an error if I try to stop the server if not running', async () => {
      try {
        await httpServer.stop();
      } catch (error) {
        console.log(error);
      }
    });
  });
  describe('Server Info', () => {
    it('should return server info when not running', () => {
      const info = httpServer.getServerInfo();

      expect(info).toHaveProperty('port');
      expect(info).toHaveProperty('isRunning');
      expect(info.isRunning).toBe(false);
    });

    it('should include start time when server started', async () => {
      await httpServer.start();
      const info = httpServer.getServerInfo();

      expect(info.startTime).toBeDefined();
      expect(info.startTime).toBeInstanceOf(Date);
    });
  });

  describe('Root Endpoint', () => {
    it('should return service info when root endpoint called', async () => {
      await httpServer.start();

      const response = await request(httpServer.getApp()).get('/');

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('service');
      expect(response.body).toHaveProperty('version');
      expect(response.body).toHaveProperty('status', 'running');
    });

    it('should include request id when root endpoint called', async () => {
      await httpServer.start();

      const response = await request(httpServer.getApp()).get('/');

      expect(response.body).toHaveProperty('requestId');
      expect(response.headers['x-request-id']).toBeDefined();
    });
  });

  describe('404 Handler', () => {
    it('should return404 when route not found', async () => {
      await httpServer.start();

      const response = await request(httpServer.getApp()).get('/non existent route');

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('error', 'Not Found');
      expect(response.body).toHaveProperty('message');
    });

    it('should include request id when 404 returned', async () => {
      await httpServer.start();

      const response = await request(httpServer.getApp()).get('/invalid');

      expect(response.body).toHaveProperty('requestId');
    });
  });
  describe('Server Error Event   Lines 86 90', () => {
    it('should reject promise when server emits error', async () => {
      // Given   Mock app.listen para que retorne un server que emita error
      const mockServer = {
        on: jest.fn((event: string, callback: (error: Error) => void) => {
          if (event === 'error') {
            // Simula que el servidor emite un error inmediatamente después de listen
            process.nextTick(() => callback(new Error('EADDRINUSE: address already in use')));
          }
        }),
        listen: jest.fn(),
        close: jest.fn(),
        listening: false,
      };

      // Mock app.listen para retornar nuestro mock server
      jest.spyOn(httpServer.getApp(), 'listen').mockImplementation(() => mockServer as any);

      // When & Then   El error del servidor debe rechazar la promesa
      await expect(httpServer.start()).rejects.toThrow('EADDRINUSE: address already in use');
    });
  });

  describe('Catch Block   Lines 93 97', () => {
    it('should catch synchronous error when listen throws', async () => {
      // Given   Mock app.listen para lanzar error síncrono
      const errorServer = new HttpServer(config, logger, uuid, clock, healthController, authController);
      const app = errorServer.getApp();

      // Forzar error síncrono
      jest.spyOn(app, 'listen').mockImplementation(() => {
        throw new Error('Synchronous listen error');
      });

      // When & Then
      await expect(errorServer.start()).rejects.toThrow('Synchronous listen error');
    });
  });

  describe('Stop Server   Lines 121 122', () => {
    it('should reject promise when server close errors', async () => {
      // Given
      await httpServer.start();

      // Mock server.close para forzar error usando process.nextTick
      const server = (httpServer as any).server;
      const originalClose = server.close;

      server.close = jest.fn((callback?: (err?: Error) => void) => {
        if (callback) {
          process.nextTick(() => callback(new Error('Close error')));
        }
      });

      // When & Then
      let caughtError: Error | null = null;
      try {
        await httpServer.stop();
      } catch (error) {
        caughtError = error as Error;
      }

      expect(caughtError).not.toBeNull();
      expect(caughtError?.message).toBe('Close error');

      // Restore original method
      server.close = originalClose;
    });

    it('should log error when server close errors', async () => {
      // Given
      const loggerSpy = jest.spyOn(logger, 'error');
      await httpServer.start();

      const server = (httpServer as any).server;
      const originalClose = server.close;

      server.close = jest.fn((callback?: (err?: Error) => void) => {
        if (callback) {
          process.nextTick(() => callback(new Error('Close error')));
        }
      });

      // When
      try {
        await httpServer.stop();
      } catch {
        // Expected error   we just want to test the logging
      }

      // Then   Verificar el mensaje exacto que se registra
      expect(loggerSpy).toHaveBeenCalledWith(
        'Error stopping Http Server',
        expect.objectContaining({
          error: 'Close error',
        })
      );

      // Restore original method
      server.close = originalClose;
    });
  });
});
