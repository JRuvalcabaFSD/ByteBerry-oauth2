import { Request, Response, NextFunction } from 'express';
import { TokenController } from '@/presentation';
import { IExchangeCodeForTokenUseCase } from '@/interfaces';

describe('TokenController', () => {
  let controller: TokenController;
  let mockExchangeUseCase: jest.Mocked<IExchangeCodeForTokenUseCase>;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockExchangeUseCase = {
      execute: jest.fn(),
    };

    controller = new TokenController(mockExchangeUseCase);

    mockRequest = {
      body: {
        grant_type: 'authorization_code',
        code: 'auth-code-123',
        redirect_uri: 'https://example.com/callback',
        client_id: 'test-client-12345',
        code_verifier: 'dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk',
      },
    };

    mockResponse = {
      json: jest.fn(),
    };

    mockNext = jest.fn();
  });

  it('should return token when valid request provided', async () => {
    const mockTokenResponse = {
      access_token: 'mock_access_token',
      token_type: 'Bearer',
      expires_in: 900,
      scope: 'read write',
    };

    mockExchangeUseCase.execute.mockResolvedValue(mockTokenResponse);

    await controller.handle(mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockExchangeUseCase.execute).toHaveBeenCalledWith(mockRequest.body);
    expect(mockResponse.json).toHaveBeenCalledWith(mockTokenResponse);
  });

  it('should call next when use case throws error', async () => {
    mockExchangeUseCase.execute.mockRejectedValue(new Error('Token exchange failed'));

    await controller.handle(mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
    expect(mockResponse.json).not.toHaveBeenCalled();
  });

  it('should pass all parameters when use case executed', async () => {
    mockExchangeUseCase.execute.mockResolvedValue({
      access_token: 'token',
      token_type: 'Bearer',
      expires_in: 900,
    });

    await controller.handle(mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockExchangeUseCase.execute).toHaveBeenCalledWith({
      grant_type: 'authorization_code',
      code: 'auth-code-123',
      redirect_uri: 'https://example.com/callback',
      client_id: 'test-client-12345',
      code_verifier: 'dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk',
    });
  });

  it('should return token without scope when scope not provided', async () => {
    const mockTokenResponse = {
      access_token: 'mock_access_token',
      token_type: 'Bearer',
      expires_in: 900,
    };

    mockExchangeUseCase.execute.mockResolvedValue(mockTokenResponse);

    await controller.handle(mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockResponse.json).toHaveBeenCalledWith(mockTokenResponse);
    expect(mockResponse.json).toHaveBeenCalledWith(expect.not.objectContaining({ scope: expect.anything() }));
  });

  it('should handle empty body when request body empty', async () => {
    mockRequest.body = {};
    mockExchangeUseCase.execute.mockResolvedValue({
      access_token: 'token',
      token_type: 'Bearer',
      expires_in: 900,
    });

    await controller.handle(mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockExchangeUseCase.execute).toHaveBeenCalledWith({});
  });
});
