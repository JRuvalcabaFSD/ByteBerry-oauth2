import { Request, Response, NextFunction } from 'express';

import { IUuid } from '@/interfaces';
import { createRequestIdMiddleware, RequestIdMiddleware } from '@/infrastructure';

describe('RequestIdMiddleware', () => {
  let mockUuid: IUuid;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: Partial<NextFunction>;

  beforeEach(() => {
    mockUuid = {
      generate: jest.fn(() => 'generated-uuid-123'),
    };

    mockRequest = {
      headers: {},
    };

    mockResponse = {
      setHeader: jest.fn(),
    };

    mockNext = jest.fn();
  });
  it('should generate new request ID when none exists', () => {
    const middleware = new RequestIdMiddleware(mockUuid);
    const middlewareFunction = middleware.create();

    middlewareFunction(mockRequest as Request, mockResponse as Response, mockNext as NextFunction);

    expect(mockRequest.requestId).toBe('generated-uuid-123');
    expect(mockResponse.setHeader).toHaveBeenCalledWith('X-Request-ID', 'generated-uuid-123');
    expect(mockNext).toHaveBeenCalled();
  });
  it('should use existing request ID from headers', () => {
    const existingId = 'existing-request-id';
    mockRequest.headers!['x-request-id'] = existingId;
    const middleware = new RequestIdMiddleware(mockUuid);
    const middlewareFunction = middleware.create();

    middlewareFunction(mockRequest as Request, mockResponse as Response, mockNext as NextFunction);

    expect(mockRequest.requestId).toBe(existingId);
    expect(mockUuid.generate).not.toHaveBeenCalled();
  });
  it('should create middleware via factory function', () => {
    const middlewareFunction = createRequestIdMiddleware(mockUuid);

    expect(typeof middlewareFunction).toBe('function');

    middlewareFunction(mockRequest as Request, mockResponse as Response, mockNext as NextFunction);
    expect(mockRequest.requestId).toBe('generated-uuid-123');
  });

  it('should set X-Request-ID header in response', () => {
    const middlewareFunction = createRequestIdMiddleware(mockUuid);

    middlewareFunction(mockRequest as Request, mockResponse as Response, mockNext as NextFunction);

    expect(mockResponse.setHeader).toHaveBeenCalledWith('X-Request-ID', 'generated-uuid-123');
  });
  it('should call next middleware in pipeline', () => {
    const middlewareFunction = createRequestIdMiddleware(mockUuid);

    middlewareFunction(mockRequest as Request, mockResponse as Response, mockNext as NextFunction);

    expect(mockNext).toHaveBeenCalledTimes(1);
  });
});
