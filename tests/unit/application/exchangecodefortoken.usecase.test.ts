import { ExchangeCodeForTokenUseCase } from '@/application';
import { AuthorizationCodeEntity, ClientId, CodeChallenge, CodeVerifier } from '@/domain';
import { ICodeStore, ILogger, IPKceVerifierService, IJwtService } from '@/interfaces';
import { InvalidGrantError, InvalidRequestError, UnsupportedGrantTypeError, InvalidValueObjectError } from '@/shared';

describe('ExchangeCodeForTokenUseCase', () => {
  let useCase: ExchangeCodeForTokenUseCase;
  let mockCodeStore: jest.Mocked<ICodeStore>;
  let mockLogger: jest.Mocked<ILogger>;
  let mockPkceVerifier: jest.Mocked<IPKceVerifierService>;
  let mockJwtService: jest.Mocked<IJwtService>;
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

    mockJwtService = {
      generateAccessToken: jest.fn().mockReturnValue('jwt.access.token'),
      decodeToken: jest.fn(),
      verifyToken: jest.fn(),
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

    useCase = new ExchangeCodeForTokenUseCase(mockCodeStore, mockLogger, mockJwtService, mockPkceVerifier);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  // --- CASO EXITOSO (ya cubierto, pero mejorado) ---
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

    expect(result.access_token).toBe('jwt.access.token');
    expect(result.token_type).toBe('Bearer');
    expect(result.expires_in).toBe(900);
    expect(result.scope).toBe('read write');
    expect(mockAuthCode.isUsed()).toBe(true);
  });

  // --- GRANT TYPE INVÁLIDO ---
  it('should throw error when grant type invalid', async () => {
    const request = {
      grant_type: 'client_credentials' as any,
      code: 'test-code',
      code_verifier: 'verifier',
      client_id: 'test-client-12345',
      redirect_uri: 'https://example.com/callback',
    };

    await expect(useCase.execute(request)).rejects.toThrow(UnsupportedGrantTypeError);
  });

  // --- CÓDIGO NO ENCONTRADO ---
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

  // --- CÓDIGO YA USADO ---
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
    expect(mockLogger.warn).toHaveBeenCalledWith('[ExchangeCodeForTokenUseCase.execute] Attempt to reuse authorization code', {
      code: 'test-code-123',
    });
  });

  // --- CÓDIGO EXPIRADO ---
  it('should throw error when code is expired', async () => {
    // Forzamos expiración
    jest.spyOn(mockAuthCode, 'isExpired').mockReturnValue(true);
    mockCodeStore.get.mockReturnValue(mockAuthCode);

    const request = {
      grant_type: 'authorization_code',
      code: 'test-code-123',
      code_verifier: 'dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk',
      client_id: 'test-client-12345',
      redirect_uri: 'https://example.com/callback',
    };

    await expect(useCase.execute(request)).rejects.toThrow(InvalidGrantError);
    expect(mockLogger.warn).toHaveBeenCalledWith('[ExchangeCodeForTokenUseCase.execute] Authorization code expired', {
      code: 'test-code-123',
    });
  });

  // --- CLIENT_ID INVÁLIDO (Value Object) → Cubre líneas 98-112 ---
  it('should throw InvalidRequestError when client_id is invalid', async () => {
    mockCodeStore.get.mockReturnValue(mockAuthCode);

    // Simulamos que ClientId.create lanza InvalidValueObjectError
    jest.spyOn(ClientId, 'create').mockImplementation(() => {
      throw new InvalidValueObjectError('Invalid client_id format', 'test');
    });

    const request = {
      grant_type: 'authorization_code',
      code: 'test-code-123',
      code_verifier: 'dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk',
      client_id: 'invalid@client!',
      redirect_uri: 'https://example.com/callback',
    };

    await expect(useCase.execute(request)).rejects.toThrow(InvalidRequestError);
    await expect(useCase.execute(request)).rejects.toThrow('Invalid client_id format');
  });

  // --- CODE_VERIFIER INVÁLIDO (Value Object) → Cubre líneas 98-112 ---
  it('should throw InvalidRequestError when code_verifier is invalid', async () => {
    mockCodeStore.get.mockReturnValue(mockAuthCode);

    jest.spyOn(CodeVerifier, 'create').mockImplementation(() => {
      throw new InvalidValueObjectError('Code verifier must be at least 43 characters', 'test');
    });

    const request = {
      grant_type: 'authorization_code',
      code: 'test-code-123',
      code_verifier: 'short',
      client_id: 'test-client-12345',
      redirect_uri: 'https://example.com/callback',
    };

    await expect(useCase.execute(request)).rejects.toThrow(InvalidRequestError);
    await expect(useCase.execute(request)).rejects.toThrow('Code verifier must be at least 43 characters');
  });

  // --- CLIENT_ID NO COINCIDE → Cubre línea 120-121 ---
  it('should throw InvalidGrantError when client_id does not match stored code', async () => {
    mockCodeStore.get.mockReturnValue(mockAuthCode);
    mockPkceVerifier.verify.mockReturnValue(true);

    const request = {
      grant_type: 'authorization_code',
      code: 'test-code-123',
      code_verifier: 'dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk',
      client_id: 'different-client-999',
      redirect_uri: 'https://example.com/callback',
    };

    await expect(useCase.execute(request)).rejects.toThrow(InvalidGrantError);
    await expect(useCase.execute(request)).rejects.toThrow('Client ID mismatch');
  });

  // --- REDIRECT_URI NO COINCIDE → Cubre líneas 128-132 ---
  it('should throw InvalidGrantError when redirect_uri does not match', async () => {
    mockCodeStore.get.mockReturnValue(mockAuthCode);
    mockPkceVerifier.verify.mockReturnValue(true);

    const request = {
      grant_type: 'authorization_code',
      code: 'test-code-123',
      code_verifier: 'dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk',
      client_id: 'test-client-12345',
      redirect_uri: 'https://malicious.com/evil',
    };

    await expect(useCase.execute(request)).rejects.toThrow(InvalidGrantError);
    await expect(useCase.execute(request)).rejects.toThrow('Redirect URI mismatch');
  });

  // --- PKCE VERIFICACIÓN FALLA → Ya cubierto, pero mejorado ---
  it('should throw InvalidGrantError when PKCE verification fails', async () => {
    mockCodeStore.get.mockReturnValue(mockAuthCode);
    mockPkceVerifier.verify.mockReturnValue(false);

    const request = {
      grant_type: 'authorization_code',
      code: 'test-code-123',
      code_verifier: 'x'.repeat(43),
      client_id: 'test-client-12345',
      redirect_uri: 'https://example.com/callback',
    };

    await expect(useCase.execute(request)).rejects.toThrow(InvalidGrantError);
    await expect(useCase.execute(request)).rejects.toThrow('Invalid code_verifier');
    expect(mockLogger.warn).toHaveBeenCalledWith('[ExchangeCodeForTokenUseCase.execute] Invalid PKCE code_verifier', {
      client_id: 'test-client-12345',
    });
  });

  // --- SIN SCOPE → Cubre líneas 152-153 (spread condicional) ---
  it('should return token without scope when auth code has no scope', async () => {
    const noScopeAuthCode = AuthorizationCodeEntity.create({
      code: 'no-scope-code',
      clientId: ClientId.create('test-client-12345'),
      redirectUri: 'https://example.com/callback',
      codeChallenge: CodeChallenge.create('dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk', 'S256'),
      expirationMinutes: 5,
      scope: undefined,
    });

    mockCodeStore.get.mockReturnValue(noScopeAuthCode);
    mockPkceVerifier.verify.mockReturnValue(true);

    const request = {
      grant_type: 'authorization_code',
      code: 'no-scope-code',
      code_verifier: 'dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk',
      client_id: 'test-client-12345',
      redirect_uri: 'https://example.com/callback',
    };

    const result = await useCase.execute(request);

    expect(result).toEqual({
      access_token: 'jwt.access.token',
      token_type: 'Bearer',
      expires_in: 900,
    });
    expect(result.scope).toBeUndefined();
  });

  // --- ERROR INESPERADO → Cubre catch general ---
  it('should log and rethrow unexpected errors', async () => {
    mockCodeStore.get.mockImplementation(() => {
      throw new Error('Database connection failed');
    });

    const request = {
      grant_type: 'authorization_code',
      code: 'test-code-123',
      code_verifier: 'dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk',
      client_id: 'test-client-12345',
      redirect_uri: 'https://example.com/callback',
    };

    await expect(useCase.execute(request)).rejects.toThrow('Database connection failed');
    expect(mockLogger.error).toHaveBeenCalledWith('[ExchangeCodeForTokenUseCase.execute] Unexpected error exchanging code for token', {
      error: 'Database connection failed',
      client_id: 'test-client-12345',
    });
  });

  // --- CASO ESPECIAL: CODE_VERIFIER VÁLIDO PERO PKCE FALLIDO ---
  it('should throw InvalidGrantError when code_verifier is valid length but incorrect value for PKCE', async () => {
    mockCodeStore.get.mockReturnValue(mockAuthCode);
    mockPkceVerifier.verify.mockReturnValue(false);

    const request = {
      grant_type: 'authorization_code',
      code: 'test-code-123',
      code_verifier: 'a'.repeat(43), // longitud válida pero valor incorrecto para PKCE
      client_id: 'test-client-12345',
      redirect_uri: 'https://example.com/callback',
    };

    await expect(useCase.execute(request)).rejects.toThrow(InvalidGrantError);
    await expect(useCase.execute(request)).rejects.toThrow('Invalid code_verifier');
  });
});
