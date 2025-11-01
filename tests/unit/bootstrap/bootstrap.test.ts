import { bootstrap, BootstrapResult } from '@/bootstrap';
import { IContainer, IHttpServer, ILogger } from '@/interfaces';
import { BootstrapError } from '@/shared';

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

const mockContainer = {
  resolve: jest.fn(),
  isRegistered: jest.fn(),
  register: jest.fn(),
  registerSingleton: jest.fn(),
} as unknown as IContainer;

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

    mockContainer.isRegistered = jest.fn().mockImplementation((token: any) => ['Logger', 'HttpServer'].includes(token));

    mockContainer.resolve = jest.fn().mockImplementation((token: any) => {
      if (token === 'Logger') return mockLogger;
      if (token === 'HttpServer') return mockHttpServer;
      return undefined;
    });

    mockHttpServer.start = jest.fn().mockResolvedValue(undefined);
  });

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
  it('should validate critical services correctly', async () => {
    const mockValidServices = ['Logger', 'HttpServer'];

    // Mock the criticalServices array
    jest.doMock('@/container', () => ({
      bootstrapContainer: jest.fn(() => mockContainer),
      criticalServices: mockValidServices,
    }));

    mockContainer.resolve = jest.fn().mockReturnValueOnce(mockLogger).mockReturnValueOnce(mockHttpServer).mockReturnValue({}); // For service validation

    await bootstrap();

    // Verify all critical services were checked
    expect(mockContainer.isRegistered).toHaveBeenCalledTimes(mockValidServices.length);
    expect(mockContainer.resolve).toHaveBeenCalledTimes(mockValidServices.length + 2); // +2 for Logger and HttpServer in main flow
  });
});
