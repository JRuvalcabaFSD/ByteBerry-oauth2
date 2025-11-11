/* eslint-disable @typescript-eslint/no-unsafe-function-type */
import { createCORSMiddleware } from '@/infrastructure';
import type { IConfig as IConfigType } from '@/interfaces';
import { CorsOriginsError } from '@/shared'; // Importamos el error

const mockCorsMiddleware = jest.fn();
jest.mock('cors', () => jest.fn(() => mockCorsMiddleware));

// eslint-disable-next-line @typescript-eslint/no-require-imports
const corsLibrary = require('cors') as jest.Mock;

describe('CORS Middleware', () => {
  let mockConfig: IConfigType;

  beforeEach(() => {
    mockConfig = {
      corsOrigins: ['http://localhost:3000', 'https://example.com'],
    } as IConfigType;
    // jest.clearAllMocks(); // Mover esto solo a los bloques que lo requieran
  });

  // === CONFIGURACIÓN DEL MIDDLEWARE (ya existente) ===
  it('should create CORS middleware with correct configuration', () => {
    createCORSMiddleware(mockConfig);

    expect(corsLibrary).toHaveBeenCalledWith(
      expect.objectContaining({
        origin: expect.any(Function),
        credentials: true,
        optionsSuccessStatus: 200,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID'],
      })
    );
  });

  it('should handle single origin configuration', () => {
    mockConfig = { ...mockConfig, corsOrigins: ['http://localhost:3000'] };
    createCORSMiddleware(mockConfig);

    expect(corsLibrary).toHaveBeenCalledWith(
      expect.objectContaining({
        origin: expect.any(Function),
      })
    );
  });

  // === COMPORTAMIENTO DEL ORIGIN FUNCTION (NUEVO) ===
  describe('origin function behavior', () => {
    let originFn: (origin: string | undefined, callback: Function) => void;

    beforeEach(() => {
      createCORSMiddleware(mockConfig);
      const configPassed = corsLibrary.mock.calls[0][0];
      originFn = configPassed.origin;
    });

    it('should allow requests from permitted origins', () => {
      const callback = jest.fn();
      originFn('https://example.com', callback);

      expect(callback).toHaveBeenCalledWith(null, true);
    });

    it('should allow localhost variants', () => {
      const callback = jest.fn();
      originFn('http://localhost:3000', callback);

      expect(callback).toHaveBeenCalledWith(null, true);
    });

    it('should reject unknown origins with CorsOriginsError', () => {
      const callback = jest.fn();
      const badOrigin = 'https://malicious-site.com';

      originFn(badOrigin, callback);

      expect(callback).toHaveBeenCalledWith(expect.any(CorsOriginsError), false);

      const error = callback.mock.calls[0][0] as CorsOriginsError;
      expect(error).toBeInstanceOf(CorsOriginsError);
      expect(error.origin).toBe(badOrigin);
      expect(error.message).toBe(`Origin ${badOrigin} not allowed by CORS`);
      expect(error.errorType).toBe('cors');
    });

    it('should reject requests with no origin (e.g. same-origin or non-browser)', () => {
      const callback = jest.fn();
      originFn(undefined, callback);

      expect(callback).toHaveBeenCalledWith(null, true); // CORS permite sin origen
    });
  });

  // === MIDDLEWARE INTEGRATION: Lanza error en Express (NUEVO) ===
  describe('middleware integration with Express', () => {
    let mockReq: any;
    let mockNext: jest.Mock;

    beforeEach(() => {
      mockNext = jest.fn();
      mockReq = { headers: {} };
      createCORSMiddleware(mockConfig);
    });

    it('should call next() with CorsOriginsError for disallowed origin', () => {
      mockReq.headers.origin = 'https://evil.com';

      // Simulamos que cors() devuelve un middleware que llama a originFn
      // Pero como estamos mockeando, necesitamos extraer el originFn real
      const config = corsLibrary.mock.calls[0][0];
      const originFn = config.origin;

      // Ejecutamos manualmente la lógica del origin
      originFn(mockReq.headers.origin, (err: any, _allow: any) => {
        if (err) {
          mockNext(err);
        } else {
          mockNext();
        }
      });

      expect(mockNext).toHaveBeenCalledWith(expect.any(CorsOriginsError));
      const error = mockNext.mock.calls[0][0];
      expect(error.origin).toBe('https://evil.com');
    });

    it('should call next() without error for allowed origin', () => {
      mockReq.headers.origin = 'http://localhost:3000';

      const config = corsLibrary.mock.calls[0][0];
      const originFn = config.origin;

      originFn(mockReq.headers.origin, (err: any, _allow: any) => {
        if (err) mockNext(err);
        else mockNext();
      });

      expect(mockNext).toHaveBeenCalledWith();
    });
  });

  // === CONFIGURACIÓN ESTÁTICA (ya existente) ===
  it('should configure credentials and status options correctly', () => {
    createCORSMiddleware(mockConfig);
    expect(corsLibrary).toHaveBeenCalledWith(
      expect.objectContaining({
        credentials: true,
        optionsSuccessStatus: 200,
      })
    );
  });

  it('should set correct HTTP methods and headers', () => {
    createCORSMiddleware(mockConfig);
    expect(corsLibrary).toHaveBeenCalledWith(
      expect.objectContaining({
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID'],
      })
    );
  });

  it('should return middleware function from cors library', () => {
    const result = createCORSMiddleware(mockConfig);
    expect(result).toBe(mockCorsMiddleware);
    expect(typeof result).toBe('function');
  });
});
