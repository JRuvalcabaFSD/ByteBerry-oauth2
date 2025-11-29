/**
 * Integration Tests - OAuthClientRepository
 *
 * Tests de integración para el repositorio de clientes OAuth2 con PostgreSQL real.
 *
 * @group integration
 * @group repositories
 */

import { getPrismaTestClient, closePrismaTestClient } from '../../helpers/prisma-test-client';
import { cleanDatabase } from '../../helpers/database.helper';
import { PrismaClient } from 'generated/prisma/client.js';
import { OAuthClientRepository } from '@/infrastructure';
import { ILogger } from '@/interfaces/index.js';

describe('OAuthClientRepository - Integration Tests', () => {
  let prisma: PrismaClient;
  let repository: OAuthClientRepository;
  let logger: ILogger;

  beforeAll(async () => {
    prisma = await getPrismaTestClient();
    logger = { info: jest.fn(), debug: jest.fn(), error: jest.fn(), warn: jest.fn(), child: jest.fn(), log: jest.fn() };
    repository = new OAuthClientRepository(prisma, logger);
  });

  beforeEach(async () => {
    await cleanDatabase(prisma);
  });

  afterEach(async () => {
    await cleanDatabase(prisma);
  });

  afterAll(async () => {
    await closePrismaTestClient();
  });

  describe('findByClientId()', () => {
    it('should find OAuth client by clientId', async () => {
      // Arrange - Crear cliente directamente en DB
      await prisma.oAuthClient.create({
        data: {
          clientId: 'test-client-123',
          clientSecret: 'secret-abc',
          clientName: 'Test Application',
          redirectUris: ['http://localhost:3000/callback'],
          grantTypes: ['authorization_code', 'refresh_token'],
          isPublic: false,
        },
      });

      // Act
      const client = await repository.findByClientId('test-client-123');

      // Assert
      expect(client).toBeDefined();
      expect(client?.clientId).toBe('test-client-123');
      expect(client?.clientName).toBe('Test Application');
      expect(client?.clientSecret).toBe('secret-abc');
      expect(client?.isPublic).toBe(false);
      expect(client?.redirectUris).toEqual(['http://localhost:3000/callback']);
      expect(client?.grantTypes).toEqual(['authorization_code', 'refresh_token']);
    });

    it('should return null when client not found', async () => {
      // Act
      const client = await repository.findByClientId('non-existent-client');

      // Assert
      expect(client).toBeNull();
    });

    it('should return OAuthClientEntity with correct domain properties', async () => {
      // Arrange
      await prisma.oAuthClient.create({
        data: {
          clientId: 'domain-client',
          clientSecret: null,
          clientName: 'Domain Test',
          redirectUris: ['http://localhost:3000/callback', 'http://localhost:3000/oauth'],
          grantTypes: ['authorization_code'],
          isPublic: true,
        },
      });

      // Act
      const client = await repository.findByClientId('domain-client');

      // Assert
      expect(client).toBeDefined();
      expect(typeof client?.isValidRedirectUri).toBe('function');
      expect(typeof client?.supportsGrantType).toBe('function');
      expect(client?.isValidRedirectUri('http://localhost:3000/callback')).toBe(true);
      expect(client?.isValidRedirectUri('http://malicious.com')).toBe(false);
      expect(client?.supportsGrantType('authorization_code')).toBe(true);
      expect(client?.supportsGrantType('client_credentials')).toBe(false);
    });

    it('should handle public clients without secret', async () => {
      // Arrange
      await prisma.oAuthClient.create({
        data: {
          clientId: 'public-client',
          clientSecret: null,
          clientName: 'Public App',
          redirectUris: ['http://localhost:3000/callback'],
          grantTypes: ['authorization_code'],
          isPublic: true,
        },
      });

      // Act
      const client = await repository.findByClientId('public-client');

      // Assert
      expect(client).toBeDefined();
      expect(client?.clientSecret).toBeNull();
      expect(client?.isPublic).toBe(true);
    });

    it('should handle confidential clients with secret', async () => {
      // Arrange
      await prisma.oAuthClient.create({
        data: {
          clientId: 'confidential-client',
          clientSecret: 'very-secret-key',
          clientName: 'Confidential App',
          redirectUris: ['https://example.com/callback'],
          grantTypes: ['authorization_code', 'client_credentials'],
          isPublic: false,
        },
      });

      // Act
      const client = await repository.findByClientId('confidential-client');

      // Assert
      expect(client).toBeDefined();
      expect(client?.clientSecret).toBe('very-secret-key');
      expect(client?.isPublic).toBe(false);
    });

    it('should return createdAt as Date object', async () => {
      // Arrange
      const createdDate = new Date('2024-01-01T00:00:00Z');
      await prisma.oAuthClient.create({
        data: {
          clientId: 'date-test-client',
          clientName: 'Date Test',
          redirectUris: ['http://localhost:3000/callback'],
          grantTypes: ['authorization_code'],
          createdAt: createdDate,
        },
      });

      // Act
      const client = await repository.findByClientId('date-test-client');

      // Assert
      expect(client).toBeDefined();
      expect(client?.createdAt).toBeInstanceOf(Date);
      expect(client?.createdAt.toISOString()).toBe(createdDate.toISOString());
    });

    it('should handle multiple redirect URIs', async () => {
      // Arrange
      await prisma.oAuthClient.create({
        data: {
          clientId: 'multi-uri-client',
          clientName: 'Multi URI Client',
          redirectUris: [
            'http://localhost:3000/callback',
            'http://localhost:3000/oauth',
            'https://example.com/callback',
            'https://example.com/oauth',
          ],
          grantTypes: ['authorization_code'],
        },
      });

      // Act
      const client = await repository.findByClientId('multi-uri-client');

      // Assert
      expect(client?.redirectUris).toHaveLength(4);
      expect(client?.isValidRedirectUri('http://localhost:3000/callback')).toBe(true);
      expect(client?.isValidRedirectUri('https://example.com/oauth')).toBe(true);
      expect(client?.isValidRedirectUri('http://malicious.com')).toBe(false);
    });

    it('should handle multiple grant types', async () => {
      // Arrange
      await prisma.oAuthClient.create({
        data: {
          clientId: 'multi-grant-client',
          clientName: 'Multi Grant Client',
          redirectUris: ['http://localhost:3000/callback'],
          grantTypes: ['authorization_code', 'refresh_token', 'client_credentials'],
        },
      });

      // Act
      const client = await repository.findByClientId('multi-grant-client');

      // Assert
      expect(client?.grantTypes).toHaveLength(3);
      expect(client?.supportsGrantType('authorization_code')).toBe(true);
      expect(client?.supportsGrantType('refresh_token')).toBe(true);
      expect(client?.supportsGrantType('client_credentials')).toBe(true);
      expect(client?.supportsGrantType('password')).toBe(false);
    });
  });

  describe('Error Handling', () => {
    it('should throw handled Prisma error on database failure', async () => {
      // Arrange - Desconectar Prisma temporalmente
      await prisma.$disconnect();

      // Act & Assert
      await expect(repository.findByClientId('test-client')).resolves.toBeNull();

      // Cleanup - Reconectar
      await prisma.$connect();
    });
  });
});
