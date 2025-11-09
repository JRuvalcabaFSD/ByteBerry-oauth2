import { ExchangeCodeForTokenUseCase } from '@/application';
import { AuthorizationCodeEntity, ClientId, CodeChallenge } from '@/domain';
import { ICodeStore, ILogger, IPKceVerifierService } from '@/interfaces';
import { InvalidGrantError, InvalidRequestError, UnsupportedGrantTypeError } from '@/shared';

describe('ExchangeCodeForTokenUseCase', () => {
  let useCase: ExchangeCodeForTokenUseCase;
  let mockCodeStore: jest.Mocked<ICodeStore>;
  let mockLogger: jest.Mocked<ILogger>;
  let mockPkceVerifier: jest.Mocked<IPKceVerifierService>;
  let mockAuthCode: AuthorizationCodeEntity;

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

    mockPkceVerifier = {
      verify: jest.fn(),
    };

    const clientId = ClientId.create('test-client-12345');
    const codeChallenge = CodeChallenge.create('dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk', 'S256');

    mockAuthCode = AuthorizationCodeEntity.create({
      code: 'test-code-123',
      clientId,
      redirectUri: 'https://example.com/callback',
      codeChallenge,
      expirationMinutes: 5,
      scope: 'read write',
    });

    useCase = new ExchangeCodeForTokenUseCase(mockCodeStore, mockLogger, mockPkceVerifier);
  });

  it('should return token when valid code and verifier provided', async () => {
    mockCodeStore.get.mockReturnValue(mockAuthCode);
    mockPkceVerifier.verify.mockReturnValue(true);

    const request = {
      grant_type: 'authorization_code',
      code: 'test-code-123',
      code_verifier: 'dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk',
      client_id: 'test-client-12345',
      redirect_uri: 'https://example.com/callback',
    };

    const result = await useCase.execute(request);

    expect(result.access_token).toBeDefined();
    expect(result.token_type).toBe('Bearer');
    expect(result.expires_in).toBe(900);
    expect(result.scope).toBe('read write');
    expect(mockAuthCode.isUsed()).toBe(true);
  });

  it('should throw error when grant type invalid', async () => {
    const request = {
      grant_type: 'client_credentials',
      code: 'test-code',
      code_verifier: 'verifier',
      client_id: 'test-client-12345',
      redirect_uri: 'https://example.com/callback',
    };

    await expect(useCase.execute(request)).rejects.toThrow(UnsupportedGrantTypeError);
  });

  it('should throw error when code not found', async () => {
    mockCodeStore.get.mockReturnValue(undefined);

    const request = {
      grant_type: 'authorization_code',
      code: 'non-existent-code',
      code_verifier: 'dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk',
      client_id: 'test-client-12345',
      redirect_uri: 'https://example.com/callback',
    };

    await expect(useCase.execute(request)).rejects.toThrow(InvalidGrantError);
  });

  it('should throw error when code already used', async () => {
    mockAuthCode.markAsUsed();
    mockCodeStore.get.mockReturnValue(mockAuthCode);

    const request = {
      grant_type: 'authorization_code',
      code: 'test-code-123',
      code_verifier: 'dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk',
      client_id: 'test-client-12345',
      redirect_uri: 'https://example.com/callback',
    };

    await expect(useCase.execute(request)).rejects.toThrow(InvalidGrantError);
    expect(mockLogger.warn).toHaveBeenCalled();
  });

  it('should throw error when pkce verification fails', async () => {
    mockCodeStore.get.mockReturnValue(mockAuthCode);
    mockPkceVerifier.verify.mockReturnValue(false);

    const request = {
      grant_type: 'authorization_code',
      code: 'test-code-123',
      code_verifier: 'wrong-verifier',
      client_id: 'test-client-12345',
      redirect_uri: 'https://example.com/callback',
    };

    await expect(useCase.execute(request)).rejects.toThrow(InvalidRequestError);
  });
});
