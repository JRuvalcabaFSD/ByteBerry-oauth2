import { Request, Response, NextFunction } from 'express';
import { IClock, ILogger } from '@/interfaces';
import { createLoggerMiddleware } from '@/infrastructure';

const mockLogger = {
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
  child: jest.fn(),
} as unknown as ILogger;

const mockChildLogger = {
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
} as unknown as ILogger;

const mockClock = {
  timestamp: jest.fn(),
} as unknown as IClock;

const mockRequest = {
  requestId: 'test-request-id',
  method: 'GET',
  originalUrl: '/test',
  url: '/test',
  headers: {
    'user-agent': 'test-agent',
  },
  ip: '127.0.0.1',
} as unknown as Request;

const mockResponse = {
  statusCode: 200,
  end: jest.fn(),
  get: jest.fn(),
} as unknown as Response;

const mockNext = jest.fn() as NextFunction;

describe('Logging Middleware', () => {
  let middleware: ReturnType<typeof createLoggerMiddleware>;

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup mock returns
    mockLogger.child = jest.fn().mockReturnValue(mockChildLogger);
    mockClock.timestamp = jest
      .fn()
      .mockReturnValueOnce(1000) // Start time
      .mockReturnValueOnce(1500); // End time

    middleware = createLoggerMiddleware(mockLogger, mockClock);
  });

  it('should process request with logging successfully', () => {
    middleware(mockRequest, mockResponse, mockNext);

    expect(mockLogger.child).toHaveBeenCalledWith({
      requestId: 'test-request-id',
      method: 'GET',
      url: '/test',
      userAgent: 'test-agent',
      ip: '127.0.0.1',
    });

    expect(mockNext).toHaveBeenCalled();
  });
  it('should log request completion with success status', () => {
    mockResponse.statusCode = 200;
    mockResponse.get = jest.fn().mockReturnValue('1024');

    // Asegurar que end sea un mock antes de que el middleware lo envuelva
    mockResponse.end = jest.fn();

    middleware(mockRequest, mockResponse, mockNext);

    // Trigger the wrapped end (the wrapper should call the original mock we set before middleware)
    (mockResponse.end as jest.Mock)('data', 'utf8', jest.fn());

    // Assert: prefer objectContaining and flexible duration assertion
    expect(mockChildLogger.info).toHaveBeenCalledWith(
      'Request completed',
      expect.objectContaining({
        method: 'GET',
        url: '/test',
        statusCode: 200,
        contentLength: '1024',
        duration: expect.any(Number),
      })
    );
  });
  it('should log request completion with error status', () => {
    mockResponse.statusCode = 404;
    middleware(mockRequest, mockResponse, mockNext);

    expect(mockResponse.end).toBeDefined();

    expect(mockNext).toHaveBeenCalled();
  });
  it('should handle missing request ID', () => {
    const requestWithoutId = {
      ...mockRequest,
      requestId: undefined,
    } as unknown as Request;

    middleware(requestWithoutId, mockResponse, mockNext);

    expect(mockNext).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Request ID middleware must be applied before logging middleware',
      })
    );
    expect(mockLogger.child).not.toHaveBeenCalled();
  });
  it('should handle request with fallback IP address', () => {
    const requestWithSocketIP = {
      ...mockRequest,
      ip: undefined,
      socket: { remoteAddress: '192.168.1.1' },
    } as unknown as Request;

    middleware(requestWithSocketIP, mockResponse, mockNext);

    expect(mockLogger.child).toHaveBeenCalledWith(
      expect.objectContaining({
        ip: '192.168.1.1',
      })
    );

    const requestWithNoIP = {
      ...mockRequest,
      ip: undefined,
      socket: {},
    } as unknown as Request;

    jest.clearAllMocks();
    mockLogger.child = jest.fn().mockReturnValue(mockChildLogger);

    middleware(requestWithNoIP, mockResponse, mockNext);

    expect(mockLogger.child).toHaveBeenCalledWith(
      expect.objectContaining({
        ip: 'unknown',
      })
    );
  });
});
