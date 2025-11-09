import { Request, Response, NextFunction } from 'express';
import { TokenValidator } from '@/presentation';
import { InvalidRequestError } from '@/shared';

describe('TokenValidator', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockRequest = {
      body: {
        grant_type: 'authorization_code',
        code: 'auth-code-123',
        redirect_uri: 'https://example.com/callback',
        client_id: 'test-client-12345',
        code_verifier: 'dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk',
      },
    };

    mockResponse = {};
    mockNext = jest.fn();
  });

  it('should call next when all parameters valid', () => {
    TokenValidator(mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockNext).toHaveBeenCalledWith();
  });

  it('should throw error when grant type invalid', () => {
    mockRequest.body = { ...mockRequest.body, grant_type: 'client_credentials' };

    TokenValidator(mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockNext).toHaveBeenCalledWith(expect.any(InvalidRequestError));
  });

  it('should throw error when code missing', () => {
    mockRequest.body = { ...mockRequest.body, code: undefined };

    TokenValidator(mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockNext).toHaveBeenCalledWith(expect.any(InvalidRequestError));
  });

  it('should throw error when redirect uri missing', () => {
    mockRequest.body = { ...mockRequest.body, redirect_uri: undefined };

    TokenValidator(mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockNext).toHaveBeenCalledWith(expect.any(InvalidRequestError));
  });

  it('should throw error when code verifier missing', () => {
    mockRequest.body = { ...mockRequest.body, code_verifier: undefined };

    TokenValidator(mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockNext).toHaveBeenCalledWith(expect.any(InvalidRequestError));
  });
});
