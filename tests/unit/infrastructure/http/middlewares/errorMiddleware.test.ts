import { Request, Response, NextFunction } from 'express';
import { createErrorMiddleware } from '@/infrastructure/http/middlewares/error.middleware';
import { IConfig, ILogger } from '@/interfaces';

// Mock implementations
const mockLogger = {
  error: jest.fn(),
  info: jest.fn(),
  debug: jest.fn(),
  warn: jest.fn(),
} as unknown as ILogger;

const mockContextLogger = {
  error: jest.fn(),
} as unknown as ILogger;

const mockConfig = {
  isDevelopment: jest.fn(),
} as unknown as IConfig;

const mockRequest = {
  requestId: 'test-request-id',
  method: 'POST',
  originalUrl: '/api/test',
  url: '/api/test',
} as unknown as Request;

const mockResponse = {
  status: jest.fn().mockReturnThis(),
  json: jest.fn(),
} as unknown as Response;

const mockNext = jest.fn() as NextFunction;

// Mock withLoggerContext
jest.mock('@/shared', () => ({
  withLoggerContext: jest.fn(() => mockContextLogger),
}));

describe('Error Middleware', () => {
  let middleware: ReturnType<typeof createErrorMiddleware>;
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { withLoggerContext } = require('@/shared');

  beforeEach(() => {
    jest.clearAllMocks();
    middleware = createErrorMiddleware(mockLogger, mockConfig);
  });

  it('should create contextual logger and log error details', () => {
    const testError = new Error('Test error message');
    testError.stack = 'Error stack trace';
    mockConfig.isDevelopment = jest.fn().mockReturnValue(true);

    middleware(testError, mockRequest, mockResponse, mockNext);

    expect(withLoggerContext).toHaveBeenCalledWith(mockLogger, 'createErrorMiddleware');
    expect(mockContextLogger.error).toHaveBeenCalledWith('Unhandled error in request', {
      requestId: 'test-request-id',
      error: 'Test error message',
      stack: 'Error stack trace',
      method: 'POST',
      url: '/api/test',
    });
  });

  it('should handle missing requestId gracefully', () => {
    const requestWithoutId = {
      ...mockRequest,
      requestId: undefined,
    } as unknown as Request;

    const testError = new Error('Test error');
    mockConfig.isDevelopment = jest.fn().mockReturnValue(false);

    middleware(testError, requestWithoutId, mockResponse, mockNext);

    expect(mockContextLogger.error).toHaveBeenCalledWith(
      'Unhandled error in request',
      expect.objectContaining({
        requestId: 'unknown',
      })
    );
  });

  it('should return detailed error message in development', () => {
    const testError = new Error('Detailed error message');
    mockConfig.isDevelopment = jest.fn().mockReturnValue(true);

    middleware(testError, mockRequest, mockResponse, mockNext);

    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith({
      error: 'Internal Server Error',
      message: 'Detailed error message',
      requestId: 'test-request-id',
      timestamp: expect.any(String),
    });
  });

  it('should return generic error message in production', () => {
    const testError = new Error('Sensitive error details');
    mockConfig.isDevelopment = jest.fn().mockReturnValue(false);

    middleware(testError, mockRequest, mockResponse, mockNext);

    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith({
      error: 'Internal Server Error',
      message: 'Something went wrong',
      requestId: 'test-request-id',
      timestamp: expect.any(String),
    });
  });

  it('should use originalUrl when available, fallback to url', () => {
    const requestWithoutOriginalUrl = {
      ...mockRequest,
      originalUrl: undefined,
      url: '/fallback-url',
    } as unknown as Request;

    const testError = new Error('Test error');
    mockConfig.isDevelopment = jest.fn().mockReturnValue(true);

    middleware(testError, requestWithoutOriginalUrl, mockResponse, mockNext);

    expect(mockContextLogger.error).toHaveBeenCalledWith(
      'Unhandled error in request',
      expect.objectContaining({
        url: '/fallback-url',
      })
    );
  });
});
