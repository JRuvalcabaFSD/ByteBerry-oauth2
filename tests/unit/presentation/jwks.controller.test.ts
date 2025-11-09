import { Request, Response, NextFunction } from 'express';
import { JWksController } from '@/presentation';

describe('JWksController', () => {
  let controller: JWksController;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    controller = new JWksController();

    mockRequest = {};

    mockResponse = {
      json: jest.fn(),
      set: jest.fn(),
    };

    mockNext = jest.fn();
  });

  it('should return jwks when endpoint called', async () => {
    await controller.handle(mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        keys: expect.arrayContaining([
          expect.objectContaining({
            kty: 'RSA',
            use: 'sig',
            kid: expect.any(String),
            alg: 'RS256',
          }),
        ]),
      })
    );
  });

  it('should set cache header when response sent', async () => {
    await controller.handle(mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockResponse.set).toHaveBeenCalledWith('Cache-Control', 'public, max-age=3600');
  });

  it('should_CallNext_When_ErrorOccurs', async () => {
    mockResponse.json = jest.fn(() => {
      throw new Error('JSON error');
    });

    await controller.handle(mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
  });

  it('should return mock key when called', async () => {
    await controller.handle(mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        keys: expect.arrayContaining([
          expect.objectContaining({
            kid: 'mock-key-id',
            n: 'mock-modulus',
            e: 'AQAB',
          }),
        ]),
      })
    );
  });

  it('should return array with single key when called', async () => {
    const jsonCall = jest.fn();
    mockResponse.json = jsonCall;

    await controller.handle(mockRequest as Request, mockResponse as Response, mockNext);

    const callArg = jsonCall.mock.calls[0][0];
    expect(callArg.keys).toHaveLength(1);
  });
});
