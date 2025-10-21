import { createCORSMiddleware } from '@/infrastructure/http/middlewares/cors.middleware';
import type { IConfig as IConfigType } from '@/interfaces';

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
  });

  it('should create CORS middleware with correct configuration', () => {
    const middleware = createCORSMiddleware(mockConfig);

    expect(corsLibrary).toHaveBeenCalledWith({
      origin: ['http://localhost:3000', 'https://example.com'],
      credentials: true,
      optionsSuccessStatus: 200,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-ID'],
    });

    expect(middleware).toBe(mockCorsMiddleware);
  });

  it('should handle single origin configuration', () => {
    // No mutamos la propiedad readonly: creamos un nuevo objeto de config con origen único (array)
    mockConfig = { ...mockConfig, corsOrigins: ['http://localhost:3000'] };

    createCORSMiddleware(mockConfig);

    expect(corsLibrary).toHaveBeenCalledWith(
      expect.objectContaining({
        origin: ['http://localhost:3000'],
      })
    );
  });

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
