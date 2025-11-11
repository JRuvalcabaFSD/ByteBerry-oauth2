import { Request, Response, NextFunction } from 'express';
import { ValidateAuthorizationRequest } from '@/presentation';
import { InvalidRequestError } from '@/shared';

describe('ValidateAuthorizationRequest', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockRequest = {
      query: {
        client_id: 'test-client-12345',
        response_type: 'code',
        redirect_uri: 'https://example.com/callback',
        code_challenge: 'dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk',
        code_challenge_method: 'S256',
      },
    };

    mockResponse = {};
    mockNext = jest.fn();
  });

  it('should call next when all parameters valid', () => {
    ValidateAuthorizationRequest(mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockNext).toHaveBeenCalledWith();
  });

  it('should throw error when client id missing', () => {
    mockRequest.query = { ...mockRequest.query, client_id: undefined };

    ValidateAuthorizationRequest(mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockNext).toHaveBeenCalledWith(expect.any(InvalidRequestError));
  });

  it('should throw error when response type not code', () => {
    mockRequest.query = { ...mockRequest.query, response_type: 'token' };

    ValidateAuthorizationRequest(mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockNext).toHaveBeenCalledWith(expect.any(InvalidRequestError));
  });

  it('should throw error when code challenge missing', () => {
    mockRequest.query = { ...mockRequest.query, code_challenge: undefined };

    ValidateAuthorizationRequest(mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockNext).toHaveBeenCalledWith(expect.any(InvalidRequestError));
  });

  it('should throw error when code challenge method invalid', () => {
    mockRequest.query = { ...mockRequest.query, code_challenge_method: 'invalid' };

    ValidateAuthorizationRequest(mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockNext).toHaveBeenCalledWith(expect.any(InvalidRequestError));
  });
});
