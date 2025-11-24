import { bootstrap, BootstrapResult } from '@/bootstrap';
import { IHttpServer, ILogger } from '@/interfaces';
import { BootstrapError } from '@/shared';

// Asegura que DATABASE_URL esté definida para todos los tests
beforeAll(() => {
  process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgresql://user:pass@localhost:5432/db_test';
});

const mockLogger = {
  info: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
  warn: jest.fn(),
  child: jest.fn(),
} as unknown as ILogger;

const mockHttpServer = {
  start: jest.fn(),
  stop: jest.fn(),
  isRunning: jest.fn(),
  getApp: jest.fn(),
  getServerInfo: jest.fn(),
} as unknown as IHttpServer;

// Forzar el tipo any para evitar errores de tipos estrictos en los mocks

const mockContainer: any = {
  resolve: jest.fn(),
  isRegistered: jest.fn(),
  register: jest.fn(),
  registerSingleton: jest.fn(),
};

const mockShutdown = jest.fn();

jest.mock('@/container', () => ({
  bootstrapContainer: jest.fn(() => mockContainer),
  criticalServices: ['Logger', 'HttpServer'],
}));

jest.mock('@/infrastructure', () => ({
  configureShutdown: jest.fn(() => mockShutdown),
}));

jest.mock('@/shared', () => ({
  ...jest.requireActual('@/shared'),
  wrapContainerLogger: jest.fn(container => container),
}));

describe('Bootstrap', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    mockContainer.isRegistered = jest.fn((token: any) => ['Logger', 'HttpServer', 'DatabaseConfig'].includes(token));

    mockHttpServer.start = jest.fn().mockResolvedValue(undefined);

    // Mockea resolve para Logger, HttpServer y DatabaseConfig
    mockContainer.resolve = jest.fn((token: any) => {
      if (token === 'Logger') return mockLogger;
      if (token === 'HttpServer') return mockHttpServer;
      if (token === 'DatabaseConfig') {
        return { testConnection: jest.fn().mockResolvedValue(true) };
      }
      // Devuelve un objeto vacío para otros tokens para evitar undefined
      return {};
    });
  });

  // Mock específico para el test de validación de servicios críticos
  // (Eliminado test duplicado)

  it('should bootstrap application successfully', async () => {
    const result: BootstrapResult = await bootstrap();

    expect(result.container).toBe(mockContainer);
    expect(result.shutdown).toBe(mockShutdown);
    expect(mockLogger.info).toHaveBeenCalledWith('Service starting');
    expect(mockHttpServer.start).toHaveBeenCalled();
  });
  it('should throw BootstrapError when service validation fails', async () => {
    mockContainer.isRegistered = jest.fn(() => false);

    await expect(bootstrap()).rejects.toThrow(BootstrapError);
    expect(mockLogger.error).toHaveBeenCalledWith(
      'Service failed',
      expect.objectContaining({ error: expect.stringContaining('Critical service validation failed') })
    );
  });
  it('should throw BootstrapError when HTTP server fails to start', async () => {
    const serverError = new Error('Port already in use');
    mockHttpServer.start = jest.fn().mockRejectedValue(serverError);

    await expect(bootstrap()).rejects.toThrow(BootstrapError);
    expect(mockLogger.error).toHaveBeenCalledWith(
      'Service failed',
      expect.objectContaining({ error: expect.stringContaining('Port already in use'), stack: expect.any(String) })
    );
  });
  it('should fallback to console.error when logger not available', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();

    mockContainer.resolve = jest.fn().mockImplementation(() => {
      throw new Error('Logger not available');
    });

    await expect(bootstrap()).rejects.toThrow(BootstrapError);
    expect(consoleErrorSpy).toHaveBeenCalledWith('Bootstrap failed before logger was available:', 'Logger not available');

    consoleErrorSpy.mockRestore();
  });
  // Asegura que el mock de DatabaseConfig siempre devuelva testConnection exitoso
  // (Eliminado test duplicado)
});
