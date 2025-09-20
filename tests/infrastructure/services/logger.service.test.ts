import { LoggerService } from '@/infrastructure';
import { IClock, IEnvConfig, ILogger } from '@/interfaces';

describe('LoggerService', () => {
  let logger: ILogger;
  let mockConfig: IEnvConfig;
  let mockClock: IClock;
  let consoleInfoSpy: jest.SpyInstance;
  let consoleLogSpy: jest.SpyInstance;
  let consoleErrorSpy: jest.SpyInstance;
  let consoleWarnSpy: jest.SpyInstance;

  beforeEach(() => {
    mockConfig = {
      port: 4000,
      nodeEnv: 'test',
      logLevel: 'info',
      isDevelopment: () => false,
      isProduction: () => false,
      isTest: () => true,
    };

    mockClock = {
      now: jest.fn(() => new Date('2025-01-19T12:00:00.000Z')),
      timestamp: jest.fn(() => 1642608000000),
    };
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
    consoleInfoSpy = jest.spyOn(console, 'info').mockImplementation();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();

    logger = new LoggerService(mockConfig, mockClock);
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
    consoleInfoSpy.mockRestore();
    consoleErrorSpy.mockRestore();
    consoleWarnSpy.mockRestore();
  });

  it('should log info message with context in development format', () => {
    logger.info('Test message', { requestId: 'req-123', userId: 'user-456' });

    const expectedCall = consoleInfoSpy.mock.calls[0][0];
    expect(expectedCall).toContain('2025-01-19T12:00:00.000Z INFO');
    expect(expectedCall).toContain('"userId":"user-456"');
  });
  it('should log error message with Error object', () => {
    const error = new Error('Test error');
    error.stack = 'Error: Test error\n    at test';

    logger.error('Database connection failed', error, { requestId: 'req-123' });

    expect(consoleErrorSpy).toHaveBeenCalledWith(expect.stringContaining('[oauth2][req-123] Database connection failed'));
  });

  it('should filter logs based on configured log level', () => {
    const warnConfig = { ...mockConfig, logLevel: 'warn' as const };
    logger = new LoggerService(warnConfig, mockClock);

    logger.debug('Debug message'); // Should not log
    logger.info('Info message'); // Should not log
    logger.warn('Warn message'); // Should log

    expect(consoleInfoSpy).not.toHaveBeenCalled();
    expect(consoleWarnSpy).toHaveBeenCalledTimes(1);
  });

  it('should log in JSON format for production environment', () => {
    mockConfig.isProduction = () => true;
    mockConfig.isDevelopment = () => false;
    logger = new LoggerService(mockConfig, mockClock);

    logger.info('Production message', { requestId: 'req-123' });

    expect(consoleLogSpy).toHaveBeenCalledWith(
      JSON.stringify({
        timestamp: '2025-01-19T12:00:00.000Z',
        level: 'info',
        service: 'oauth2',
        message: 'Production message',
        requestId: 'req-123',
        data: { requestId: 'req-123' },
      })
    );
  });
  it('should set and use default context', () => {
    // Arrange
    logger.setDefaultContext({ service: 'oauth2', version: '1.0.0' });

    // Act
    logger.info('Test with default context', { requestId: 'req-123' });

    // Assert
    expect(consoleInfoSpy).toHaveBeenCalledWith(expect.stringContaining('{"service":"oauth2","version":"1.0.0","requestId":"req-123"}'));
  });
});
