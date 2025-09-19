import { errorHandlerMiddleware, ErrorHandlerMiddleware } from '@/infrastructure';
import { Request, Response, NextFunction } from 'express';

describe('ErrorHandlerMiddleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: Partial<NextFunction>;
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    mockRequest = {
      requestId: 'test-request-id',
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

  it('should handle errors with request ID', () => {
    const error = new Error('Test Error');
    const middleware = new ErrorHandlerMiddleware();
    const middlewareFunction = middleware.create();

    middlewareFunction(error, mockRequest as Request, mockResponse as Response, mockNext as NextFunction);

    expect(consoleErrorSpy).toHaveBeenCalledWith('[test-request-id] Server Error:', error);
    expect(mockResponse.status).toHaveBeenCalledWith(500);
  });
  it('should return JSON error response', () => {
    const error = new Error('Test Error');
    const middleware = new ErrorHandlerMiddleware();
    const middlewareFunction = middleware.create();

    middlewareFunction(error, mockRequest as Request, mockResponse as Response, mockNext as NextFunction);

    expect(mockResponse.json).toHaveBeenCalledWith({
      error: 'INTERNAL_SERVER_ERROR',
      message: 'An internal server error occurred',
      timestamp: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/),
      requestId: 'test-request-id',
    });
  });
  it('should handle errors when no request ID is present', () => {
    // Arrange
    const error = new Error('Test error');
    const requestWithoutId: Partial<Request> = {};
    const middleware = new ErrorHandlerMiddleware();
    const middlewareFunction = middleware.create();

    // Act
    middlewareFunction(error, requestWithoutId as Request, mockResponse as Response, mockNext as NextFunction);

    // Assert
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        requestId: 'unknown',
      })
    );
  });
  it('should create middleware via factory function', () => {
    // Act
    const middlewareFunction = errorHandlerMiddleware();

    // Assert
    expect(typeof middlewareFunction).toBe('function');
    expect(middlewareFunction.length).toBe(4); // Error middleware has 4 parameters
  });

  it('should log error with request ID context', () => {
    // Arrange
    const error = new Error('Factory test error');
    const middlewareFunction = errorHandlerMiddleware();

    // Act
    middlewareFunction(error, mockRequest as Request, mockResponse as Response, mockNext as NextFunction);

    // Assert
    expect(consoleErrorSpy).toHaveBeenCalledWith('[test-request-id] Server Error:', error);
  });
});
