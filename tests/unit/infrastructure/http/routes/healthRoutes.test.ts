import { Router } from 'express';
import { createHealthRoutes } from '@/infrastructure/http/routes/health.routes';
import { IHealthController } from '@/interfaces';

// Mock del HealthController genérico
const createMockHealthController = (): jest.Mocked<IHealthController> => ({
  getHealth: jest.fn(),
  getDeepHealth: jest.fn(),
  checkHealth: jest.fn(),
});

// Mock de Express Router
jest.mock('express', () => ({
  Router: jest.fn(() => ({
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
    use: jest.fn(),
  })),
}));

describe('createHealthRoutes', () => {
  let mockRouter: jest.Mocked<Router>;
  let mockController: jest.Mocked<IHealthController>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockController = createMockHealthController();
    mockRouter = {
      get: jest.fn(),
      post: jest.fn(),
      put: jest.fn(),
      delete: jest.fn(),
      use: jest.fn(),
    } as unknown as jest.Mocked<Router>;

    (Router as jest.Mock).mockReturnValue(mockRouter);
  });

  it('should create router when called', () => {
    // Act
    const result = createHealthRoutes(mockController);

    // Assert
    expect(Router).toHaveBeenCalled();
    expect(result).toBe(mockRouter);
  });

  it('should register basic health route when creating routes', () => {
    // Act
    createHealthRoutes(mockController);

    // Assert
    expect(mockRouter.get).toHaveBeenCalledWith('/', mockController.getHealth);
  });

  it('should register deep health route when creating routes', () => {
    // Act
    createHealthRoutes(mockController);

    // Assert
    expect(mockRouter.get).toHaveBeenCalledWith('/deep', mockController.getDeepHealth);
  });

  it('should register exactly two routes when creating health routes', () => {
    // Act
    createHealthRoutes(mockController);

    // Assert
    expect(mockRouter.get).toHaveBeenCalledTimes(2);
  });

  it('should use correct http method when routes are defined', () => {
    // Act
    createHealthRoutes(mockController);

    // Assert
    expect(mockRouter.get).toHaveBeenCalled();
    expect(mockRouter.post).not.toHaveBeenCalled();
    expect(mockRouter.put).not.toHaveBeenCalled();
    expect(mockRouter.delete).not.toHaveBeenCalled();
  });

  it('should attach controller methods when routes created', () => {
    // Act
    createHealthRoutes(mockController);

    // Assert
    const calls = mockRouter.get.mock.calls;
    const handlers = calls.map(call => call[1]);

    expect(handlers).toContain(mockController.getHealth);
    expect(handlers).toContain(mockController.getDeepHealth);
  });
});
