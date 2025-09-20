import { Request, Response, NextFunction } from 'express';
import { ILogger } from '@/interfaces';
import { errorHandlerMiddleware, ErrorHandlerMiddleware } from '@/infrastructure';

describe('ErrorHandlerMiddleware - T007', () => {
  let mockLogger: ILogger;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;
  let consoleErrorSpy: jest.SpyInstance;

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
      requestId: 'test-request-id',
      method: 'GET',
      url: '/test',
      headers: { 'user-agent': 'test-agent' },
    };

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    mockNext = jest.fn();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  it('should use logger when available', () => {
    // Arrange
    const error = new Error('Test error');
    const middleware = new ErrorHandlerMiddleware(mockLogger);
    const middlewareFunction = middleware.create();

    // Act
    middlewareFunction(error, mockRequest as Request, mockResponse as Response, mockNext);

    // Assert
    expect(mockLogger.error).toHaveBeenCalledWith('HTTP Server Error', error, {
      requestId: 'test-request-id',
      method: 'GET',
      url: '/test',
      userAgent: 'test-agent',
    });
    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });

  it('should fallback to console when logger not available', () => {
    // Arrange
    const error = new Error('Test error');
    const middleware = new ErrorHandlerMiddleware(); // No logger
    const middlewareFunction = middleware.create();

    // Act
    middlewareFunction(error, mockRequest as Request, mockResponse as Response, mockNext);

    // Assert
    expect(consoleErrorSpy).toHaveBeenCalledWith('[test-request-id] Server Error:', error);
    expect(mockLogger.error).not.toHaveBeenCalled();
  });

  it('should return structured error response', () => {
    // Arrange
    const error = new Error('Test error');
    const middleware = new ErrorHandlerMiddleware(mockLogger);
    const middlewareFunction = middleware.create();

    // Act
    middlewareFunction(error, mockRequest as Request, mockResponse as Response, mockNext);

    // Assert
    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith({
      error: 'INTERNAL_SERVER_ERROR',
      message: 'An internal server error occurred',
      timestamp: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/),
      requestId: 'test-request-id',
    });
  });

  it('should handle unknown requestId', () => {
    // Arrange
    const error = new Error('Test error');
    const requestWithoutId: Partial<Request> = {
      method: 'GET',
      url: '/test',
      headers: { 'user-agent': 'test-agent' },
    };
    const middleware = new ErrorHandlerMiddleware(mockLogger);
    const middlewareFunction = middleware.create();

    // Act
    middlewareFunction(error, requestWithoutId as Request, mockResponse as Response, mockNext);

    // Assert
    expect(mockLogger.error).toHaveBeenCalledWith('HTTP Server Error', error, {
      requestId: 'unknown',
      method: 'GET',
      url: '/test',
      userAgent: 'test-agent',
    });
  });

  it('should work with factory function without logger', () => {
    // Act
    const middlewareFunction = errorHandlerMiddleware();

    // Assert
    expect(typeof middlewareFunction).toBe('function');
    expect(middlewareFunction.length).toBe(4); // Error middleware has 4 parameters
  });
});
