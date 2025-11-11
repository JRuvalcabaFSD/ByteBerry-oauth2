import { GetJwksUseCase } from '@/application';
import { IJwksService, JwksResponse } from '@/interfaces';

describe('GetJwksUseCase', () => {
  let mockJwksService: jest.Mocked<IJwksService>;
  let useCase: GetJwksUseCase;

  const mockJwksResponse: JwksResponse = {
    keys: [
      {
        kty: 'RSA',
        kid: 'test-key-1',
        use: 'sig',
        alg: 'RS256',
        n: 'mock-modulus-value',
        e: 'AQAB',
      },
    ],
  };

  beforeEach(() => {
    mockJwksService = {
      getJwks: jest.fn(),
    };
    useCase = new GetJwksUseCase(mockJwksService);
  });

  it('should return JWKS from service', async () => {
    // Arrange
    mockJwksService.getJwks.mockResolvedValue(mockJwksResponse);

    // Act
    const result = await useCase.execute();

    // Assert
    expect(result).toEqual(mockJwksResponse);
    expect(mockJwksService.getJwks).toHaveBeenCalledTimes(1);
  });

  it('should propagate errors from service', async () => {
    // Arrange
    const error = new Error('JWKS service error');
    mockJwksService.getJwks.mockRejectedValue(error);

    // Act & Assert
    await expect(useCase.execute()).rejects.toThrow('JWKS service error');
  });
});
