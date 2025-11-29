import { OAuthClientEntity } from '@/domain';

describe('OAuthClientEntity', () => {
  describe('create()', () => {
    it('should create OAuth client with all fields', () => {
      // Arrange & Act
      const client = OAuthClientEntity.create({
        id: 'client-id-123',
        clientId: 'my-client',
        clientSecret: 'secret-123',
        clientName: 'My Client App',
        redirectUris: ['http://localhost:3000/callback'],
        grantTypes: ['authorization_code', 'refresh_token'],
        isPublic: false,
      });

      // Assert
      expect(client.id).toBe('client-id-123');
      expect(client.clientId).toBe('my-client');
      expect(client.clientSecret).toBe('secret-123');
      expect(client.clientName).toBe('My Client App');
      expect(client.redirectUris).toEqual(['http://localhost:3000/callback']);
      expect(client.grantTypes).toEqual(['authorization_code', 'refresh_token']);
      expect(client.isPublic).toBe(false);
      expect(client.createdAt).toBeInstanceOf(Date);
    });

    it('should create public client by default', () => {
      // Arrange & Act
      const client = OAuthClientEntity.create({
        id: 'client-id-123',
        clientId: 'my-client',
        clientName: 'My Client App',
        redirectUris: ['http://localhost:3000/callback'],
        grantTypes: ['authorization_code'],
      });

      // Assert
      expect(client.isPublic).toBe(true);
    });

    it('should set clientSecret to null if not provided', () => {
      // Arrange & Act
      const client = OAuthClientEntity.create({
        id: 'client-id-123',
        clientId: 'my-client',
        clientName: 'My Client App',
        redirectUris: ['http://localhost:3000/callback'],
        grantTypes: ['authorization_code'],
      });

      // Assert
      expect(client.clientSecret).toBeNull();
    });

    it('should use provided createdAt date', () => {
      // Arrange
      const customDate = new Date('2024-01-01');

      // Act
      const client = OAuthClientEntity.create({
        id: 'client-id-123',
        clientId: 'my-client',
        clientName: 'My Client App',
        redirectUris: ['http://localhost:3000/callback'],
        grantTypes: ['authorization_code'],
        createdAt: customDate,
      });

      // Assert
      expect(client.createdAt).toBe(customDate);
    });

    it('should support multiple redirect URIs', () => {
      // Arrange & Act
      const client = OAuthClientEntity.create({
        id: 'client-id-123',
        clientId: 'my-client',
        clientName: 'My Client App',
        redirectUris: ['http://localhost:3000/callback', 'http://localhost:3000/oauth/callback', 'https://example.com/callback'],
        grantTypes: ['authorization_code'],
      });

      // Assert
      expect(client.redirectUris).toHaveLength(3);
    });

    it('should support multiple grant types', () => {
      // Arrange & Act
      const client = OAuthClientEntity.create({
        id: 'client-id-123',
        clientId: 'my-client',
        clientName: 'My Client App',
        redirectUris: ['http://localhost:3000/callback'],
        grantTypes: ['authorization_code', 'refresh_token', 'client_credentials'],
      });

      // Assert
      expect(client.grantTypes).toHaveLength(3);
      expect(client.grantTypes).toContain('authorization_code');
      expect(client.grantTypes).toContain('refresh_token');
      expect(client.grantTypes).toContain('client_credentials');
    });
  });

  describe('isValidRedirectUri()', () => {
    it('should return true for valid redirect URI', () => {
      // Arrange
      const client = OAuthClientEntity.create({
        id: 'client-id-123',
        clientId: 'my-client',
        clientName: 'My Client App',
        redirectUris: ['http://localhost:3000/callback', 'https://example.com/oauth'],
        grantTypes: ['authorization_code'],
      });

      // Act & Assert
      expect(client.isValidRedirectUri('http://localhost:3000/callback')).toBe(true);
      expect(client.isValidRedirectUri('https://example.com/oauth')).toBe(true);
    });

    it('should return false for invalid redirect URI', () => {
      // Arrange
      const client = OAuthClientEntity.create({
        id: 'client-id-123',
        clientId: 'my-client',
        clientName: 'My Client App',
        redirectUris: ['http://localhost:3000/callback'],
        grantTypes: ['authorization_code'],
      });

      // Act & Assert
      expect(client.isValidRedirectUri('http://malicious.com/callback')).toBe(false);
      expect(client.isValidRedirectUri('https://example.com/oauth')).toBe(false);
    });

    it('should be case-sensitive', () => {
      // Arrange
      const client = OAuthClientEntity.create({
        id: 'client-id-123',
        clientId: 'my-client',
        clientName: 'My Client App',
        redirectUris: ['http://localhost:3000/callback'],
        grantTypes: ['authorization_code'],
      });

      // Act & Assert
      expect(client.isValidRedirectUri('http://localhost:3000/Callback')).toBe(false);
      expect(client.isValidRedirectUri('HTTP://localhost:3000/callback')).toBe(false);
    });
  });

  describe('supportsGrantType()', () => {
    it('should return true for supported grant type', () => {
      // Arrange
      const client = OAuthClientEntity.create({
        id: 'client-id-123',
        clientId: 'my-client',
        clientName: 'My Client App',
        redirectUris: ['http://localhost:3000/callback'],
        grantTypes: ['authorization_code', 'refresh_token'],
      });

      // Act & Assert
      expect(client.supportsGrantType('authorization_code')).toBe(true);
      expect(client.supportsGrantType('refresh_token')).toBe(true);
    });

    it('should return false for unsupported grant type', () => {
      // Arrange
      const client = OAuthClientEntity.create({
        id: 'client-id-123',
        clientId: 'my-client',
        clientName: 'My Client App',
        redirectUris: ['http://localhost:3000/callback'],
        grantTypes: ['authorization_code'],
      });

      // Act & Assert
      expect(client.supportsGrantType('client_credentials')).toBe(false);
      expect(client.supportsGrantType('password')).toBe(false);
    });

    it('should be case-sensitive', () => {
      // Arrange
      const client = OAuthClientEntity.create({
        id: 'client-id-123',
        clientId: 'my-client',
        clientName: 'My Client App',
        redirectUris: ['http://localhost:3000/callback'],
        grantTypes: ['authorization_code'],
      });

      // Act & Assert
      expect(client.supportsGrantType('Authorization_Code')).toBe(false);
      expect(client.supportsGrantType('AUTHORIZATION_CODE')).toBe(false);
    });
  });
});
