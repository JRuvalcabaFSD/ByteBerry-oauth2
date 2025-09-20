import request from 'supertest';

import { HttpServer } from '@/infrastructure';
import { IEnvConfig, IHttpServer, ILogger, IUuid } from '@/interfaces';

describe('HttpServer - T007 Integration', () => {
  let httpServer: IHttpServer;
  let mockConfig: IEnvConfig;
  let mockUuid: IUuid;
  let mockLogger: ILogger;

  beforeEach(() => {
    mockConfig = {
      port: 3000,
      nodeEnv: 'test',
      logLevel: 'info',
      isDevelopment: () => false,
      isProduction: () => false,
      isTest: () => true,
    };

    mockUuid = {
      generate: jest.fn(() => 'test-uuid-12345'),
    };

    mockLogger = {
      debug: jest.fn(),
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
      log: jest.fn(),
      setDefaultContext: jest.fn(),
    };

    httpServer = new HttpServer(mockConfig, mockUuid, mockLogger);
  });

  afterEach(async () => {
    if (httpServer.isRunning()) {
      await httpServer.stop();
    }
  });

  it('should create HttpServer with logger dependency injected', () => {
    // Assert
    expect(httpServer).toBeDefined();
    expect(httpServer.isRunning()).toBe(false);
    expect(httpServer.getApp()).toBeDefined();
  });

  it('should log server start with logger', async () => {
    // Act
    await httpServer.start();

    // Assert
    expect(mockLogger.info).toHaveBeenCalledWith('HTTP Server started', {
      port: 3000,
      environment: 'test',
    });
    expect(httpServer.isRunning()).toBe(true);
  });

  it('should log server stop with logger', async () => {
    // Arrange
    await httpServer.start();

    // Act
    await httpServer.stop();

    // Assert
    expect(mockLogger.info).toHaveBeenCalledWith('HTTP Server stopped gracefully');
    expect(httpServer.isRunning()).toBe(false);
  });

  it('should log HTTP requests through logging middleware', async () => {
    // Arrange
    await httpServer.start();
    const app = httpServer.getApp();

    // Act
    await request(app).get('/non-existent');

    // Assert
    expect(mockLogger.info).toHaveBeenNthCalledWith(2, 'HTTP Request', {
      requestId: 'test-uuid-12345',
      method: 'GET',
      url: '/non-existent',
      userAgent: undefined, // ✅ Valor real en supertest
      ip: '::ffff:127.0.0.1', // ✅ Formato IPv6 de localhost
    });
  });

  it('should handle server start errors with logger', async () => {
    // Arrange
    const errorServer = new HttpServer(
      { ...mockConfig, port: -1 }, // Invalid port
      mockUuid,
      mockLogger
    );

    // Act & Assert
    await expect(errorServer.start()).rejects.toThrow();

    expect(mockLogger.error).toHaveBeenNthCalledWith(
      1,
      'HTTP Server initialization failed',
      expect.objectContaining({
        name: 'RangeError',
        message: expect.stringContaining('options.port should be >= 0 and < 65536'),
      })
    );
  });
});
