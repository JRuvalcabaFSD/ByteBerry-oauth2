/* eslint-disable @typescript-eslint/prefer-as-const */
import { Request, Response, NextFunction } from 'express';
import { IConfig, ILogger } from '@/interfaces';
import { createErrorMiddleware } from '@/infrastructure';
import { OAuth2Error } from '@/shared'; // Importamos OAuth2Error para las pruebas

// --- Mock implementations ---

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

// Extendemos el tipo de Request mockeado para incluir requestId, aunque la definición
// en 'express' no lo tenga, el middleware lo espera.
interface MockRequest extends Request {
  requestId?: string;
  // Añadir aquí otras propiedades si son necesarias para los mocks
}

const mockRequest = {
  requestId: 'test-request-id',
  method: 'POST',
  originalUrl: '/api/test',
  url: '/api/test',
  // Aseguramos que el tipo coincida con la interfaz extendida
} as unknown as MockRequest;

const mockResponse = {
  status: jest.fn().mockReturnThis(),
  json: jest.fn(),
  setHeader: jest.fn(), // Añadido para la prueba de 'oauth'
} as unknown as Response;

const mockNext = jest.fn() as NextFunction;

// Mock withLoggerContext
jest.mock('@/shared', () => {
  const actual = jest.requireActual('@/shared');
  return {
    ...actual,
    withLoggerContext: jest.fn(() => mockContextLogger),
    // Mock de OAuth2Error
    OAuth2Error: class MockOAuth2Error extends Error implements OAuth2Error {
      name = 'OAuth2Error';
      statusCode: number;
      public error: string;
      public errorDescription: string;
      public errorType: 'oauth' = 'oauth';

      constructor(message: string, statusCode: number, error: string, errorDescription: string) {
        super(message);
        this.statusCode = statusCode;
        this.error = error;
        this.errorDescription = errorDescription;
      }

      toJSON() {
        return {
          error: this.error,
          error_description: this.errorDescription,
        };
      }
    },
  };
});

class CustomError extends Error {
  errorType: string;

  context?: any;

  token?: any;

  constructor(message: string, errorType: string, context?: any, token?: any) {
    super(message);
    this.name = 'CustomError';
    this.errorType = errorType;
    if (context) this.context = context;
    if (token) this.token = token;
  }
}

describe('Error Middleware', () => {
  let middleware: ReturnType<typeof createErrorMiddleware>;
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { withLoggerContext, OAuth2Error: MockOAuth2Error } = require('@/shared');

  beforeEach(() => {
    jest.clearAllMocks();
    middleware = createErrorMiddleware(mockLogger, mockConfig);
    // Para asegurar que el default es producción si no se especifica
    mockConfig.isDevelopment = jest.fn().mockReturnValue(false);
  });

  // Pruebas existentes (simplificadas para el enfoque)
  // ...

  it('should create contextual logger and log error details', () => {
    const testError = new Error('Test error message');
    testError.stack = 'Error stack trace';
    mockConfig.isDevelopment = jest.fn().mockReturnValue(true);

    middleware(testError, mockRequest as unknown as Request, mockResponse as unknown as Response, mockNext);

    expect(withLoggerContext).toHaveBeenCalledWith(mockLogger, 'createErrorMiddleware');
    expect(mockContextLogger.error).toHaveBeenCalledWith('Unhandled error in request', {
      requestId: 'test-request-id',
      error: 'Test error message',
      stack: 'Error stack trace',
      method: 'POST',
      url: '/api/test',
    });
  });

  it('should return generic error message in production (default handler coverage)', () => {
    const testError = new Error('Sensitive error details');
    mockConfig.isDevelopment = jest.fn().mockReturnValue(false);

    middleware(testError, mockRequest as unknown as Request, mockResponse as unknown as Response, mockNext);

    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith({
      error: 'Internal Server Error',
      message: 'Something went wrong',
      requestId: 'test-request-id',
      timestamp: expect.any(String),
    });
  });

  // --- Cobertura de HANDLERS ---

  it('should handle "oauth" error type (401 - set WWW-Authenticate header)', () => {
    const oauthError = new MockOAuth2Error('Invalid Token', 401, 'invalid_token', 'The access token is invalid');

    middleware(oauthError, mockRequest as unknown as Request, mockResponse as unknown as Response, mockNext);

    expect(mockResponse.setHeader).toHaveBeenCalledWith('WWW-Authenticate', 'Bearer');
    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith({
      error: 'invalid_token',
      error_description: 'The access token is invalid',
      requestId: 'test-request-id',
      timestamp: expect.any(String),
    });
  });

  it('should handle "oauth" error type (403 - no WWW-Authenticate header)', () => {
    const oauthError = new MockOAuth2Error('Forbidden Scope', 403, 'forbidden_scope', 'Scope is restricted');

    middleware(oauthError, mockRequest as unknown as Request, mockResponse as unknown as Response, mockNext);

    expect(mockResponse.setHeader).not.toHaveBeenCalled();
    expect(mockResponse.status).toHaveBeenCalledWith(403);
    expect(mockResponse.json).toHaveBeenCalledWith({
      error: 'forbidden_scope',
      error_description: 'Scope is restricted',
      requestId: 'test-request-id',
      timestamp: expect.any(String),
    });
  });

  it('should handle "bootstrap" error type', () => {
    const bootstrapError = new CustomError('Failed to initialize module X', 'bootstrap', { module: 'ModuleX' });

    middleware(bootstrapError, mockRequest as unknown as Request, mockResponse as unknown as Response, mockNext);

    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith({
      error: 'Bootstrap Failed',
      message: 'Failed to initialize module X',
      context: { module: 'ModuleX' },
      requestId: 'test-request-id',
      timestamp: expect.any(String),
    });
  });

  it('should handle "container" error type', () => {
    const containerError = new CustomError('Token not bound', 'container', undefined, 'MyServiceToken');

    middleware(containerError, mockRequest as unknown as Request, mockResponse as unknown as Response, mockNext);

    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith({
      error: 'Container Error',
      message: 'Token not bound',
      token: 'MyServiceToken',
      requestId: 'test-request-id',
      timestamp: expect.any(String),
    });
  });

  it('should handle "config" error type', () => {
    const configError = new CustomError('Missing API Key', 'config', { key: 'API_KEY' });

    middleware(configError, mockRequest as unknown as Request, mockResponse as unknown as Response, mockNext);

    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith({
      error: 'Configuration Error',
      message: 'Missing API Key',
      context: { key: 'API_KEY' },
      requestId: 'test-request-id',
      timestamp: expect.any(String),
    });
  });

  it('should handle "cors" error type in development (detailed message)', () => {
    mockConfig.isDevelopment = jest.fn().mockReturnValue(true);
    const corsError = new CustomError('Origin http://bad-origin.com not allowed', 'cors');

    middleware(corsError, mockRequest as unknown as Request, mockResponse as unknown as Response, mockNext);

    expect(mockResponse.status).toHaveBeenCalledWith(403);
    expect(mockResponse.json).toHaveBeenCalledWith({
      error: 'Forbidden',
      message: 'Origin http://bad-origin.com not allowed',
      requestId: 'test-request-id',
      timestamp: expect.any(String),
    });
  });

  it('should handle "cors" error type in production (generic message)', () => {
    mockConfig.isDevelopment = jest.fn().mockReturnValue(false);
    const corsError = new CustomError('Origin http://bad-origin.com not allowed', 'cors');

    middleware(corsError, mockRequest as unknown as Request, mockResponse as unknown as Response, mockNext);

    expect(mockResponse.status).toHaveBeenCalledWith(403);
    expect(mockResponse.json).toHaveBeenCalledWith({
      error: 'Forbidden',
      message: 'Origin not allowed by CORS',
      requestId: 'test-request-id',
      timestamp: expect.any(String),
    });
  });
});
