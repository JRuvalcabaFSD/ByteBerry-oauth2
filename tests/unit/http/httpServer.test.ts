import { Application } from 'express';
import { Server } from 'http';

import { HttpServer } from '@/infrastructure/http/httpServer';
import { IClock, IConfig, IContainer, ILogger } from '@/interfaces';

const mockApp = {
  listen: jest.fn(),
  use: jest.fn(),
  get: jest.fn(),
  post: jest.fn(),
  set: jest.fn(),
  disable: jest.fn(),
  enable: jest.fn(),
} as unknown as Application;

const mockServer = {
  close: jest.fn(),
  on: jest.fn(),
  listening: true,
} as unknown as Server;

const mockConfig = {
  port: 4000,
  serviceName: 'test-service',
  version: '1.0.0',
  nodeEnv: 'test',
  corsOrigins: ['http://localhost'],
  isDevelopment: () => true,
} as IConfig;

const mockClock = {
  now: () => new Date('2025-01-01T00:00:00Z'),
  timestamp: () => Date.now(),
  isoString: () => '2025-01-01T00:00:00.000Z',
} as IClock;

const mockLogger = {
  info: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
  warn: jest.fn(),
  child: jest.fn(() => mockLogger),
} as unknown as ILogger;

const mockContainer = {
  resolve: jest.fn(),
} as unknown as IContainer;

// Mock express - This is the key fix
jest.mock('express', () => {
  // Create middleware mocks
  const jsonMock = jest.fn(() => (_req: any, _res: any, next: any) => next());
  const urlencodedMock = jest.fn(() => (_req: any, _res: any, next: any) => next());
  const routerMock = jest.fn(() => ({
    get: jest.fn(),
    post: jest.fn(),
    use: jest.fn(),
  }));

  // Create the main express function mock
  const expressMock = Object.assign(
    jest.fn(() => mockApp), // Main function
    {
      // Static methods attached to the function
      json: jsonMock,
      urlencoded: urlencodedMock,
      Router: routerMock,
    }
  );

  return expressMock;
});

// Mock middleware modules
jest.mock('@/infrastructure', () => ({
  createSecurityMiddleware: jest.fn(() => jest.fn()),
  createCORSMiddleware: jest.fn(() => jest.fn()),
  createRequestIdMiddleware: jest.fn(() => jest.fn()),
  createLoggerMiddleware: jest.fn(() => jest.fn()),
  createErrorMiddleware: jest.fn(() => jest.fn()),
  createAppRoutes: jest.fn(() => jest.fn()),
}));

describe('HttpServer', () => {
  let httpServer: HttpServer;

  beforeEach(() => {
    jest.clearAllMocks();

    mockContainer.resolve = jest.fn().mockImplementation((service: string) => {
      switch (service) {
        case 'Config':
          return mockConfig;
        case 'Clock':
          return mockClock;
        case 'Logger':
          return mockLogger;
        case 'Uuid':
          return { generate: () => 'test-uuid' };
        default:
          return {};
      }
    });

    httpServer = new HttpServer(mockContainer);
  });

  it('should start HTTP server successfully', async () => {
    mockApp.listen = jest.fn().mockImplementation((_port, callback) => {
      setTimeout(callback, 0);
      return mockServer;
    });

    await httpServer.start();

    expect(mockApp.listen).toHaveBeenCalledWith(4000, expect.any(Function));
    expect(mockLogger.info).toHaveBeenCalledWith('[HttpServer.start] Http Server started successfully');
    expect(httpServer.isRunning()).toBeTruthy();
  });
  it('should handle server startup errors', async () => {
    const startupError = new Error('Address already in use');
    mockApp.listen = jest.fn().mockImplementation(() => {
      const server = {
        ...mockServer,
        on: jest.fn().mockImplementation((event, callback) => {
          if (event === 'error') {
            setTimeout(() => callback(startupError), 0);
          }
        }),
      };
      return server;
    });

    await expect(httpServer.start()).rejects.toThrow('Address already in use');

    expect(mockLogger.error).toHaveBeenCalledWith(
      '[HttpServer.start] Http Server failed to start',
      expect.objectContaining({ error: 'Address already in use', port: 4000 })
    );
  });
  it('should stop HTTP server successfully', async () => {
    mockApp.listen = jest.fn().mockImplementation((_port, cb) => {
      setTimeout(cb, 0);
      return mockServer;
    });

    await httpServer.start();

    mockServer.close = jest.fn().mockImplementation(cb => {
      setTimeout(() => cb(null), 0);
    });

    await httpServer.stop();

    expect(mockServer.close).toHaveBeenCalled();
    expect(mockLogger.info).toHaveBeenCalledWith('[HttpServer.stop] Http Server stopped successfully');
    expect(httpServer.isRunning()).toBeFalsy();
  });
  it('should handle stop when server not running', async () => {
    await httpServer.stop();

    expect(mockLogger.warn).toHaveBeenCalledWith('[HttpServer.stop] Http Server stop called but server is not running');
    expect(mockServer.close).not.toHaveBeenCalled();
  });
  it('should return correct server info', () => {
    const serverInfo = httpServer.getServerInfo();

    expect(serverInfo).toEqual({
      port: 4000,
      isRunning: false, // Not started yet
    });

    expect(serverInfo.startTime).toBeUndefined(); // Should not have startTime when not running
  });
});
