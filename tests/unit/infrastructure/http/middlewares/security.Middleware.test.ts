import { createSecurityMiddleware } from '@/infrastructure/http/middlewares/security.middleware';

// Mock helmet library
const mockHelmetMiddleware = jest.fn();
jest.mock('helmet', () => jest.fn(() => mockHelmetMiddleware));

// eslint-disable-next-line @typescript-eslint/no-require-imports
const helmet = require('helmet');

describe('Security Middleware', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create helmet middleware with CSP configuration', () => {
    const middleware = createSecurityMiddleware();

    expect(helmet).toHaveBeenCalledWith({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", 'data:', 'https:'],
        },
      },
      hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true,
      },
    });

    expect(middleware).toBe(mockHelmetMiddleware);
  });

  it('should configure restrictive default CSP directives', () => {
    createSecurityMiddleware();

    const helmetConfig = helmet.mock.calls[0][0];
    const cspDirectives = helmetConfig.contentSecurityPolicy.directives;

    expect(cspDirectives.defaultSrc).toEqual(["'self'"]);
    expect(cspDirectives.scriptSrc).toEqual(["'self'"]);
    expect(cspDirectives.styleSrc).toEqual(["'self'", "'unsafe-inline'"]);
    expect(cspDirectives.imgSrc).toEqual(["'self'", 'data:', 'https:']);
  });

  it('should configure HSTS with secure settings', () => {
    createSecurityMiddleware();

    const helmetConfig = helmet.mock.calls[0][0];
    const hstsConfig = helmetConfig.hsts;

    expect(hstsConfig.maxAge).toBe(31536000); // 1 year in seconds
    expect(hstsConfig.includeSubDomains).toBe(true);
    expect(hstsConfig.preload).toBe(true);
  });

  it('should return Express-compatible middleware function', () => {
    const result = createSecurityMiddleware();

    expect(result).toBe(mockHelmetMiddleware);
    expect(typeof result).toBe('function');
    expect(helmet).toHaveBeenCalledTimes(1);
  });

  it('should call helmet with complete security configuration', () => {
    createSecurityMiddleware();

    expect(helmet).toHaveBeenCalledWith(
      expect.objectContaining({
        contentSecurityPolicy: expect.objectContaining({
          directives: expect.objectContaining({
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", 'data:', 'https:'],
          }),
        }),
        hsts: expect.objectContaining({
          maxAge: 31536000,
          includeSubDomains: true,
          preload: true,
        }),
      })
    );
  });
});
