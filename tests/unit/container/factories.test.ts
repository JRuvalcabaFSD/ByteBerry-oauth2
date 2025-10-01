import { createConfig } from '@/config';
import { Container, createWinstonLoggerService, TOKENS } from '@/container';
import { createClockService, WinstonLoggerService } from '@/infrastructure';

describe('createWinstonLoggerService', () => {
  it('should_CreateWinstonLoggerService_When_Called', () => {
    // Given
    const container = new Container();
    container.registerSingleton(TOKENS.Config, createConfig);
    container.registerSingleton(TOKENS.Clock, createClockService);

    // When
    const logger = createWinstonLoggerService(container);

    // Then
    expect(logger).toBeInstanceOf(WinstonLoggerService);
  });

  it('should_ReturnFunctionalLogger_When_Created', () => {
    // Given
    const container = new Container();
    container.registerSingleton(TOKENS.Config, createConfig);
    container.registerSingleton(TOKENS.Clock, createClockService);

    // When
    const logger = createWinstonLoggerService(container);

    // Then
    expect(typeof logger.info).toBe('function');
    expect(typeof logger.debug).toBe('function');
    expect(typeof logger.warn).toBe('function');
    expect(typeof logger.error).toBe('function');
    expect(typeof logger.child).toBe('function');
  });

  it('should_NotThrow_When_LoggingWithCreatedLogger', () => {
    // Given
    const container = new Container();
    container.registerSingleton(TOKENS.Config, createConfig);
    container.registerSingleton(TOKENS.Clock, createClockService);
    const logger = createWinstonLoggerService(container);

    // When & Then
    expect(() => logger.info('test')).not.toThrow();
  });
});
