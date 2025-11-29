// factories.test.ts
import {
  createWinstonLoggerService,
  createGracefulShutdown,
  createHttpServer,
  createHealthService,
  createGenerateAuthorizationCodeUseCase,
  createExchangeCodeForTokenUseCase,
  createAuthorizeController,
  createTokenController,
  createJwksController,
  createPkceVerifierService,
  createJwtService,
  createJwksService,
  createGetJwksUseCase,
} from '@/container';
import * as infrastructure from '@/infrastructure';
import * as application from '@/application';
import * as presentation from '@/presentation';
import { IContainer } from '@/interfaces';

// Mock de dependencias
jest.mock('@/infrastructure');
jest.mock('@/application');
jest.mock('@/presentation');

describe('Factories', () => {
  let mockContainer: jest.Mocked<IContainer>;
  let mockResolve: jest.Mock;

  beforeEach(() => {
    mockResolve = jest.fn();
    mockContainer = {
      resolve: mockResolve,
    } as any;

    // Resetear mocks
    jest.clearAllMocks();
  });

  describe('createWinstonLoggerService', () => {
    it('should create WinstonLoggerService with Config and Clock', () => {
      const mockConfig = { serviceName: 'test' };
      const mockClock = { now: () => new Date() };
      mockResolve.mockReturnValueOnce(mockConfig).mockReturnValueOnce(mockClock);

      const result = createWinstonLoggerService(mockContainer);

      expect(infrastructure.WinstonLoggerService).toHaveBeenCalledWith(mockConfig, mockClock);
      expect(result).toBeInstanceOf(infrastructure.WinstonLoggerService);
    });
  });

  describe('createGracefulShutdown', () => {
    it('should create GracefulShutdown with Logger', () => {
      const mockLogger = { info: jest.fn() };
      mockResolve.mockReturnValue(mockLogger);

      const result = createGracefulShutdown(mockContainer);

      expect(infrastructure.GracefulShutdown).toHaveBeenCalledWith(mockLogger);
      expect(result).toBeInstanceOf(infrastructure.GracefulShutdown);
    });
  });

  describe('createHttpServer', () => {
    it('should create HttpServer with container', () => {
      const result = createHttpServer(mockContainer);

      expect(infrastructure.HttpServer).toHaveBeenCalledWith(mockContainer);
      expect(result).toBeInstanceOf(infrastructure.HttpServer);
    });
  });

  describe('createHealthService', () => {
    it('should create HealthService with container', () => {
      const result = createHealthService(mockContainer);

      expect(infrastructure.HealthService).toHaveBeenCalledWith(mockContainer);
      expect(result).toBeInstanceOf(infrastructure.HealthService);
    });
  });

  describe('createGenerateAuthorizationCodeUseCase', () => {
    it('should create GenerateAuthorizationCodeUseCase with CodeStore and Logger', () => {
      const mockAuthorizationCodeRepository = { execute: jest.fn() };
      const mockValidateClientUseCase = { execute: jest.fn() };
      const mockLogger = { info: jest.fn() };
      mockResolve
        .mockReturnValueOnce(mockAuthorizationCodeRepository)
        .mockReturnValueOnce(mockValidateClientUseCase)
        .mockReturnValueOnce(mockLogger);

      const result = createGenerateAuthorizationCodeUseCase(mockContainer);

      expect(application.GenerateAuthorizationCodeUseCase).toHaveBeenCalledWith(
        mockAuthorizationCodeRepository,
        mockValidateClientUseCase,
        mockLogger
      );
      expect(result).toBeInstanceOf(application.GenerateAuthorizationCodeUseCase);
    });
  });

  describe('createExchangeCodeForTokenUseCase', () => {
    it('should create ExchangeCodeForTokenUseCase with all dependencies', () => {
      const mockAuthorizationCodeRepository = { save: jest.fn(), findByCode: jest.fn(), cleanup: jest.fn() };
      const mockTokenCodeRepository = {
        saveToken: jest.fn(),
        findByTokenId: jest.fn(),
        isBlacklisted: jest.fn(),
        blacklistToken: jest.fn(),
      };
      const mockLogger = { error: jest.fn() };
      const mockJwtService = { sign: jest.fn() };
      const mockPkceVerifier = { verify: jest.fn() };

      mockResolve
        .mockReturnValueOnce(mockAuthorizationCodeRepository)
        .mockReturnValueOnce(mockTokenCodeRepository)
        .mockReturnValueOnce(mockLogger)
        .mockReturnValueOnce(mockJwtService)
        .mockReturnValueOnce(mockPkceVerifier);

      const result = createExchangeCodeForTokenUseCase(mockContainer);

      expect(application.ExchangeCodeForTokenUseCase).toHaveBeenCalledWith(
        mockAuthorizationCodeRepository,
        mockTokenCodeRepository,
        mockLogger,
        mockJwtService,
        mockPkceVerifier
      );
      expect(result).toBeInstanceOf(application.ExchangeCodeForTokenUseCase);
    });
  });

  describe('createAuthorizeController', () => {
    it('should create AuthorizeController with GenerateAuthorizationCodeUseCase', () => {
      const mockUseCase = { execute: jest.fn() };
      mockResolve.mockReturnValue(mockUseCase);

      const result = createAuthorizeController(mockContainer);

      expect(presentation.AuthorizeController).toHaveBeenCalledWith(mockUseCase);
      expect(result).toBeInstanceOf(presentation.AuthorizeController);
    });
  });

  describe('createTokenController', () => {
    it('should create TokenController with ExchangeCodeForTokenUseCase', () => {
      const mockUseCase = { execute: jest.fn() };
      mockResolve.mockReturnValue(mockUseCase);

      const result = createTokenController(mockContainer);

      expect(presentation.TokenController).toHaveBeenCalledWith(mockUseCase);
      expect(result).toBeInstanceOf(presentation.TokenController);
    });
  });

  describe('createJwksController', () => {
    it('should create JWksController with GetJwksUseCase', () => {
      const mockUseCase = { execute: jest.fn() };
      mockResolve.mockReturnValue(mockUseCase);

      const result = createJwksController(mockContainer);

      expect(presentation.JWksController).toHaveBeenCalledWith(mockUseCase);
      expect(result).toBeInstanceOf(presentation.JWksController);
    });
  });

  describe('createPkceVerifierService', () => {
    it('should create PkceVerifierService with Hash and Logger', () => {
      const mockHash = { sha256: jest.fn() };
      const mockLogger = { warn: jest.fn() };
      mockResolve.mockReturnValueOnce(mockHash).mockReturnValueOnce(mockLogger);

      const result = createPkceVerifierService(mockContainer);

      expect(presentation.PkceVerifierService).toHaveBeenCalledWith(mockHash, mockLogger);
      expect(result).toBeInstanceOf(presentation.PkceVerifierService);
    });
  });

  describe('createJwtService', () => {
    it('should create JwtService with issuer,audience,expiresInd , KeyProvider, and Logger', () => {
      const mockConfig = { oauth2Issuer: 'auth-service', jwtAudience: [], tokenExpiresIn: 900 };
      const mockKeyProvider = { getPrivateKey: jest.fn() };
      const mockLogger = { debug: jest.fn() };

      mockResolve.mockReturnValueOnce(mockConfig).mockReturnValueOnce(mockKeyProvider).mockReturnValueOnce(mockLogger);

      const result = createJwtService(mockContainer);

      expect(infrastructure.JwtService).toHaveBeenCalledWith('auth-service', 900, [], mockKeyProvider, mockLogger);
      expect(result).toBeInstanceOf(infrastructure.JwtService);
    });
  });

  describe('createJwksService', () => {
    it('should create JwksService with public key and key ID from KeyProvider', () => {
      const mockKeyProvider = {
        getPublicKey: jest.fn().mockReturnValue('public-key-pem'),
        getKeyId: jest.fn().mockReturnValue('kid-123'),
      };
      mockResolve.mockReturnValue(mockKeyProvider);

      const result = createJwksService(mockContainer);

      expect(mockKeyProvider.getPublicKey).toHaveBeenCalled();
      expect(mockKeyProvider.getKeyId).toHaveBeenCalled();
      expect(infrastructure.JwksService).toHaveBeenCalledWith('public-key-pem', 'kid-123');
      expect(result).toBeInstanceOf(infrastructure.JwksService);
    });
  });

  describe('createGetJwksUseCase', () => {
    it('should create GetJwksUseCase with JwksService', () => {
      const mockJwksService = { getJwks: jest.fn() };
      mockResolve.mockReturnValue(mockJwksService);

      const result = createGetJwksUseCase(mockContainer);

      expect(application.GetJwksUseCase).toHaveBeenCalledWith(mockJwksService);
      expect(result).toBeInstanceOf(application.GetJwksUseCase);
    });
  });
});
