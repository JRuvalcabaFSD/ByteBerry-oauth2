import { Request, Response, NextFunction } from 'express';
import { IUuid } from '@/interfaces';
import { createRequestIdMiddleware } from '@/infrastructure';

// Mock implementations
const mockUuid = {
  generate: jest.fn(),
} as unknown as IUuid;

const mockRequest = {
  headers: {},
} as unknown as Request;

const mockResponse = {
  setHeader: jest.fn(),
} as unknown as Response;

const mockNext = jest.fn() as NextFunction;

describe('RequestId Middleware', () => {
  let middleware: ReturnType<typeof createRequestIdMiddleware>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockUuid.generate = jest.fn().mockReturnValue('generated-uuid-123');
    middleware = createRequestIdMiddleware(mockUuid);
  });

  it('should use existing request ID from header', () => {
    const requestWithId = {
      ...mockRequest,
      headers: { 'x-request-id': 'existing-request-id' },
    } as unknown as Request;

    middleware(requestWithId, mockResponse, mockNext);

    expect(requestWithId.requestId).toBe('existing-request-id');
    expect(mockResponse.setHeader).toHaveBeenCalledWith('X-Request-ID', 'existing-request-id');
    expect(mockUuid.generate).not.toHaveBeenCalled();
    expect(mockNext).toHaveBeenCalled();
  });

  it('should generate new request ID when header is missing', () => {
    const requestWithoutId = {
      ...mockRequest,
      headers: {},
    } as unknown as Request;

    middleware(requestWithoutId, mockResponse, mockNext);

    expect(mockUuid.generate).toHaveBeenCalled();
    expect(requestWithoutId.requestId).toBe('generated-uuid-123');
    expect(mockResponse.setHeader).toHaveBeenCalledWith('X-Request-ID', 'generated-uuid-123');
    expect(mockNext).toHaveBeenCalled();
  });

  it('should generate new request ID when header is empty string', () => {
    const requestWithEmptyId = {
      ...mockRequest,
      headers: { 'x-request-id': '' },
    } as unknown as Request;

    middleware(requestWithEmptyId, mockResponse, mockNext);

    expect(mockUuid.generate).toHaveBeenCalled();
    expect(requestWithEmptyId.requestId).toBe('generated-uuid-123');
    expect(mockResponse.setHeader).toHaveBeenCalledWith('X-Request-ID', 'generated-uuid-123');
  });

  it('should set response header correctly', () => {
    const testCases = [
      { headers: { 'x-request-id': 'existing-id' }, expectedId: 'existing-id' },
      { headers: {}, expectedId: 'generated-uuid-123' },
    ];

    testCases.forEach(({ headers, expectedId }, _index) => {
      jest.clearAllMocks();

      const request = {
        ...mockRequest,
        headers,
      } as unknown as Request;

      middleware(request, mockResponse, mockNext);

      expect(mockResponse.setHeader).toHaveBeenCalledWith('X-Request-ID', expectedId);
    });
  });

  it('should call next middleware in chain', () => {
    const scenarios = [{ headers: { 'x-request-id': 'existing-id' } }, { headers: {} }, { headers: { 'x-request-id': '' } }];

    scenarios.forEach(scenario => {
      jest.clearAllMocks();

      const request = {
        ...mockRequest,
        headers: scenario.headers,
      } as unknown as Request;

      middleware(request, mockResponse, mockNext);

      expect(mockNext).toHaveBeenCalledTimes(1);
      expect(mockNext).toHaveBeenCalledWith();
    });
  });
});
