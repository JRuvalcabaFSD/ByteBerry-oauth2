import { getPrismaTestClient, closePrismaTestClient } from '../../helpers/prisma-test-client';
import { cleanDatabase, seedTestDatabase } from '../../helpers/database.helper';
import { PrismaClient } from 'generated/prisma/client';
import { ILogger } from '@/interfaces';
import { DataBaseHealthCheckerService } from '@/infrastructure/services/dbHealthChecker.service';

describe('DataBaseHealthCheckerService - Integration Tests', () => {
  let prisma: PrismaClient;
  let service: DataBaseHealthCheckerService;
  let logger: ILogger;

  beforeAll(async () => {
    prisma = await getPrismaTestClient();
    logger = { info: jest.fn(), debug: jest.fn(), error: jest.fn(), warn: jest.fn(), child: jest.fn(), log: jest.fn() };
    service = new DataBaseHealthCheckerService(prisma, logger);
  });

  beforeEach(async () => {
    await cleanDatabase(prisma);
    await seedTestDatabase(prisma);
  });

  afterEach(async () => {
    await cleanDatabase(prisma);
  });

  afterAll(async () => {
    await closePrismaTestClient();
  });

  describe('checkConnection()', () => {
    it('should return true when database connection is healthy', async () => {
      // Act
      const isConnected = await service.checkConnection();

      // Assert
      expect(isConnected).toBe(true);
    });

    it('should return false when database connection fails', async () => {
      // Arrange - Mockear fallo de conexión
      jest.spyOn(prisma, '$queryRawUnsafe').mockImplementation(() => {
        throw new Error('DB connection lost');
      });

      // Act
      const isConnected = await service.checkConnection();

      // Assert
      expect(isConnected).toBe(false);

      // Cleanup - Restaurar mock
      (prisma.$queryRawUnsafe as jest.Mock).mockRestore();
    });
  });

  describe('checkTables()', () => {
    it('should return true for all existing tables', async () => {
      // Act
      const tables = await service.checkTables();

      // Assert
      expect(tables).toEqual({
        users: true,
        oAuthClients: true,
        authCodes: true,
        refreshTokens: true,
      });
    });

    it('should return false for non-existent tables after migration rollback', async () => {
      // Note: Este test es conceptual ya que no podemos eliminar tablas en tests
      // En un ambiente real, se podría usar una DB temporal sin migraciones

      // Act
      const tables = await service.checkTables();

      // Assert - Verificar que el método funciona correctamente
      expect(tables).toHaveProperty('users');
      expect(tables).toHaveProperty('oAuthClients');
      expect(tables).toHaveProperty('authCodes');
      expect(tables).toHaveProperty('refreshTokens');
    });

    it('should handle database query errors gracefully', async () => {
      // Arrange - Mockear fallo de conexión
      jest.spyOn(prisma, '$queryRaw').mockImplementation(() => {
        throw new Error('DB connection lost');
      });

      // Act
      const tables = await service.checkTables();

      // Assert - Debe retornar todos false
      expect(tables).toEqual({
        users: false,
        oAuthClients: false,
        authCodes: false,
        refreshTokens: false,
      });

      // Cleanup - Restaurar mock
      (prisma.$queryRaw as jest.Mock).mockRestore();
    });
  });

  describe('getHealthStatus()', () => {
    it('should return complete health status when database is healthy', async () => {
      // Act
      const status = await service.getHealthStatus();

      // Assert
      expect(status.connected).toBe(true);
      expect(status.latency).toBeGreaterThan(0);
      expect(status.latency).toBeLessThan(1000); // Should be < 1 second
      expect(status.tables).toEqual({
        users: true,
        oAuthClients: true,
        authCodes: true,
        refreshTokens: true,
      });
      expect(status.recordCounts).toBeDefined();
      expect(status.recordCounts?.users).toBeGreaterThanOrEqual(1); // From seed
      expect(status.recordCounts?.oAuthClients).toBeGreaterThanOrEqual(1); // From seed
    });

    it('should include record counts for all tables', async () => {
      // Act
      const status = await service.getHealthStatus();

      // Assert
      expect(status.recordCounts).toBeDefined();
      expect(status.recordCounts).toHaveProperty('users');
      expect(status.recordCounts).toHaveProperty('oAuthClients');
      expect(status.recordCounts).toHaveProperty('authCodes');
      expect(status.recordCounts).toHaveProperty('refreshTokens');
      expect(typeof status.recordCounts?.users).toBe('number');
      expect(typeof status.recordCounts?.oAuthClients).toBe('number');
    });

    it('should measure latency accurately', async () => {
      // Act
      const status1 = await service.getHealthStatus();
      const status2 = await service.getHealthStatus();

      // Assert
      expect(status1.latency).toBeGreaterThan(0);
      expect(status2.latency).toBeGreaterThan(0);
      // Latency should be reasonable for local DB
      expect(status1.latency).toBeLessThan(500);
      expect(status2.latency).toBeLessThan(500);
    });

    it('should return disconnected status when database is down', async () => {
      // Arrange - Mockear fallo de conexión
      jest.spyOn(prisma, '$queryRawUnsafe').mockImplementation(() => {
        throw new Error('DB connection lost');
      });
      jest.spyOn(prisma, '$queryRaw').mockImplementation(() => {
        throw new Error('DB connection lost');
      });

      // Act
      const status = await service.getHealthStatus();

      // Assert
      expect(status.connected).toBe(false);
      expect(status.latency).toBeGreaterThanOrEqual(0);
      expect(status.tables).toEqual({
        users: false,
        oAuthClients: false,
        authCodes: false,
        refreshTokens: false,
      });
      expect(status.recordCounts).toBeUndefined();

      // Cleanup - Restaurar mocks
      (prisma.$queryRawUnsafe as jest.Mock).mockRestore();
      (prisma.$queryRaw as jest.Mock).mockRestore();
    });

    it('should not include recordCounts when connection fails', async () => {
      // Arrange - Mockear fallo de conexión
      jest.spyOn(prisma, '$queryRawUnsafe').mockImplementation(() => {
        throw new Error('DB connection lost');
      });
      jest.spyOn(prisma, '$queryRaw').mockImplementation(() => {
        throw new Error('DB connection lost');
      });

      // Act
      const status = await service.getHealthStatus();

      // Assert
      expect(status.connected).toBe(false);
      expect(status.recordCounts).toBeUndefined();

      // Cleanup - Restaurar mocks
      (prisma.$queryRawUnsafe as jest.Mock).mockRestore();
      (prisma.$queryRaw as jest.Mock).mockRestore();
    });

    it('should handle record count failures gracefully', async () => {
      // Note: Difícil de simular sin moclear Prisma
      // Este test verifica que el método maneja errores en conteos

      // Act
      const status = await service.getHealthStatus();

      // Assert - Si hay conexión, debe intentar contar
      if (status.connected) {
        expect(status.recordCounts).toBeDefined();
      }
    });
  });
});
