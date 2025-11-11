import { GenerateAuthorizationCodeUseCase } from '@/application';
import { ICodeStore, ILogger } from '@/interfaces';
import { InvalidRequestError } from '@/shared';

describe('GenerateAuthorizationCodeUseCase', () => {
  let useCase: GenerateAuthorizationCodeUseCase;
  let mockCodeStore: jest.Mocked<ICodeStore>;
  let mockLogger: jest.Mocked<ILogger>;

  beforeEach(() => {
    mockCodeStore = {
      set: jest.fn(),
      get: jest.fn(),
      has: jest.fn(),
      cleanedExpired: jest.fn(),
      shutdown: jest.fn(),
    };

    mockLogger = {
      debug: jest.fn(),
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
    } as unknown as jest.Mocked<ILogger>;

    useCase = new GenerateAuthorizationCodeUseCase(mockCodeStore, mockLogger);
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
    expect(mockCodeStore.set).toHaveBeenCalledTimes(1);
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
