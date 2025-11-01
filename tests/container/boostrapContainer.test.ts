import { bootstrapContainer, Container, validate } from '@/container';
import { IConfig } from '@/interfaces';
import { ContainerCreationError } from '@/shared';

// Mock de IConfig
const mockConfig: IConfig = {
  nodeEnv: 'test',
  port: 4000,
  logLevel: 'info',
  serviceName: 'ByteBerry-OAuth2',
  corsOrigins: ['http://localhost:5173'],
  version: '0.1.0',
  isDevelopment: () => false,
  isProduction: () => false,
  isTest: () => true,
};

describe('bootstrapContainer', () => {
  it('should create container instance when called', () => {
    // Act
    const container = bootstrapContainer();

    // Assert
    expect(container).toBeInstanceOf(Container);
  });

  it('should register config service when bootstrapping', () => {
    // Act
    const container = bootstrapContainer();

    // Assert
    expect(container.isRegistered('Config')).toBe(true);
  });
});

describe('validate', () => {
  let container: Container;

  beforeEach(() => {
    container = new Container();
  });

  it('should pass validation when all services registered', () => {
    // Arrange
    container.registerSingleton('Config', () => mockConfig);

    // Act & Assert
    expect(() => validate(container, ['Config'])).not.toThrow();
  });

  it('should throw container creation error when service missing', () => {
    // Act & Assert
    expect(() => validate(container, ['Config'])).toThrow(ContainerCreationError);
    expect(() => validate(container, ['Config'])).toThrow('Config service not registered');
  });
});
