/**
 * Integration Tests - DatabaseAuthorizationCodeRepository
 *
 * Tests de integración para el repositorio de códigos de autorización con PostgreSQL real.
 *
 * @group integration
 * @group repositories
 */

import { AuthorizationCodeEntity, ClientId, CodeChallenge } from '@/domain';
import { AuthCodeMapper, DatabaseAuthorizationCodeRepository } from '@/infrastructure';
import { ILogger } from '@/interfaces';
import { PrismaClient } from 'generated/prisma/client';
import { cleanDatabase, seedTestDatabase } from '../../helpers/database.helper';
import { generateTestPKCEVerifier, generateTestPKCEChallenge } from '../../helpers/fixtures.helper';
import { getPrismaTestClient, closePrismaTestClient } from '../../helpers/prisma-test-client';

describe('DatabaseAuthorizationCodeRepository - Integration Tests', () => {
  let prisma: PrismaClient;
  let repository: DatabaseAuthorizationCodeRepository;
  let mapper: AuthCodeMapper;
  let logger: ILogger;
  let testClientId: string;
  let testUserId: string;

  beforeAll(async () => {
    prisma = await getPrismaTestClient();

    // Crear dependencias reales
    mapper = new AuthCodeMapper();
    logger = {
      debug: jest.fn(),
      error: jest.fn(),
      info: jest.fn(),
      warn: jest.fn(),
      log: jest.fn(),
      child: jest.fn(() => logger), // Si child retorna un logger, puedes devolver el mismo mock
    };

    // Crear repositorio con las 3 dependencias (mapper, dbClient, logger)
    repository = new DatabaseAuthorizationCodeRepository(mapper, prisma, logger);
  });

  beforeEach(async () => {
    // Limpiar DB antes de cada test
    await cleanDatabase(prisma);

    // Crear cliente OAuth2 y usuario para las foreign keys
    const { testClient, testUser } = await seedTestDatabase(prisma);
    testClientId = testClient.clientId;
    testUserId = testUser.id;
  });

  afterEach(async () => {
    await cleanDatabase(prisma);
  });

  afterAll(async () => {
    await closePrismaTestClient();
  });

  // Helper para crear AuthorizationCodeEntity usando Value Objects
  async function createTestAuthCode(
    options: {
      code?: string | undefined;
      clientId?: string | undefined;
      userId?: string | undefined;
      redirectUri?: string | undefined;
      scope?: string | undefined;
      codeChallenge?: string | undefined;
      codeChallengeMethod?: 'S256' | 'plain' | undefined;
      expirationMinutes?: number | undefined;
      state?: string | undefined;
    } = {}
  ): Promise<AuthorizationCodeEntity> {
    const {
      code = `TEST_CODE_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`,
      clientId = testClientId,
      userId = testUserId,
      redirectUri = 'http://localhost:3000/callback',
      scope = 'read write',
      codeChallenge: challengeString,
      codeChallengeMethod = 'S256',
      expirationMinutes = 10,
      state = undefined,
    } = options;

    // Generar PKCE challenge si no se proporciona
    let challenge: string;
    if (!challengeString) {
      const verifier = generateTestPKCEVerifier();
      challenge = await generateTestPKCEChallenge(verifier);
    } else {
      challenge = challengeString;
    }

    return AuthorizationCodeEntity.create({
      code,
      userId,
      clientId: ClientId.create(clientId),
      redirectUri,
      codeChallenge: CodeChallenge.create(challenge, codeChallengeMethod),
      expirationMinutes,
      scope,
      state,
    });
  }

  describe('save()', () => {
    it('should save authorization code with PKCE challenge', async () => {
      // Arrange
      const verifier = generateTestPKCEVerifier();
      const challenge = await generateTestPKCEChallenge(verifier);

      const codeEntity = await createTestAuthCode({
        code: 'TEST_AUTH_CODE_123',
        codeChallenge: challenge,
        codeChallengeMethod: 'S256',
      });

      // Act
      await repository.save(codeEntity);

      // Assert
      const savedCode = await prisma.authCode.findUnique({
        where: { code: 'TEST_AUTH_CODE_123' },
      });

      expect(savedCode).toBeDefined();
      expect(savedCode?.codeChallenge).toBe(challenge);
      expect(savedCode?.codeChallengeMethod).toBe('S256');
      expect(savedCode?.used).toBe(false);
      expect(savedCode?.clientId).toBe(testClientId);
    });

    it('should save code with expiration time', async () => {
      // Arrange
      const codeEntity = await createTestAuthCode({
        expirationMinutes: 15,
      });

      // Act
      await repository.save(codeEntity);

      // Assert
      const savedCode = await prisma.authCode.findUnique({
        where: { code: codeEntity.code },
      });

      expect(savedCode?.expiresAt).toBeDefined();
      expect(savedCode?.expiresAt.getTime()).toBeGreaterThan(Date.now());
    });

    it('should save code with scopes array from string', async () => {
      // Arrange
      const codeEntity = await createTestAuthCode({
        scope: 'read write admin',
      });

      // Act
      await repository.save(codeEntity);

      // Assert
      const savedCode = await prisma.authCode.findUnique({
        where: { code: codeEntity.code },
      });

      expect(savedCode?.scopes).toEqual(['read', 'write', 'admin']);
    });

    it('should save code with state parameter', async () => {
      // Arrange
      const codeEntity = await createTestAuthCode({
        state: 'random-state-string-123',
      });

      // Act
      await repository.save(codeEntity);

      // Assert
      const savedCode = await prisma.authCode.findUnique({
        where: { code: codeEntity.code },
      });

      expect(savedCode?.state).toBe('random-state-string-123');
    });

    it('should upsert when code already exists and mark as used', async () => {
      // Arrange
      const codeEntity = await createTestAuthCode({ code: 'UPSERT_CODE' });
      await repository.save(codeEntity);

      // Verificar que existe y no está usado
      let savedCode = await prisma.authCode.findUnique({
        where: { code: 'UPSERT_CODE' },
      });
      expect(savedCode?.used).toBe(false);

      // Act - Guardar de nuevo
      await repository.save(codeEntity);

      // Assert - Debe estar marcado como usado
      savedCode = await prisma.authCode.findUnique({
        where: { code: 'UPSERT_CODE' },
      });
      expect(savedCode?.used).toBe(true);
    });
  });

  describe('findByCode()', () => {
    it('should find authorization code by code string', async () => {
      // Arrange
      const codeEntity = await createTestAuthCode({
        code: 'FINDME_CODE',
      });
      await repository.save(codeEntity);

      // Act
      const foundCode = await repository.findByCode('FINDME_CODE');

      // Assert
      expect(foundCode).toBeDefined();
      expect(foundCode?.code).toBe('FINDME_CODE');
      expect(foundCode?.clientId.getValue()).toBe(testClientId);
      expect(foundCode?.userId).toBe(testUserId);
    });

    it('should return null when code not found', async () => {
      // Act
      const foundCode = await repository.findByCode('NON_EXISTENT_CODE');

      // Assert
      expect(foundCode).toBeNull();
    });

    it('should map code with all properties correctly including Value Objects', async () => {
      // Arrange
      const verifier = generateTestPKCEVerifier();
      const challenge = await generateTestPKCEChallenge(verifier);

      const codeEntity = await createTestAuthCode({
        codeChallenge: challenge,
        codeChallengeMethod: 'S256',
        scope: 'read write',
        state: 'test-state',
      });
      await repository.save(codeEntity);

      // Act
      const foundCode = await repository.findByCode(codeEntity.code);

      // Assert
      expect(foundCode).toBeDefined();
      expect(foundCode?.codeChallenge.getChallenge()).toBe(challenge);
      expect(foundCode?.codeChallenge.getMethod()).toBe('S256');
      expect(foundCode?.scope).toBe('read write');
      expect(foundCode?.state).toBe('test-state');
    });

    it('should find expired code (expiration validation is in use case)', async () => {
      // Arrange - Crear código que expira en el pasado
      const codeEntity = await createTestAuthCode({
        expirationMinutes: -10, // Ya expiró hace 10 minutos
      });
      await repository.save(codeEntity);

      // Act
      const foundCode = await repository.findByCode(codeEntity.code);

      // Assert
      expect(foundCode).toBeDefined();
      expect(foundCode?.expiresAt.getTime()).toBeLessThan(Date.now());
    });

    it('should restore used status correctly', async () => {
      // Arrange
      const codeEntity = await createTestAuthCode({ code: 'USED_CODE' });

      // Guardar y luego guardar de nuevo para marcarlo como usado
      await repository.save(codeEntity);
      await repository.save(codeEntity); // Segundo save lo marca como usado

      // Act
      const foundCode = await repository.findByCode('USED_CODE');

      // Assert
      expect(foundCode).toBeDefined();
      expect(foundCode?.isUsed()).toBe(true);
    });

    it('should restore ClientId Value Object correctly', async () => {
      // Arrange
      const codeEntity = await createTestAuthCode();
      await repository.save(codeEntity);

      // Act
      const foundCode = await repository.findByCode(codeEntity.code);

      // Assert
      expect(foundCode?.clientId).toBeDefined();
      expect(foundCode?.clientId.getValue()).toBe(testClientId);
      expect(typeof foundCode?.clientId.getValue).toBe('function');
    });
  });

  describe('cleanup()', () => {
    it('should delete expired authorization codes', async () => {
      // Arrange - Crear código expirado
      const expiredCode = await createTestAuthCode({
        code: 'EXPIRED_CODE',
        expirationMinutes: -10, // Expiró hace 10 minutos
      });
      await repository.save(expiredCode);

      // Crear código válido
      const validCode = await createTestAuthCode({
        code: 'VALID_CODE',
        expirationMinutes: 10, // Expira en 10 minutos
      });
      await repository.save(validCode);

      // Act
      await repository.cleanup();

      // Assert
      const foundExpired = await repository.findByCode('EXPIRED_CODE');
      const foundValid = await repository.findByCode('VALID_CODE');

      expect(foundExpired).toBeNull();
      expect(foundValid).toBeDefined();
    });

    it('should not throw error when no expired codes exist', async () => {
      // Arrange - Solo códigos válidos
      const validCode = await createTestAuthCode({
        expirationMinutes: 10,
      });
      await repository.save(validCode);

      // Act & Assert
      await expect(repository.cleanup()).resolves.not.toThrow();
    });

    it('should delete multiple expired codes at once', async () => {
      // Arrange
      const expired1 = await createTestAuthCode({
        code: 'EXPIRED_1',
        expirationMinutes: -5,
      });
      const expired2 = await createTestAuthCode({
        code: 'EXPIRED_2',
        expirationMinutes: -10,
      });
      const expired3 = await createTestAuthCode({
        code: 'EXPIRED_3',
        expirationMinutes: -15,
      });

      await repository.save(expired1);
      await repository.save(expired2);
      await repository.save(expired3);

      // Act
      await repository.cleanup();

      // Assert
      const count = await prisma.authCode.count();
      expect(count).toBe(0);
    });
  });

  describe('PKCE Validation', () => {
    it('should store and retrieve PKCE challenge with Value Object', async () => {
      // Arrange
      const verifier = generateTestPKCEVerifier();
      const challenge = await generateTestPKCEChallenge(verifier);

      const codeEntity = await createTestAuthCode({
        codeChallenge: challenge,
        codeChallengeMethod: 'S256',
      });

      // Act
      await repository.save(codeEntity);
      const foundCode = await repository.findByCode(codeEntity.code);

      // Assert
      expect(foundCode?.codeChallenge.getChallenge()).toBe(challenge);
      expect(foundCode?.codeChallenge.getMethod()).toBe('S256');

      // Verificar que el Value Object tiene los métodos esperados
      expect(typeof foundCode?.codeChallenge.getChallenge).toBe('function');
      expect(typeof foundCode?.codeChallenge.getMethod).toBe('function');
    });

    it('should handle plain method PKCE', async () => {
      // Arrange - ✅ CORREGIDO: Generar challenge válido SOLO con caracteres base64url
      // El Value Object valida: /^[A-Za-z0-9_-]+$/
      const plainChallenge = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_-'; // 64 caracteres válidos

      const codeEntity = await createTestAuthCode({
        codeChallenge: plainChallenge,
        codeChallengeMethod: 'plain',
      });

      // Act
      await repository.save(codeEntity);
      const foundCode = await repository.findByCode(codeEntity.code);

      // Assert
      expect(foundCode?.codeChallenge.getMethod()).toBe('plain');
      expect(foundCode?.codeChallenge.getChallenge()).toBe(plainChallenge);
    });
  });

  describe('Foreign Key Constraints', () => {
    it('should cascade delete when client is deleted', async () => {
      // Arrange
      const codeEntity = await createTestAuthCode();
      await repository.save(codeEntity);

      // Act - Eliminar el cliente
      await prisma.oAuthClient.delete({
        where: { clientId: testClientId },
      });

      // Assert - El código debe haber sido eliminado también
      const foundCode = await repository.findByCode(codeEntity.code);
      expect(foundCode).toBeNull();
    });
  });

  describe('Edge Cases', () => {
    it('should handle multiple codes for same client', async () => {
      // Arrange & Act
      const code1 = await createTestAuthCode({ code: 'CODE_1' });
      const code2 = await createTestAuthCode({ code: 'CODE_2' });

      await repository.save(code1);
      await repository.save(code2);

      // Assert
      const found1 = await repository.findByCode('CODE_1');
      const found2 = await repository.findByCode('CODE_2');

      expect(found1).toBeDefined();
      expect(found2).toBeDefined();
      expect(found1?.clientId.getValue()).toBe(testClientId);
      expect(found2?.clientId.getValue()).toBe(testClientId);
    });

    it('should handle empty scope string', async () => {
      // Arrange
      const codeEntity = await createTestAuthCode({
        scope: '',
      });

      // Act
      await repository.save(codeEntity);

      // Assert
      const savedCode = await prisma.authCode.findUnique({
        where: { code: codeEntity.code },
      });

      // ✅ CORREGIDO: ''.split(' ') retorna [''], no []
      expect(savedCode?.scopes).toEqual(['']);
    });

    it('should handle very long redirect URIs', async () => {
      // Arrange
      const longUri = 'http://localhost:3000/callback?' + 'param=value&'.repeat(50);
      const codeEntity = await createTestAuthCode({
        redirectUri: longUri,
      });

      // Act
      await repository.save(codeEntity);

      // Assert
      const foundCode = await repository.findByCode(codeEntity.code);
      expect(foundCode?.redirectUri).toBe(longUri);
    });

    it('should handle codes without state', async () => {
      // Arrange
      const codeEntity = await createTestAuthCode({
        state: undefined,
      });

      // Act
      await repository.save(codeEntity);

      // Assert
      const foundCode = await repository.findByCode(codeEntity.code);
      expect(foundCode?.state).toBeUndefined();
    });
  });
});
