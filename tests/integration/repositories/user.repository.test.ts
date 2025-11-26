/**
 * Integration Tests - UserRepository
 *
 * Tests de integración para el repositorio de usuarios con PostgreSQL real.
 *
 * @group integration
 * @group repositories
 */

import bcrypt from 'bcrypt';
import { UserMapper, UserRepository } from '@/infrastructure';
import { ILogger } from '@/interfaces';
import { PrismaClient } from 'generated/prisma/client';
import { cleanDatabase, getTotalRecordCount } from '../../helpers/database.helper';
import { createTestUser } from '../../helpers/fixtures.helper';
import { closePrismaTestClient, getPrismaTestClient } from '../../helpers/prisma-test-client';

describe('UserRepository - Integration Tests', () => {
  let prisma: PrismaClient;
  let repository: UserRepository;
  let mapper: UserMapper;
  let logger: ILogger;

  // Setup: Ejecutar ANTES de todos los tests de esta suite
  beforeAll(async () => {
    prisma = await getPrismaTestClient();

    // Crear dependencias reales
    mapper = new UserMapper();
    logger = {
      debug: jest.fn(),
      error: jest.fn(),
      info: jest.fn(),
      warn: jest.fn(),
      log: jest.fn(),
      child: jest.fn(() => logger), // Si child retorna un logger, puedes devolver el mismo mock
    }; // O mock si prefieres: { debug: jest.fn(), error: jest.fn(), ... }

    // Crear repositorio con las 3 dependencias
    repository = new UserRepository(mapper, prisma, logger);
  });

  // Cleanup: Ejecutar DESPUÉS de cada test
  afterEach(async () => {
    await cleanDatabase(prisma);
  });

  // Teardown: Ejecutar DESPUÉS de todos los tests
  afterAll(async () => {
    await closePrismaTestClient();
  });

  describe('register()', () => {
    it('should register a new user in the database', async () => {
      // Arrange
      const userEntity = await createTestUser({
        email: 'newuser@example.com',
        username: 'newuser',
        password: 'SecurePassword123!',
      });

      // Act
      await repository.register(userEntity);

      // Assert
      const savedUser = await prisma.user.findUnique({
        where: { email: 'newuser@example.com' },
      });

      expect(savedUser).toBeDefined();
      expect(savedUser?.email).toBe('newuser@example.com');
      expect(savedUser?.username).toBe('newuser');
      expect(savedUser?.password).toBeDefined();
      expect(savedUser?.createdAt).toBeInstanceOf(Date);
    });

    it('should throw error when registering user with duplicate email', async () => {
      // Arrange
      const user1 = await createTestUser({ email: 'duplicate@example.com' });
      await repository.register(user1);

      const user2 = await createTestUser({ email: 'duplicate@example.com' });

      // Act & Assert
      await expect(repository.register(user2)).rejects.toThrow();
    });

    it('should throw error when registering user with duplicate username', async () => {
      // Arrange
      const user1 = await createTestUser({ username: 'duplicateuser' });
      await repository.register(user1);

      const user2 = await createTestUser({ username: 'duplicateuser' });

      // Act & Assert
      await expect(repository.register(user2)).rejects.toThrow();
    });

    it('should hash password before saving', async () => {
      // Arrange
      const plainPassword = 'MyPlainPassword123!';
      const userEntity = await createTestUser({
        email: 'hashtest@example.com',
        password: plainPassword,
      });

      // Act
      await repository.register(userEntity);

      // Assert
      const savedUser = await prisma.user.findUnique({
        where: { email: 'hashtest@example.com' },
      });

      expect(savedUser?.password).toBeDefined();
      expect(savedUser?.password).not.toBe(plainPassword);

      // Verificar que el hash es válido
      const isValidHash = await bcrypt.compare(plainPassword, savedUser!.password!);
      expect(isValidHash).toBe(true);
    });
  });

  describe('findByEmail()', () => {
    it('should find user by email', async () => {
      // Arrange
      const userEntity = await createTestUser({ email: 'findme@example.com' });
      await repository.register(userEntity);

      // Act
      const foundUser = await repository.findByEmail('findme@example.com');

      // Assert
      expect(foundUser).toBeDefined();
      expect(foundUser?.email).toBe('findme@example.com');
      expect(foundUser?.id).toBe(userEntity.id);
    });

    it('should return null when user not found', async () => {
      // Act
      const foundUser = await repository.findByEmail('notfound@example.com');

      // Assert
      expect(foundUser).toBeNull();
    });

    it('should return UserEntity with correct domain properties', async () => {
      // Arrange
      const userEntity = await createTestUser({
        email: 'domain@example.com',
        username: 'domainuser',
      });
      await repository.register(userEntity);

      // Act
      const foundUser = await repository.findByEmail('domain@example.com');

      // Assert
      expect(foundUser).toBeInstanceOf(Object); // UserEntity
      expect(foundUser?.hasPassword()).toBe(true);
      expect(foundUser?.email).toBe('domain@example.com');
    });
  });

  describe('findById()', () => {
    it('should find user by ID', async () => {
      // Arrange
      const userEntity = await createTestUser();
      await repository.register(userEntity);

      // Act
      const foundUser = await repository.findById(userEntity.id);

      // Assert
      expect(foundUser).toBeDefined();
      expect(foundUser?.id).toBe(userEntity.id);
      expect(foundUser?.email).toBe(userEntity.email);
    });

    it('should return null when user ID not found', async () => {
      // Act
      const foundUser = await repository.findById('00000000-0000-0000-0000-000000000000');

      // Assert
      expect(foundUser).toBeNull();
    });
  });

  describe('authenticate()', () => {
    it('should authenticate user with correct password', async () => {
      // Arrange
      const plainPassword = 'CorrectPassword123!';
      const userEntity = await createTestUser({
        email: 'authuser@example.com',
        password: plainPassword,
      });
      await repository.register(userEntity);

      // Act
      const authenticatedUser = await repository.authenticate('authuser@example.com', plainPassword);

      // Assert
      expect(authenticatedUser).toBeDefined();
      expect(authenticatedUser?.email).toBe('authuser@example.com');
      expect(authenticatedUser?.id).toBe(userEntity.id);
    });

    it('should return null with incorrect password', async () => {
      // Arrange
      const correctPassword = 'CorrectPass123!';
      const wrongPassword = 'WrongPass123!';

      const userEntity = await createTestUser({
        email: 'authuser2@example.com',
        password: correctPassword,
      });
      await repository.register(userEntity);

      // Act
      const result = await repository.authenticate('authuser2@example.com', wrongPassword);

      // Assert
      expect(result).toBeNull();
    });

    it('should return null when user does not exist', async () => {
      // Act
      const result = await repository.authenticate('nonexistent@example.com', 'AnyPassword123!');

      // Assert
      expect(result).toBeNull();
    });

    it('should return null when user has no password (OAuth user)', async () => {
      // Arrange - Crear usuario sin password directamente en DB
      await prisma.user.create({
        data: {
          id: '00000000-0000-0000-0000-000000000099',
          email: 'oauthuser@example.com',
          username: 'oauthuser',
          password: null, // OAuth user sin password
        },
      });

      // Act
      const result = await repository.authenticate('oauthuser@example.com', 'AnyPassword');

      // Assert
      expect(result).toBeNull();
    });
  });

  describe('Error Handling', () => {
    it('should handle Prisma errors correctly', async () => {
      // Arrange
      const userEntity = await createTestUser({ email: 'error@example.com' });
      await repository.register(userEntity);

      // Intentar registrar el mismo usuario de nuevo
      const duplicateUser = await createTestUser({ email: 'error@example.com' });

      // Act & Assert
      await expect(repository.register(duplicateUser)).rejects.toThrow();
    });
  });

  describe('Edge Cases', () => {
    it('should handle multiple users with null usernames', async () => {
      // Arrange
      const user1 = await createTestUser({ username: null, email: 'user1@example.com' });
      const user2 = await createTestUser({ username: null, email: 'user2@example.com' });

      // Act
      await repository.register(user1);
      await repository.register(user2);

      // Assert
      const count = await prisma.user.count();
      expect(count).toBe(2);
    });

    it('should verify database is clean after each test', async () => {
      // Assert
      const totalRecords = await getTotalRecordCount(prisma);
      expect(totalRecords).toBe(0);
    });
  });
});
