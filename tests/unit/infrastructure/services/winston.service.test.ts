import { WinstonLoggerService } from '@/infrastructure';
import { IClock, IConfig } from '@/interfaces';

describe('WinstonLoggerService', () => {
  let mockConfig: IConfig;
  let mockClock: IClock;
  let logger: WinstonLoggerService;

  beforeEach(() => {
    mockConfig = {
      serviceName: 'test-service',
      logLevel: 'info',
      port: 4000,
      nodeEnv: 'test',
      version: '1.0.0',
      corsOrigins: [],
      jwt: { audience: '', expiresIn: 900, issuer: '', privateKey: '', publicKey: '' },
      isDevelopment: jest.fn().mockReturnValue(true),
      isProduction: jest.fn().mockReturnValue(false),
      isTest: jest.fn().mockReturnValue(true),
    };

    mockClock = {
      now: jest.fn(),
      timestamp: jest.fn(),
      isoString: jest.fn().mockReturnValue('2025-01-01T12:00:00.000Z'),
    };

    logger = new WinstonLoggerService(mockConfig, mockClock);
  });

  describe('Basic Functionality', () => {
    it('should create instance when instantiated', () => {
      expect(logger).toBeDefined();
      expect(logger).toBeInstanceOf(WinstonLoggerService);
    });

    it('should have all log methods when created', () => {
      expect(typeof logger.info).toBe('function');
      expect(typeof logger.child).toBe('function');
      expect(typeof logger.debug).toBe('function');
      expect(typeof logger.error).toBe('function');
      expect(typeof logger.log).toBe('function');
      expect(typeof logger.warn).toBe('function');
    });
    it('should not throw when logging messages', () => {
      expect(() => logger.info('tests')).not.toThrow();
      expect(() => logger.debug('tests')).not.toThrow();
      expect(() => logger.error('tests')).not.toThrow();
      expect(() => logger.warn('tests')).not.toThrow();
    });
  });
  describe('Child Logger', () => {
    it('should create child logger when called', () => {
      const child = logger.child({ requestId: 'tests-123' });

      expect(child).toBeDefined();
      expect(child).toBeInstanceOf(WinstonLoggerService);
      expect(() => child.info('test')).not.toThrow();
    });
  });

  describe('Clock Integration', () => {
    it('should use clock for timestamp when logging', () => {
      logger.info('test message');

      expect(mockClock.isoString).toHaveBeenCalledWith();
    });
  });
  describe('log - Service Name Fallback', () => {
    it('should use config service name when context service is undefined', () => {
      // Given
      const mockWinstonLog = jest.fn();
      const loggerInstance = new WinstonLoggerService(mockConfig, mockClock);

      // Spy on the internal winston logger
      (loggerInstance as any).winston.log = mockWinstonLog;

      const message = 'Test message';
      const contextWithoutService = { userId: '123' };

      // When
      loggerInstance.info(message, contextWithoutService);

      // Then
      const logEntry = mockWinstonLog.mock.calls[0][1];
      expect(logEntry.service).toBe('test-service'); // Viene de mockConfig.serviceName
    });

    it('should use context service when context service provided', () => {
      // Given
      const mockWinstonLog = jest.fn();
      const loggerInstance = new WinstonLoggerService(mockConfig, mockClock);
      (loggerInstance as any).winston.log = mockWinstonLog;

      const message = 'Test message';
      const contextWithService = { service: 'custom-service', userId: '123' };

      // When
      loggerInstance.info(message, contextWithService);

      // Then
      const logEntry = mockWinstonLog.mock.calls[0][1];
      expect(logEntry.service).toBe('custom-service'); // Usa el del context
    });

    it('should use config service name when context service is null', () => {
      // Given
      const mockWinstonLog = jest.fn();
      const loggerInstance = new WinstonLoggerService(mockConfig, mockClock);
      (loggerInstance as any).winston.log = mockWinstonLog;

      const message = 'Test message';
      const contextWithNullService = { service: null, userId: '123' };

      // When
      loggerInstance.info(message, contextWithNullService as any);

      // Then
      const logEntry = mockWinstonLog.mock.calls[0][1];
      expect(logEntry.service).toBe('test-service'); // Fallback por null || config.serviceName
    });
  });
  describe('Production Mode Configuration', () => {
    let productionConfig: IConfig;

    beforeEach(() => {
      productionConfig = {
        serviceName: 'production-service',
        logLevel: 'warn',
        port: 4000,
        nodeEnv: 'production',
        version: '1.0.0',
        corsOrigins: [],
        jwt: { audience: '', expiresIn: 900, issuer: '', privateKey: '', publicKey: '' },
        isDevelopment: jest.fn().mockReturnValue(false),
        isProduction: jest.fn().mockReturnValue(true),
        isTest: jest.fn().mockReturnValue(false),
      };
    });

    it('should create logger in production mode when is production true', () => {
      // When
      const prodLogger = new WinstonLoggerService(productionConfig, mockClock);

      // Then
      expect(prodLogger).toBeDefined();
      expect(productionConfig.isProduction).toHaveBeenCalled();
    });

    it('should use development mode when not production', () => {
      // Given
      const devConfig = { ...mockConfig, isProduction: jest.fn().mockReturnValue(false) };

      // When
      const devLogger = new WinstonLoggerService(devConfig, mockClock);

      // Then
      expect(devLogger).toBeDefined();
      expect(devConfig.isProduction).toHaveBeenCalled();
    });
  });
  describe('Production Mode Configuration', () => {
    let productionConfig: IConfig;

    beforeEach(() => {
      productionConfig = {
        serviceName: 'production-service',
        logLevel: 'warn',
        port: 4000,
        nodeEnv: 'production',
        version: '1.0.0',
        corsOrigins: [],
        jwt: { audience: '', expiresIn: 900, issuer: '', privateKey: '', publicKey: '' },
        isDevelopment: jest.fn().mockReturnValue(false),
        isProduction: jest.fn().mockReturnValue(true),
        isTest: jest.fn().mockReturnValue(false),
      };
    });

    it('should create logger in production mode when is production true', () => {
      // When
      const prodLogger = new WinstonLoggerService(productionConfig, mockClock);

      // Then
      expect(prodLogger).toBeDefined();
      expect(productionConfig.isProduction).toHaveBeenCalled();
    });

    it('should use development mode when not production', () => {
      // Given
      const devConfig = { ...mockConfig, isProduction: jest.fn().mockReturnValue(false) };

      // When
      const devLogger = new WinstonLoggerService(devConfig, mockClock);

      // Then
      expect(devLogger).toBeDefined();
      expect(devConfig.isProduction).toHaveBeenCalled();
    });
  });
});
