import { ValidateClientUseCase } from '@/application';
import { OAuthClientEntity } from '@/domain';
import { IOAuthClientRepository, ILogger } from '@/interfaces';
import { InvalidRequestError, UnauthorizedClientError } from '@/shared';

describe('ValidateClientUseCase', () => {
  let useCase: ValidateClientUseCase;
  let mockRepository: jest.Mocked<IOAuthClientRepository>;
  let mockLogger: jest.Mocked<ILogger>;

  beforeEach(() => {
    // Mock repository
    mockRepository = {
      findByClientId: jest.fn(),
    };

    // Mock logger
    mockLogger = {
      debug: jest.fn(),
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
    } as any;

    useCase = new ValidateClientUseCase(mockRepository, mockLogger);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute()', () => {
    it('should validate client successfully with minimal request', async () => {
      // Arrange
      const request = {
        clientId: 'test-client-123',
      };

      const mockClient = OAuthClientEntity.create({
        id: 'client-db-id',
        clientId: 'test-client-123',
        clientName: 'Test Client',
        redirectUris: ['http://localhost:3000/callback'],
        grantTypes: ['authorization_code', 'refresh_token'],
        isPublic: false,
      });

      mockRepository.findByClientId.mockResolvedValue(mockClient);

      // Act
      const result = await useCase.execute(request);

      // Assert
      expect(result).toEqual({
        clientId: 'test-client-123',
        clientName: 'Test Client',
        isPublic: false,
        redirectUris: ['http://localhost:3000/callback'],
        grandTypes: ['authorization_code', 'refresh_token'],
      });
      expect(mockRepository.findByClientId).toHaveBeenCalledWith('test-client-123');
      expect(mockLogger.debug).toHaveBeenCalledWith('Validating OAuth2 client', { clientId: 'test-client-123' });
      expect(mockLogger.debug).toHaveBeenCalledWith('Client validated successfully', {
        clientId: 'test-client-123',
        clientName: 'Test Client',
      });
    });

    it('should validate client with redirectUri', async () => {
      // Arrange
      const request = {
        clientId: 'test-client-123',
        redirectUri: 'http://localhost:3000/callback',
      };

      const mockClient = OAuthClientEntity.create({
        id: 'client-db-id',
        clientId: 'test-client-123',
        clientName: 'Test Client',
        redirectUris: ['http://localhost:3000/callback', 'http://localhost:3000/oauth'],
        grantTypes: ['authorization_code'],
      });

      mockRepository.findByClientId.mockResolvedValue(mockClient);

      // Act
      const result = await useCase.execute(request);

      // Assert
      expect(result).toBeDefined();
      expect(mockLogger.warn).not.toHaveBeenCalled();
    });

    it('should validate client with grantType', async () => {
      // Arrange
      const request = {
        clientId: 'test-client-123',
        grandType: 'authorization_code',
      };

      const mockClient = OAuthClientEntity.create({
        id: 'client-db-id',
        clientId: 'test-client-123',
        clientName: 'Test Client',
        redirectUris: ['http://localhost:3000/callback'],
        grantTypes: ['authorization_code', 'refresh_token'],
      });

      mockRepository.findByClientId.mockResolvedValue(mockClient);

      // Act
      const result = await useCase.execute(request);

      // Assert
      expect(result).toBeDefined();
      expect(mockLogger.warn).not.toHaveBeenCalled();
    });

    it('should throw InvalidRequestError when clientId is missing', async () => {
      // Arrange
      const request = {
        clientId: '',
      };

      // Act & Assert
      await expect(useCase.execute(request)).rejects.toThrow(InvalidRequestError);
      await expect(useCase.execute(request)).rejects.toThrow('Client ID is required');
      expect(mockRepository.findByClientId).not.toHaveBeenCalled();
    });

    it('should throw UnauthorizedClientError when client not found', async () => {
      // Arrange
      const request = {
        clientId: 'non-existent-client',
      };

      mockRepository.findByClientId.mockResolvedValue(null);

      // Act & Assert
      await expect(useCase.execute(request)).rejects.toThrow(UnauthorizedClientError);
      await expect(useCase.execute(request)).rejects.toThrow('invalid client');
      expect(mockRepository.findByClientId).toHaveBeenCalledWith('non-existent-client');
      expect(mockLogger.warn).toHaveBeenCalledWith('Client not found', { clientId: 'non-existent-client' });
    });

    it('should throw InvalidRequestError when redirectUri is invalid', async () => {
      // Arrange
      const request = {
        clientId: 'test-client-123',
        redirectUri: 'http://malicious.com/callback',
      };

      const mockClient = OAuthClientEntity.create({
        id: 'client-db-id',
        clientId: 'test-client-123',
        clientName: 'Test Client',
        redirectUris: ['http://localhost:3000/callback'],
        grantTypes: ['authorization_code'],
      });

      mockRepository.findByClientId.mockResolvedValue(mockClient);

      // Act & Assert
      await expect(useCase.execute(request)).rejects.toThrow(InvalidRequestError);
      await expect(useCase.execute(request)).rejects.toThrow('Invalid redirect_uri');
      expect(mockLogger.warn).toHaveBeenCalledWith('Invalid redirect URI', {
        clientId: 'test-client-123',
        redirectUri: 'http://malicious.com/callback',
      });
    });

    it('should throw InvalidRequestError when grantType is unsupported', async () => {
      // Arrange
      const request = {
        clientId: 'test-client-123',
        grandType: 'client_credentials',
      };

      const mockClient = OAuthClientEntity.create({
        id: 'client-db-id',
        clientId: 'test-client-123',
        clientName: 'Test Client',
        redirectUris: ['http://localhost:3000/callback'],
        grantTypes: ['authorization_code'],
      });

      mockRepository.findByClientId.mockResolvedValue(mockClient);

      // Act & Assert
      await expect(useCase.execute(request)).rejects.toThrow(InvalidRequestError);
      await expect(useCase.execute(request)).rejects.toThrow('Unsupported grant type');
      expect(mockLogger.warn).toHaveBeenCalledWith('Unsupported grant type', {
        clientId: 'test-client-123',
        grandType: 'client_credentials',
      });
    });

    it('should validate public client', async () => {
      // Arrange
      const request = {
        clientId: 'public-client-123',
      };

      const mockClient = OAuthClientEntity.create({
        id: 'client-db-id',
        clientId: 'public-client-123',
        clientName: 'Public Client',
        redirectUris: ['http://localhost:3000/callback'],
        grantTypes: ['authorization_code'],
        isPublic: true,
      });

      mockRepository.findByClientId.mockResolvedValue(mockClient);

      // Act
      const result = await useCase.execute(request);

      // Assert
      expect(result.isPublic).toBe(true);
    });

    it('should validate client with multiple redirect URIs', async () => {
      // Arrange
      const request = {
        clientId: 'test-client-123',
        redirectUri: 'http://localhost:3000/oauth',
      };

      const mockClient = OAuthClientEntity.create({
        id: 'client-db-id',
        clientId: 'test-client-123',
        clientName: 'Test Client',
        redirectUris: ['http://localhost:3000/callback', 'http://localhost:3000/oauth', 'https://example.com/callback'],
        grantTypes: ['authorization_code'],
      });

      mockRepository.findByClientId.mockResolvedValue(mockClient);

      // Act
      const result = await useCase.execute(request);

      // Assert
      expect(result.redirectUris).toHaveLength(3);
      expect(result.redirectUris).toContain('http://localhost:3000/oauth');
    });

    it('should log error and rethrow when repository throws unexpected error', async () => {
      // Arrange
      const request = {
        clientId: 'test-client-123',
      };

      const unexpectedError = new Error('Database connection failed');
      mockRepository.findByClientId.mockRejectedValue(unexpectedError);

      // Act & Assert
      await expect(useCase.execute(request)).rejects.toThrow('Database connection failed');
      expect(mockLogger.error).toHaveBeenCalledWith('Unexpected error validating client', {
        error: 'Database connection failed',
        clientId: 'test-client-123',
      });
    });

    it('should not log error when throwing InvalidRequestError or UnauthorizedClientError', async () => {
      // Arrange - Invalid redirect URI
      const request1 = {
        clientId: 'test-client-123',
        redirectUri: 'http://malicious.com/callback',
      };

      const mockClient = OAuthClientEntity.create({
        id: 'client-db-id',
        clientId: 'test-client-123',
        clientName: 'Test Client',
        redirectUris: ['http://localhost:3000/callback'],
        grantTypes: ['authorization_code'],
      });

      mockRepository.findByClientId.mockResolvedValue(mockClient);

      // Act & Assert
      await expect(useCase.execute(request1)).rejects.toThrow(InvalidRequestError);
      expect(mockLogger.error).not.toHaveBeenCalled();
    });
  });
});
