import { bootstrapContainer, TOKENS } from '@/container';
import { IContainer, IHttpServer, ILogger } from '@/interfaces';

describe('bootstrapContainer - T007', () => {
  let container: IContainer;

  beforeEach(() => {
    container = bootstrapContainer();
  });

  afterEach(async () => {
    try {
      const httpServer = container.resolve<IHttpServer>(TOKENS.HttpServer);
      if (httpServer.isRunning()) {
        await httpServer.stop();
      }
    } catch {
      // Ignore cleanup errors
    }
    container.clear();
  });

  it('should register Logger service with dependencies', () => {
    // Act
    const logger = container.resolve<ILogger>(TOKENS.Logger);

    // Assert
    expect(logger).toBeDefined();
    expect(typeof logger.info).toBe('function');
    expect(typeof logger.error).toBe('function');
    expect(typeof logger.setDefaultContext).toBe('function');
  });

  it('should register HttpServer with Logger dependency', () => {
    // Act
    const httpServer = container.resolve<IHttpServer>(TOKENS.HttpServer);
    const logger = container.resolve<ILogger>(TOKENS.Logger);

    // Assert
    expect(httpServer).toBeDefined();
    expect(logger).toBeDefined();
  });

  it('should resolve Logger as singleton', () => {
    // Act
    const logger1 = container.resolve<ILogger>(TOKENS.Logger);
    const logger2 = container.resolve<ILogger>(TOKENS.Logger);

    // Assert
    expect(logger1).toBe(logger2);
  });

  it('should inject Logger dependencies (Config + Clock)', () => {
    // Act
    const logger = container.resolve<ILogger>(TOKENS.Logger);

    // Assert - Logger should work correctly with injected dependencies
    expect(() => {
      logger.info('Test message', { requestId: 'test-123' });
    }).not.toThrow();
  });

  it('should register all F0 tokens including Logger', () => {
    // Act
    const registeredTokens = container.getRegisteredTokens();

    // Assert
    expect(registeredTokens).toHaveLength(5);
    expect(container.isRegistered(TOKENS.Logger)).toBe(true);
    expect(container.isRegistered(TOKENS.Clock)).toBe(true);
    expect(container.isRegistered(TOKENS.HttpServer)).toBe(true);
    expect(container.isRegistered(TOKENS.Config)).toBe(true);
    expect(container.isRegistered(TOKENS.Uuid)).toBe(true);
  });
});
