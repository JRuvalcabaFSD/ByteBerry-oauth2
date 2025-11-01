import type { Request, Response, Router } from 'express';
import { IContainer, IConfig, IClock } from '@/interfaces';

let mockRouter: any;

jest.mock('express', () => ({
  Router: jest.fn(() => mockRouter),
}));

let createAppRoutes: (container: IContainer) => Router;

const mockConfig = {
  serviceName: 'test-service',
  version: '1.0.0',
  nodeEnv: 'test',
} as IConfig;

const mockClock = {
  isoString: () => '2025-01-01T00:00:00.000Z',
} as IClock;

const mockContainer = {
  resolve: jest.fn(),
} as unknown as IContainer;

const mockRequest = {
  requestId: 'test-request-id',
  method: 'GET',
  originalUrl: '/test',
} as unknown as Request;

const mockResponse = {
  json: jest.fn(),
  status: jest.fn().mockReturnThis(),
} as unknown as Response;

describe('App Routes', () => {
  beforeEach(async () => {
    jest.resetModules();
    jest.clearAllMocks();

    mockRouter = {
      get: jest.fn(),
      use: jest.fn(),
      route: jest.fn(),
    } as unknown as Router;

    const mod = await import('@/infrastructure/http/routes/app.routes');
    createAppRoutes = mod.createAppRoutes as typeof createAppRoutes;

    mockContainer.resolve = jest.fn().mockImplementation((service: string) => {
      switch (service) {
        case 'Config':
          return mockConfig;
        case 'Clock':
          return mockClock;
        default:
          return {};
      }
    });
  });

  it('should create router with proper dependencies', () => {
    const router = createAppRoutes(mockContainer);

    expect(mockContainer.resolve).toHaveBeenCalledWith('Config');
    expect(mockContainer.resolve).toHaveBeenCalledWith('Clock');
    expect(router).toBe(mockRouter);
  });

  /**
   * @test Registers home route correctly
   * @description Ensures home route (/) is registered and configured to return
   * service information, status, and available endpoints
   */
  it('should register home route correctly', () => {
    createAppRoutes(mockContainer);

    const registeredViaGet = (mockRouter.get as jest.Mock).mock.calls.some((c: any[]) => c[0] === '/');
    const registeredViaUse = (mockRouter.use as jest.Mock).mock.calls.some((c: any[]) => c[0] === '/');
    expect(registeredViaGet || registeredViaUse).toBe(true);

    const findHandler = (path: string): ((req: Request, res: Response) => unknown) | undefined => {
      const getCalls = (mockRouter.get as jest.Mock).mock.calls as any[][];
      const useCalls = (mockRouter.use as jest.Mock).mock.calls as any[][];

      const all = [...getCalls, ...useCalls];
      const entry = all.find((c: any[]) => c[0] === path && typeof c[1] === 'function');
      if (entry) return entry[1] as (req: Request, res: Response) => unknown;

      if ((mockRouter.route as jest.Mock)?.mock) {
        const routeResults = (mockRouter.route as jest.Mock).mock.results.map((r: any) => r.value).filter(Boolean);
        for (const res of routeResults) {
          if (res.get && (res.get as jest.Mock).mock) {
            const getOnRouteCall = (res.get as jest.Mock).mock.calls[0];
            if (getOnRouteCall && typeof getOnRouteCall[0] === 'function') return getOnRouteCall[0];
          }
        }
      }

      return undefined;
    };

    const homeRouteHandler = findHandler('/');
    expect(homeRouteHandler).toBeDefined();
  });

  it('should return correct service information for home route', () => {
    createAppRoutes(mockContainer);

    const findHandler = (path: string): ((req: Request, res: Response) => unknown) | undefined => {
      const getCalls = (mockRouter.get as jest.Mock).mock.calls as any[][];
      const useCalls = (mockRouter.use as jest.Mock).mock.calls as any[][];

      const all = [...getCalls, ...useCalls];
      const entry = all.find((c: any[]) => c[0] === path && typeof c[1] === 'function');
      if (entry) return entry[1] as (req: Request, res: Response) => unknown;

      if ((mockRouter.route as jest.Mock)?.mock) {
        const routeResults = (mockRouter.route as jest.Mock).mock.results.map((r: any) => r.value).filter(Boolean);
        for (const res of routeResults) {
          if (res.get && (res.get as jest.Mock).mock) {
            const getOnRouteCall = (res.get as jest.Mock).mock.calls[0];
            if (getOnRouteCall && typeof getOnRouteCall[0] === 'function') return getOnRouteCall[0];
          }
        }
      }

      return undefined;
    };

    const homeRouteHandler = findHandler('/');

    if (!homeRouteHandler) throw new Error('Home route handler not found');

    homeRouteHandler(mockRequest, mockResponse);

    expect(mockResponse.json).toHaveBeenCalledWith({
      service: 'test-service',
      version: '1.0.0',
      status: 'running',
      timestamp: '2025-01-01T00:00:00.000Z',
      requestId: 'test-request-id',
      environment: 'test',
      endpoints: { home: '/' },
    });
  });

  it('should register 404 handler correctly', () => {
    createAppRoutes(mockContainer);

    expect(mockRouter.get).toHaveBeenCalledWith('{*splat}', expect.any(Function));

    const notFoundHandler = (mockRouter.get as jest.Mock).mock.calls.find(call => call[0] === '{*splat}')[1];

    expect(notFoundHandler).toBeDefined();
  });

  it('should return proper 404 error response', () => {
    createAppRoutes(mockContainer);

    const notFoundHandler = (mockRouter.get as jest.Mock).mock.calls.find(call => call[0] === '{*splat}')[1];

    notFoundHandler(mockRequest, mockResponse);

    expect(mockResponse.status).toHaveBeenCalledWith(404);
    expect(mockResponse.json).toHaveBeenCalledWith({
      error: 'Not found',
      message: 'Route GET /test not found',
      requestId: 'test-request-id',
      timestamp: '2025-01-01T00:00:00.000Z',
      endpoints: { home: '/' },
    });
  });
});
