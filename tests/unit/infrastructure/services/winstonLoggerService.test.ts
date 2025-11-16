import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

import { WinstonLoggerService } from '@/infrastructure';
import { IClock, IConfig, ILogger, LogLevel } from '@/interfaces';

const mockWinstonLogger = {
  log: jest.fn(),
};

jest.mock('winston', () => {
  return {
    createLogger: jest.fn(() => mockWinstonLogger),
    format: {
      combine: jest.fn((...formats) => ({ combined: formats })),
      timestamp: jest.fn(options => ({ timestamp: options })),
      errors: jest.fn(options => ({ errors: options })),
      json: jest.fn(() => ({ json: true })),
      colorize: jest.fn(options => ({ colorize: options })),
      printf: jest.fn(options => ({ printf: options })),
    },
    transports: {
      Console: jest.fn().mockImplementation(options => ({ console: options })),
    },
    addColors: jest.fn(),
    config: {
      npm: {
        colors: {
          error: 'red',
          warn: 'yellow',
          info: 'green',
          debug: 'blue',
        },
      },
    },
  };
});

jest.mock('winston-daily-rotate-file', () => {
  return jest.fn().mockImplementation(options => ({ dailyRotate: options }));
});

describe('WinstonLoggerService', () => {
  let mockConfig: jest.Mocked<IConfig>;
  let mockClock: jest.Mocked<IClock>;
  let loggerService: WinstonLoggerService;

  beforeEach(() => {
    jest.clearAllMocks();

    mockConfig = {
      serviceName: 'test-service',
      logLevel: 'info' as LogLevel,
      isProduction: jest.fn(() => false),
      isDevelopment: jest.fn(() => true),
      isTest: jest.fn(() => false),
      nodeEnv: 'development',
      port: 4000,
      corsOrigins: [],
      version: '1.0.0',
      jwtPrivateKey: '',
      jwtPublicKey: '',
      jwtKeyId: '',
      jwtAudience: [],
      jwtIssuer: '',
      jwtExpiration: '',
      oauth2Issuer: '',
      tokenExpiresIn: 900,
      getSummary: jest.fn(() => ({})),
    } as jest.Mocked<IConfig>;

    mockClock = {
      now: jest.fn(() => new Date('2025-01-15T12:30:45.123Z')),
      timestamp: jest.fn(() => 1640995200000),
      isoString: jest.fn(() => 'Tue Jan 15 2025'),
    };

    loggerService = new WinstonLoggerService(mockConfig, mockClock);
  });

  describe('Constructor and Initialization', () => {
    it('should initialize with default context when no context provided', () => {
      const logger = new WinstonLoggerService(mockConfig, mockClock);

      expect(logger).toBeInstanceOf(WinstonLoggerService);
      expect(winston.addColors).toHaveBeenCalledWith(winston.config.npm.colors);
      expect(winston.createLogger).toHaveBeenCalled();
    });
    it('should merge default context with service when context provided', () => {
      const customContext = { module: 'auth', version: '2.0.0' };

      const logger = new WinstonLoggerService(mockConfig, mockClock, customContext);

      expect(logger).toBeInstanceOf(WinstonLoggerService);
    });
    it('should register npm colors when service created', () => {
      new WinstonLoggerService(mockConfig, mockClock);

      expect(winston.createLogger).toHaveBeenCalledWith({
        level: 'info',
        format: expect.any(Object),
        transports: expect.any(Array),
        exitOnError: false,
        handleExceptions: false,
        handleRejections: false,
      });
    });
    it('should use config log level when creating winston logger', () => {
      const debugConfig = { ...mockConfig, logLevel: 'debug' };

      new WinstonLoggerService(debugConfig as IConfig, mockClock);

      expect(winston.createLogger).toHaveBeenCalledWith(
        expect.objectContaining({
          level: 'debug',
        })
      );
    });
  });
  describe('Interface Compliance', () => {
    it('should implement i logger when service created', () => {
      expect(loggerService).toBeInstanceOf(WinstonLoggerService);

      expect(typeof loggerService.info).toBe('function');
      expect(typeof loggerService.debug).toBe('function');
      expect(typeof loggerService.warn).toBe('function');
      expect(typeof loggerService.error).toBe('function');
      expect(typeof loggerService.log).toBe('function');
      expect(typeof loggerService.child).toBe('function');
    });

    it('should be assignable to i logger when service created', () => {
      const logger: ILogger = loggerService;

      expect(logger).toBeDefined();
      expect(logger.info).toBeDefined();
      expect(logger.debug).toBeDefined();
      expect(logger.warn).toBeDefined();
      expect(logger.error).toBeDefined();
      expect(logger.log).toBeDefined();
      expect(logger.child).toBeDefined();
    });
  });
  describe('Logging Methods', () => {
    describe('info() method', () => {
      it('should call log with info level when info called', () => {
        const message = 'Test info message';
        const context = { userId: '123' };
        const logSpy = jest.spyOn(loggerService, 'log');

        loggerService.info(message, context);

        expect(logSpy).toHaveBeenCalledWith('info', message, context);
      });

      it('should call log without context when info calle pd without context', () => {
        const message = 'Test info message';
        const logSpy = jest.spyOn(loggerService, 'log');

        loggerService.info(message);

        expect(logSpy).toHaveBeenCalledWith('info', message, undefined);
      });
    });

    describe('debug() method', () => {
      it('should call log with debug level when debug called', () => {
        const message = 'Test debug message';
        const context = { traceId: 'abc123' };
        const logSpy = jest.spyOn(loggerService, 'log');

        loggerService.debug(message, context);

        expect(logSpy).toHaveBeenCalledWith('debug', message, context);
      });
    });

    describe('warn() method', () => {
      it('should call log with warn level when warn called', () => {
        const message = 'Test warning message';
        const context = { deprecated: true };
        const logSpy = jest.spyOn(loggerService, 'log');

        loggerService.warn(message, context);

        expect(logSpy).toHaveBeenCalledWith('warn', message, context);
      });
    });

    describe('error() method', () => {
      it('should call log with error level when error called', () => {
        const message = 'Test error message';
        const context = { errorCode: 'E001' };
        const logSpy = jest.spyOn(loggerService, 'log');

        loggerService.error(message, context);

        expect(logSpy).toHaveBeenCalledWith('error', message, context);
      });
    });
  });
  describe('log() method - Core Logging Logic', () => {
    it('should create log entry with basic fields when log called', () => {
      const level: LogLevel = 'info';
      const message = 'Test message';

      loggerService.log(level, message);

      expect(mockWinstonLogger.log).toHaveBeenCalledTimes(1);
      expect(mockWinstonLogger.log).toHaveBeenCalledWith(level, {
        timestamp: 'Tue Jan 15 2025',
        level: 'info',
        service: 'test-service',
        message: 'Test message',
      });
    });
    it('should create log entry with basic fields when log called', () => {
      const level: LogLevel = 'info';
      const message = 'Test message';

      loggerService.log(level, message);

      expect(mockWinstonLogger.log).toHaveBeenCalledWith(level, {
        timestamp: 'Tue Jan 15 2025',
        level: 'info',
        service: 'test-service',
        message: 'Test message',
      });
    });

    it('should include request id when context contains request id', () => {
      const context = { requestId: 'req-123', userId: '456' };

      loggerService.log('info', 'Test message', context);

      expect(mockWinstonLogger.log).toHaveBeenCalledWith('info', {
        timestamp: 'Tue Jan 15 2025',
        level: 'info',
        service: 'test-service',
        message: 'Test message',
        requestId: 'req-123',
        context: { userId: '456' },
      });
    });
    it('dddd', () => {
      const context = { requestId: 'req-123', userId: '456', service: null };

      loggerService.log('info', 'Test message', context);

      expect(mockWinstonLogger.log).toHaveBeenCalledWith('info', {
        timestamp: 'Tue Jan 15 2025',
        level: 'info',
        service: 'test-service',
        message: 'Test message',
        requestId: 'req-123',
        context: { userId: '456' },
      });
    });

    it('should merge default and provided context when both contexts provided', () => {
      const defaultContext = { module: 'auth', version: '1.0.0' };
      const logger = new WinstonLoggerService(mockConfig, mockClock, defaultContext);
      const providedContext = { userId: '123', action: 'login' };

      logger.log('info', 'User action', providedContext);

      expect(mockWinstonLogger.log).toHaveBeenCalledWith('info', {
        timestamp: 'Tue Jan 15 2025',
        level: 'info',
        service: 'test-service',
        message: 'User action',
        context: {
          module: 'auth',
          version: '1.0.0',
          userId: '123',
          action: 'login',
        },
      });
    });

    it('should override default context with provided context when keys collide', () => {
      const defaultContext = { module: 'auth', environment: 'dev' };
      const logger = new WinstonLoggerService(mockConfig, mockClock, defaultContext);
      const providedContext = { module: 'payments', userId: '123' };

      logger.log('info', 'Test message', providedContext);

      expect(mockWinstonLogger.log).toHaveBeenCalledWith('info', {
        timestamp: 'Tue Jan 15 2025',
        level: 'info',
        service: 'test-service',
        message: 'Test message',
        context: {
          module: 'payments',
          environment: 'dev',
          userId: '123',
        },
      });
    });

    it('should exclude service from context when service in context', () => {
      const context = { service: 'custom-service', userId: '123' };

      loggerService.log('info', 'Test message', context);

      expect(mockWinstonLogger.log).toHaveBeenCalledWith('info', {
        timestamp: 'Tue Jan 15 2025',
        level: 'info',
        service: 'custom-service',
        message: 'Test message',
        context: { userId: '123' },
      });
    });

    it('should omit context field when no context after filtering', () => {
      const context = { service: 'custom-service' };

      loggerService.log('info', 'Test message', context);

      expect(mockWinstonLogger.log).toHaveBeenCalledWith('info', {
        timestamp: 'Tue Jan 15 2025',
        level: 'info',
        service: 'custom-service',
        message: 'Test message',
      });
    });

    it('should use clock for timestamp when log called', () => {
      mockClock.isoString.mockReturnValue('Custom timestamp');

      loggerService.log('info', 'Test message');

      expect(mockClock.isoString).toHaveBeenCalled();
      expect(mockWinstonLogger.log).toHaveBeenCalledWith(
        'info',
        expect.objectContaining({
          timestamp: 'Custom timestamp',
        })
      );
    });

    it('should handle undefined request id when request id is undefined', () => {
      const context = { requestId: undefined, userId: '123' };

      loggerService.log('info', 'Test message', context);

      expect(mockWinstonLogger.log).toHaveBeenCalledWith('info', {
        timestamp: 'Tue Jan 15 2025',
        level: 'info',
        service: 'test-service',
        message: 'Test message',
        context: { userId: '123' },
      });
    });

    it('should handle null request id when request id is null', () => {
      const context = { requestId: null, userId: '123' };

      loggerService.log('info', 'Test message', context);

      expect(mockWinstonLogger.log).toHaveBeenCalledWith('info', {
        timestamp: 'Tue Jan 15 2025',
        level: 'info',
        service: 'test-service',
        message: 'Test message',
        requestId: null,
        context: { userId: '123' },
      });
    });
  });

  describe('child() method', () => {
    it('should return new logger instance when child called', () => {
      const childContext = { requestId: 'req-123', module: 'auth' };

      const childLogger = loggerService.child(childContext);

      expect(childLogger).toBeInstanceOf(WinstonLoggerService);
      expect(childLogger).not.toBe(loggerService);
    });

    it('should inherit config and clock when child created', () => {
      const childContext = { requestId: 'req-123' };

      const childLogger = loggerService.child(childContext);

      expect(childLogger).toBeInstanceOf(WinstonLoggerService);

      expect(winston.createLogger).toHaveBeenCalledTimes(2);
    });

    it('should merge context with parent when child logs message', () => {
      const parentContext = { module: 'auth', version: '1.0.0' };
      const parentLogger = new WinstonLoggerService(mockConfig, mockClock, parentContext);
      const childContext = { requestId: 'req-123', userId: '456' };

      const childLogger = parentLogger.child(childContext);
      childLogger.info('Child log message');

      expect(mockWinstonLogger.log).toHaveBeenLastCalledWith('info', {
        timestamp: 'Tue Jan 15 2025',
        level: 'info',
        service: 'test-service',
        message: 'Child log message',
        requestId: 'req-123',
        context: {
          module: 'auth',
          version: '1.0.0',
          userId: '456',
        },
      });
    });

    it('should override parent context when child context has same keys', () => {
      const parentContext = { module: 'auth', requestId: 'parent-req' };
      const parentLogger = new WinstonLoggerService(mockConfig, mockClock, parentContext);
      const childContext = { module: 'payments', requestId: 'child-req' };

      const childLogger = parentLogger.child(childContext);
      childLogger.info('Override test');

      expect(mockWinstonLogger.log).toHaveBeenLastCalledWith('info', {
        timestamp: 'Tue Jan 15 2025',
        level: 'info',
        service: 'test-service',
        message: 'Override test',
        requestId: 'child-req',
        context: {
          module: 'payments',
        },
      });
    });

    it('should allow multiple levels of children when children create children', () => {
      const level1Context = { level: '1', shared: 'original' };
      const level2Context = { level: '2', shared: 'overridden' };
      const level3Context = { level: '3', final: 'value' };

      const level1Logger = loggerService.child(level1Context);
      const level2Logger = level1Logger.child(level2Context);
      const level3Logger = level2Logger.child(level3Context);
      level3Logger.info('Multi-level test');

      expect(mockWinstonLogger.log).toHaveBeenLastCalledWith('info', {
        timestamp: 'Tue Jan 15 2025',
        level: 'info',
        service: 'test-service',
        message: 'Multi-level test',
        context: {
          level: '3',
          shared: 'overridden',
          final: 'value',
        },
      });
    });
  });
  describe('Format Creation', () => {
    describe('Development Format', () => {
      it('should format development log correctly when printf formatter called', () => {
        mockConfig.isProduction.mockReturnValue(false);
        let capturedFormatter: ((info: any) => string) | undefined;

        (winston.format.printf as jest.Mock).mockImplementation((formatter: (info: any) => string) => {
          capturedFormatter = formatter;
          return { printf: formatter };
        });

        new WinstonLoggerService(mockConfig, mockClock);

        expect(capturedFormatter).toBeDefined();

        if (capturedFormatter) {
          const basicInfo = {
            timestamp: '12:34:56.789',
            level: 'info',
            message: 'Test message',
            service: 'test-service',
          };
          const basicResult = capturedFormatter(basicInfo);
          expect(basicResult).toBe('12:34:56.789 [test-service] info : Test message');

          const infoWithRequestId = {
            timestamp: '12:34:56.789',
            level: 'error',
            message: 'Error message',
            service: 'auth-service',
            requestId: 'very-long-request-id-that-should-be-truncated',
          };
          const requestIdResult = capturedFormatter(infoWithRequestId);
          expect(requestIdResult).toBe('12:34:56.789 [auth-service] error [very-lon]: Error message');

          const infoWithContext = {
            timestamp: '12:34:56.789',
            level: 'debug',
            message: 'Debug message',
            service: 'payment-service',
            requestId: 'req123',
            context: { userId: '456', action: 'payment' },
          };
          const contextResult = capturedFormatter(infoWithContext);
          expect(contextResult).toContain('12:34:56.789 [payment-service] debug [req123]: Debug message');
          expect(contextResult).toContain('{\n  "userId": "456",\n  "action": "payment"\n}');

          const infoWithMeta = {
            timestamp: '12:34:56.789',
            level: 'warn',
            message: 'Warning message',
            service: 'notification-service',
            duration: 1500,
            statusCode: 429,
          };
          const metaResult = capturedFormatter(infoWithMeta);
          expect(metaResult).toContain('12:34:56.789 [notification-service] warn : Warning message');
          expect(metaResult).toContain('{\n  "duration": 1500,\n  "statusCode": 429\n}');

          const infoWithNonStringRequestId = {
            timestamp: '12:34:56.789',
            level: 'info',
            message: 'Test message',
            service: 'test-service',
            requestId: 12345,
          };
          const nonStringResult = capturedFormatter(infoWithNonStringRequestId);
          expect(nonStringResult).toBe('12:34:56.789 [test-service] info : Test message');
        }
      });
      it('should use development format when not production', () => {
        mockConfig.isProduction.mockReturnValue(false);
        const formatSpy = jest.spyOn(winston.format, 'combine');

        new WinstonLoggerService(mockConfig, mockClock);

        expect(formatSpy).toHaveBeenCalled();

        expect(winston.format.timestamp).toHaveBeenCalledWith({ format: 'HH:mm:ss.SSS' });
        expect(winston.format.errors).toHaveBeenCalledWith({ stack: true });
        expect(winston.format.colorize).toHaveBeenCalledWith({
          level: true,
          colors: winston.config.npm.colors,
        });
        expect(winston.format.printf).toHaveBeenCalled();
      });
    });

    describe('Production Format', () => {
      it('should use production format when production', () => {
        mockConfig.isProduction.mockReturnValue(true);
        const formatSpy = jest.spyOn(winston.format, 'combine');

        new WinstonLoggerService(mockConfig, mockClock);

        expect(formatSpy).toHaveBeenCalled();

        expect(winston.format.timestamp).toHaveBeenCalledWith({ format: 'YYYY-MM-DDTHH:mm:ss.SSSZ' });
        expect(winston.format.errors).toHaveBeenCalledWith({ stack: true });
        expect(winston.format.json).toHaveBeenCalled();
      });
    });
  });

  describe('Transport Creation', () => {
    it('should create console transport when service created', () => {
      new WinstonLoggerService(mockConfig, mockClock);

      expect(winston.transports.Console).toHaveBeenCalledWith({
        handleExceptions: false,
        handleRejections: false,
      });
    });

    it('should create combined log transport when service created', () => {
      new WinstonLoggerService(mockConfig, mockClock);

      expect(DailyRotateFile).toHaveBeenCalledWith({
        filename: 'logs/combined-%DATE%.log',
        datePattern: 'YYYY-MM-DD',
        handleExceptions: false,
        maxFiles: '14d',
        maxSize: '20m',
        format: expect.any(Object),
      });
    });

    it('should create error transport when production', () => {
      mockConfig.isProduction.mockReturnValue(true);

      new WinstonLoggerService(mockConfig, mockClock);

      expect(DailyRotateFile).toHaveBeenCalledWith({
        filename: 'logs/error-%DATE%.log',
        datePattern: 'YYYY-MM-DD',
        level: 'error',
        handleExceptions: false,
        maxSize: '20m',
        maxFiles: '14d',
        format: expect.any(Object),
      });
    });

    it('should not create error transport when development', () => {
      mockConfig.isProduction.mockReturnValue(false);

      new WinstonLoggerService(mockConfig, mockClock);

      expect(DailyRotateFile).toHaveBeenCalledTimes(2);
      expect(DailyRotateFile).not.toHaveBeenCalledWith(
        expect.objectContaining({
          filename: 'logs/error-%DATE%.log',
        })
      );
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle empty context when empty object provided', () => {
      loggerService.log('info', 'Test message', {});

      expect(mockWinstonLogger.log).toHaveBeenCalledWith('info', {
        timestamp: 'Tue Jan 15 2025',
        level: 'info',
        service: 'test-service',
        message: 'Test message',
      });
    });

    it('should handle null context when null provided', () => {
      loggerService.log('info', 'Test message', null as any);

      expect(mockWinstonLogger.log).toHaveBeenCalledWith('info', {
        timestamp: 'Tue Jan 15 2025',
        level: 'info',
        service: 'test-service',
        message: 'Test message',
      });
    });

    it('should handle complex context values when nested objects provided', () => {
      const complexContext = {
        user: { id: '123', roles: ['admin', 'user'] },
        metadata: { source: 'api', version: 1 },
        array: [1, 2, 3],
      };

      loggerService.log('info', 'Complex context test', complexContext);

      expect(mockWinstonLogger.log).toHaveBeenCalledWith('info', {
        timestamp: 'Tue Jan 15 2025',
        level: 'info',
        service: 'test-service',
        message: 'Complex context test',
        context: complexContext,
      });
    });

    it('should handle all log levels when different levels called', () => {
      const levels: LogLevel[] = ['debug', 'info', 'warn', 'error'];

      levels.forEach(level => {
        loggerService.log(level, `Test ${level} message`);
      });

      levels.forEach(level => {
        expect(mockWinstonLogger.log).toHaveBeenCalledWith(
          level,
          expect.objectContaining({
            level,
            message: `Test ${level} message`,
          })
        );
      });
    });

    it('should preserve special characters when message has special chars', () => {
      const message = 'Test message with special chars: ñáéíóú 中文 🚀 "quotes" \'apostrophes\'';

      loggerService.log('info', message);

      expect(mockWinstonLogger.log).toHaveBeenCalledWith(
        'info',
        expect.objectContaining({
          message,
        })
      );
    });
  });

  describe('Performance and Memory', () => {
    it('should not leak memory when called many times', () => {
      const iterations = 100;

      for (let i = 0; i < iterations; i++) {
        loggerService.info(`Test message ${i}`, { iteration: i });
      }

      expect(mockWinstonLogger.log).toHaveBeenCalledTimes(iterations);
    });

    it('should execute quickly when logging many messages', () => {
      const iterations = 1000;
      const startTime = Date.now();

      for (let i = 0; i < iterations; i++) {
        loggerService.info(`Message ${i}`);
      }

      const endTime = Date.now();

      const executionTime = endTime - startTime;
      expect(executionTime).toBeLessThan(100);
      expect(mockWinstonLogger.log).toHaveBeenCalledTimes(iterations);
    });

    it('should handle large context when big object provided', () => {
      const largeContext: Record<string, any> = {};
      for (let i = 0; i < 100; i++) {
        largeContext[`key${i}`] = `value${i}`.repeat(10);
      }

      expect(() => loggerService.info('Large context test', largeContext)).not.toThrow();
      expect(mockWinstonLogger.log).toHaveBeenCalledWith(
        'info',
        expect.objectContaining({
          context: largeContext,
        })
      );
    });
  });

  describe('Integration Scenarios', () => {
    it('should work with real request flow when simulating microservice request', () => {
      const requestId = 'req-550e8400-e29b-41d4-a716-446655440000';
      const requestLogger = loggerService.child({ requestId, module: 'auth' });

      requestLogger.info('Request started', { method: 'POST', path: '/auth/login' });
      requestLogger.debug('Validating credentials', { userId: 'user123' });
      requestLogger.warn('Rate limit approaching', { remainingAttempts: 2 });
      requestLogger.info('Request completed', { statusCode: 200, duration: 150 });

      expect(mockWinstonLogger.log).toHaveBeenCalledTimes(4);

      expect(mockWinstonLogger.log).toHaveBeenNthCalledWith(1, 'info', {
        timestamp: 'Tue Jan 15 2025',
        level: 'info',
        service: 'test-service',
        message: 'Request started',
        requestId,
        context: {
          module: 'auth',
          method: 'POST',
          path: '/auth/login',
        },
      });

      expect(mockWinstonLogger.log).toHaveBeenLastCalledWith('info', {
        timestamp: 'Tue Jan 15 2025',
        level: 'info',
        service: 'test-service',
        message: 'Request completed',
        requestId,
        context: {
          module: 'auth',
          statusCode: 200,
          duration: 150,
        },
      });
    });

    it('should support error object logging when error occurs', () => {
      const error = new Error('Database connection failed');
      error.stack = 'Error: Database connection failed\n    at Object.<anonymous>';

      loggerService.error('Database error occurred', {
        error: error.message,
        stack: error.stack,
        errorCode: 'DB_CONN_FAILED',
      });

      expect(mockWinstonLogger.log).toHaveBeenCalledWith('error', {
        timestamp: 'Tue Jan 15 2025',
        level: 'error',
        service: 'test-service',
        message: 'Database error occurred',
        context: {
          error: 'Database connection failed',
          stack: 'Error: Database connection failed\n    at Object.<anonymous>',
          errorCode: 'DB_CONN_FAILED',
        },
      });
    });

    it('should support multiple service instances when different services', () => {
      const authConfig = { ...mockConfig, serviceName: 'auth-service' };
      const paymentConfig = { ...mockConfig, serviceName: 'payment-service' };

      const authLogger = new WinstonLoggerService(authConfig, mockClock);
      const paymentLogger = new WinstonLoggerService(paymentConfig, mockClock);

      authLogger.info('Auth operation', { operation: 'login' });
      paymentLogger.info('Payment operation', { operation: 'charge' });

      expect(mockWinstonLogger.log).toHaveBeenCalledWith('info', {
        timestamp: 'Tue Jan 15 2025',
        level: 'info',
        service: 'auth-service',
        message: 'Auth operation',
        context: { operation: 'login' },
      });

      expect(mockWinstonLogger.log).toHaveBeenCalledWith('info', {
        timestamp: 'Tue Jan 15 2025',
        level: 'info',
        service: 'payment-service',
        message: 'Payment operation',
        context: { operation: 'charge' },
      });
    });
  });

  describe('Testability and Mocking Support', () => {
    it('should be mockable for testing when used in other components', () => {
      const mockLogger: jest.Mocked<ILogger> = {
        info: jest.fn(),
        debug: jest.fn(),
        warn: jest.fn(),
        error: jest.fn(),
        log: jest.fn(),
        child: jest.fn(),
      };

      mockLogger.info('Mock test', { testing: true });
      mockLogger.child({ module: 'test' });

      expect(mockLogger.info).toHaveBeenCalledWith('Mock test', { testing: true });
      expect(mockLogger.child).toHaveBeenCalledWith({ module: 'test' });
    });

    it('should allow dependency injection when used in services', () => {
      class TestService {
        constructor(private logger: ILogger) {}

        doSomething() {
          this.logger.info('Service operation', { operation: 'test' });
        }
      }

      const service = new TestService(loggerService);
      service.doSomething();

      expect(mockWinstonLogger.log).toHaveBeenCalledWith(
        'info',
        expect.objectContaining({
          message: 'Service operation',
          context: { operation: 'test' },
        })
      );
    });
  });
});
