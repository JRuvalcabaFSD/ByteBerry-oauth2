import { Request, Response, NextFunction } from 'express';
import { AuthorizeController } from '@/presentation';
import { IGenerateAuthorizationCodeUseCase } from '@/interfaces';
import { InvalidRequestError } from '@/shared';

describe('AuthorizeController', () => {
  let controller: AuthorizeController;
  let mockGenerateUseCase: jest.Mocked<IGenerateAuthorizationCodeUseCase>;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockGenerateUseCase = {
      execute: jest.fn(),
    };

    controller = new AuthorizeController(mockGenerateUseCase);

    mockRequest = {
      query: {
        client_id: 'test-client-12345',
        response_type: 'code',
        redirect_uri: 'https://example.com/callback',
        code_challenge: 'dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk',
        code_challenge_method: 'S256',
        scope: 'read write',
        state: 'xyz',
      },
    };

    mockResponse = {
      redirect: jest.fn(),
    };

    mockNext = jest.fn();
  });

  it('should redirect with code when valid request provided', async () => {
    mockGenerateUseCase.execute.mockResolvedValue({
      code: 'generated-auth-code',
      state: 'xyz',
    });

    await controller.handle(mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockGenerateUseCase.execute).toHaveBeenCalled();
    expect(mockResponse.redirect).toHaveBeenCalledWith(
      expect.stringContaining('https://example.com/callback?code=generated-auth-code&state=xyz')
    );
  });

  it('should redirect without state when state not provided', async () => {
    mockRequest.query = {
      ...mockRequest.query,
      state: undefined,
    };

    mockGenerateUseCase.execute.mockResolvedValue({
      code: 'generated-auth-code',
      state: undefined,
    });

    await controller.handle(mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockResponse.redirect).toHaveBeenCalledWith(expect.stringContaining('code=generated-auth-code'));
    expect(mockResponse.redirect).toHaveBeenCalledWith(expect.not.stringContaining('state='));
  });

  it('should call next when use case throws error', async () => {
    mockGenerateUseCase.execute.mockRejectedValue(new Error('UseCase error'));

    await controller.handle(mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
  });

  it('should throw error when redirect uri invalid', async () => {
    mockRequest.query = {
      ...mockRequest.query,
      redirect_uri: 'invalid-uri',
    };

    mockGenerateUseCase.execute.mockResolvedValue({
      code: 'generated-auth-code',
      state: 'xyz',
    });

    await controller.handle(mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockNext).toHaveBeenCalledWith(expect.any(InvalidRequestError));
  });

  it('should-construct-proper-url-when-redirect-uri-has-existing-params', async () => {
    mockRequest.query = {
      ...mockRequest.query,
      redirect_uri: 'https://example.com/callback?existing=param',
    };

    mockGenerateUseCase.execute.mockResolvedValue({
      code: 'generated-auth-code',
      state: 'xyz',
    });

    await controller.handle(mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockResponse.redirect).toHaveBeenCalledWith(expect.stringContaining('existing=param'));
    expect(mockResponse.redirect).toHaveBeenCalledWith(expect.stringContaining('code=generated-auth-code'));
  });
});
