import { Request, Response, NextFunction } from 'express';
import { ILogger } from '@/interfaces';
import { Socket } from 'net';
import { createLoggingMiddleware, LoggingMiddleware } from '@/infrastructure';

describe('LoggingMiddleware', () => {
  let mockLogger: ILogger;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockLogger = {
      debug: jest.fn(),
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
      log: jest.fn(),
      setDefaultContext: jest.fn(),
    };

    mockRequest = {
      method: 'GET',
      url: '/test',
      headers: { 'user-agent': 'test-agent' },
      ip: '127.0.0.1',
      requestId: 'req-123',
      connection: { remoteAddress: '127.0.0.1' } as Partial<Socket>,
    } as Request;

    mockResponse = {
      statusCode: 200,
      get: jest.fn(() => '100'),
      end: jest.fn(),
    };

    mockNext = jest.fn();
  });
  it('should log incoming HTTP request', () => {
    const middleware = new LoggingMiddleware(mockLogger);
    const middlewareFunction = middleware.create();

    middlewareFunction(mockRequest as Request, mockResponse as Response, mockNext as NextFunction);

    expect(mockLogger.info).toHaveBeenCalledWith('HTTP Request', {
      requestId: 'req-123',
      method: 'GET',
      url: '/test',
      userAgent: 'test-agent',
      ip: '127.0.0.1',
    });
    expect(mockNext).toHaveBeenCalled();
  });
  it('should override res.end to log response', () => {
    const originalEnd = jest.fn();
    mockResponse.end = originalEnd;
    const middleware = new LoggingMiddleware(mockLogger);
    const middlewareFunction = middleware.create();

    middlewareFunction(mockRequest as Request, mockResponse as Response, mockNext as NextFunction);

    expect(mockResponse.end).not.toBe(originalEnd); // Should be overridden
    expect(typeof mockResponse.end).toBe('function');
  });
  it('should log response with appropriate level based on status code', () => {
    mockResponse.statusCode = 500;
    const middleware = new LoggingMiddleware(mockLogger);
    const middlewareFunction = middleware.create();

    middlewareFunction(mockRequest as Request, mockResponse as Response, mockNext as NextFunction);
    (mockResponse.end as any)();

    expect(mockLogger.error).toHaveBeenCalledWith('HTTP Response', {
      requestId: 'req-123',
      method: 'GET',
      url: '/test',
      statusCode: 500,
      duration: expect.any(Number),
      contentLength: '100',
    });
  });
  it('should create middleware via factory function', () => {
    const middlewareFunction = createLoggingMiddleware(mockLogger);

    expect(typeof middlewareFunction).toBe('function');

    middlewareFunction(mockRequest as Request, mockResponse as Response, mockNext);
    expect(mockLogger.info).toHaveBeenCalled();
  });
  it('should handle request without requestId', () => {
    // Arrange
    const requestWithoutId: Partial<Request> = {
      method: 'GET',
      url: '/test',
      headers: { 'user-agent': 'test-agent' },
      ip: '127.0.0.1',
      connection: { remoteAddress: '127.0.0.1' } as Partial<Socket>,
    } as Request;
    const middleware = new LoggingMiddleware(mockLogger);
    const middlewareFunction = middleware.create();

    // Act
    middlewareFunction(requestWithoutId as Request, mockResponse as Response, mockNext);

    // Assert
    expect(mockLogger.info).toHaveBeenCalledWith('HTTP Request', {
      requestId: '',
      method: 'GET',
      url: '/test',
      userAgent: 'test-agent',
      ip: '127.0.0.1',
    });
  });
});
