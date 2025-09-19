import { bootstrapContainer } from '@/container/bootstrap';
import { TOKENS } from '@/container/tokens';
import type { IContainer, IEnvConfig, IHttpServer } from '@/interfaces';

describe('bootstrapContainer - T006', () => {
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

  it('should register HttpServer with dependencies', () => {
    // Act
    const httpServer = container.resolve<IHttpServer>(TOKENS.HttpServer);

    // Assert
    expect(httpServer).toBeDefined();
    expect(httpServer.isRunning()).toBe(false);
    expect(httpServer.getApp()).toBeDefined();
  });

  it('should resolve HttpServer as singleton', () => {
    // Act
    const httpServer1 = container.resolve<IHttpServer>(TOKENS.HttpServer);
    const httpServer2 = container.resolve<IHttpServer>(TOKENS.HttpServer);

    // Assert
    expect(httpServer1).toBe(httpServer2);
  });

  it('should inject Config and Uuid dependencies into HttpServer', () => {
    // Act
    const httpServer = container.resolve<IHttpServer>(TOKENS.HttpServer);
    const config = container.resolve<IEnvConfig>(TOKENS.Config);

    // Assert
    expect(httpServer).toBeDefined();
    expect(config).toBeDefined();
    expect(config.port).toBe(4000); // Default port from EnvConfig
  });

  it('should create HttpServer with proper dependency injection', async () => {
    // Act
    const httpServer = container.resolve<IHttpServer>(TOKENS.HttpServer);

    // Start server to test it was created properly
    await httpServer.start();

    // Assert
    expect(httpServer.isRunning()).toBe(true);

    // Cleanup
    await httpServer.stop();
  });

  it('should register all F0 tokens including HttpServer', () => {
    // Act
    const registeredTokens = container.getRegisteredTokens();

    // Assert
    expect(registeredTokens).toHaveLength(4);
    expect(container.isRegistered(TOKENS.HttpServer)).toBe(true);
    expect(container.isRegistered(TOKENS.Config)).toBe(true);
    expect(container.isRegistered(TOKENS.Uuid)).toBe(true);
    expect(container.isRegistered(TOKENS.HttpServer)).toBe(true);
  });
});
