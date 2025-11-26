import { GenerateAuthorizationCodeUseCase } from '@/application';
import { ILogger } from '@/interfaces';
import { InvalidRequestError } from '@/shared';

describe('GenerateAuthorizationCodeUseCase', () => {
  let useCase: GenerateAuthorizationCodeUseCase;
  let mockLogger: jest.Mocked<ILogger>;
  let mockAuthCodeRepository: any;
  let mockValidateClientUseCase: any;

  beforeEach(() => {
    mockLogger = {
      debug: jest.fn(),
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
    } as unknown as jest.Mocked<ILogger>;

    mockAuthCodeRepository = {
      save: jest.fn().mockResolvedValue(undefined),
      findByCode: jest.fn(),
      cleanup: jest.fn(),
      set: jest.fn().mockResolvedValue(undefined),
      get: jest.fn(),
    };

    mockValidateClientUseCase = {
      execute: jest.fn().mockImplementation(request => {
        if (request.client_id === 'short' || request.clientId === 'short') {
          return Promise.reject(new InvalidRequestError('Invalid client_id'));
        }
        return Promise.resolve({
          clientId: 'test-client-12345',
          clientName: 'Test Client',
          isPublic: false,
          redirectUris: ['https://example.com/callback'],
          grantTypes: ['authorization_code'],
        });
      }),
    };

    useCase = new GenerateAuthorizationCodeUseCase(mockAuthCodeRepository, mockValidateClientUseCase, mockLogger);
  });

  it('should generate code when valid request provided', async () => {
    const request = {
      response_type: 'code',
      client_id: 'test-client-12345',
      redirect_uri: 'https://example.com/callback',
      code_challenge: 'dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk',
      code_challenge_method: 'S256' as const,
      scope: 'read write',
      state: 'xyz',
    };

    const result = await useCase.execute(request);

    expect(result.code).toBeDefined();
    expect(result.state).toBe('xyz');
    expect(mockAuthCodeRepository.save).toHaveBeenCalledTimes(1);
    expect(mockLogger.debug).toHaveBeenCalled();
  });

  it('should throw error when response type not code', async () => {
    const request = {
      response_type: 'token',
      client_id: 'test-client-12345',
      redirect_uri: 'https://example.com/callback',
      code_challenge: 'dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk',
      code_challenge_method: 'S256' as const,
    };

    await expect(useCase.execute(request)).rejects.toThrow(InvalidRequestError);
  });

  it('should throw error when pkce parameters missing', async () => {
    const request = {
      response_type: 'code',
      client_id: 'test-client-12345',
      redirect_uri: 'https://example.com/callback',
      code_challenge: '',
      code_challenge_method: 'S256' as const,
    };

    await expect(useCase.execute(request)).rejects.toThrow(InvalidRequestError);
  });

  it('should throw error when client id invalid', async () => {
    const request = {
      response_type: 'code',
      client_id: 'short',
      redirect_uri: 'https://example.com/callback',
      code_challenge: 'dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk',
      code_challenge_method: 'S256' as const,
    };

    await expect(useCase.execute(request)).rejects.toThrow(InvalidRequestError);
  });

  it('should generate code without state when state not provided', async () => {
    const request = {
      response_type: 'code',
      client_id: 'test-client-12345',
      redirect_uri: 'https://example.com/callback',
      code_challenge: 'dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk',
      code_challenge_method: 'S256' as const,
    };

    const result = await useCase.execute(request);

    expect(result.code).toBeDefined();
    expect(result.state).toBeUndefined();
  });
});
