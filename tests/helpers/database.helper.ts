/**
 * Database Helper - Utilidades para setup/teardown de tests de integración
 *
 * Proporciona funciones para:
 * - Limpiar la base de datos entre tests
 * - Ejecutar migraciones
 * - Verificar conectividad
 * - Resetear sequences y IDs
 *
 * @module helpers/database-helper
 */

import { PrismaClient } from 'generated/prisma/client.js';
import { getPrismaTestClient } from './prisma-test-client';

/**
 * Limpia todas las tablas de la base de datos
 *
 * Elimina todos los datos de todas las tablas en orden correcto
 * para respetar foreign keys.
 *
 * ⚠️  ADVERTENCIA: Esta función ELIMINA TODOS LOS DATOS
 *
 * @param {PrismaClient} [prisma] - Cliente Prisma opcional (usa singleton si no se provee)
 *
 * @example
 * ```typescript
 * afterEach(async () => {
 *   await cleanDatabase();
 * });
 * ```
 */
export async function cleanDatabase(prisma?: PrismaClient): Promise<void> {
  const client = prisma || (await getPrismaTestClient());

  // Orden correcto para respetar foreign keys
  // (de dependientes a independientes)
  await client.refreshToken.deleteMany({});
  await client.authCode.deleteMany({});
  await client.oAuthClient.deleteMany({});
  await client.user.deleteMany({});

  // Opcional: Resetear sequences de PostgreSQL
  // (útil si necesitas IDs predecibles)
  // await client.$executeRawUnsafe('ALTER SEQUENCE users_id_seq RESTART WITH 1');
}

/**
 * Trunca todas las tablas (más rápido que deleteMany)
 *
 * Usa TRUNCATE de PostgreSQL que es más eficiente que DELETE.
 * ⚠️  Requiere permisos TRUNCATE en la base de datos.
 *
 * @param {PrismaClient} [prisma] - Cliente Prisma opcional
 *
 * @example
 * ```typescript
 * afterEach(async () => {
 *   await truncateAllTables();
 * });
 * ```
 */
export async function truncateAllTables(prisma?: PrismaClient): Promise<void> {
  const client = prisma || (await getPrismaTestClient());

  try {
    // Truncate en orden inverso de dependencias
    await client.$executeRawUnsafe('TRUNCATE TABLE "refresh_tokens" CASCADE');
    await client.$executeRawUnsafe('TRUNCATE TABLE "auth_codes" CASCADE');
    await client.$executeRawUnsafe('TRUNCATE TABLE "oauth_clients" CASCADE');
    await client.$executeRawUnsafe('TRUNCATE TABLE "users" CASCADE');
  } catch (error) {
    // Si TRUNCATE falla, caer a cleanDatabase
    console.warn('TRUNCATE failed, falling back to deleteMany:', error);
    await cleanDatabase(client);
  }
}

/**
 * Verifica la conectividad con la base de datos
 *
 * @param {PrismaClient} [prisma] - Cliente Prisma opcional
 * @returns {Promise<boolean>} true si la conexión es exitosa
 *
 * @example
 * ```typescript
 * beforeAll(async () => {
 *   const isConnected = await checkDatabaseConnection();
 *   if (!isConnected) {
 *     throw new Error('Cannot connect to test database');
 *   }
 * });
 * ```
 */
export async function checkDatabaseConnection(prisma?: PrismaClient): Promise<boolean> {
  try {
    const client = prisma || (await getPrismaTestClient());
    await client.$queryRaw`SELECT 1`;
    return true;
  } catch (error) {
    console.error('Database connection check failed:', error);
    return false;
  }
}

/**
 * Cuenta el número total de registros en todas las tablas
 *
 * Útil para verificar que cleanDatabase() funcionó correctamente.
 *
 * @param {PrismaClient} [prisma] - Cliente Prisma opcional
 * @returns {Promise<number>} Total de registros en todas las tablas
 *
 * @example
 * ```typescript
 * afterEach(async () => {
 *   await cleanDatabase();
 *   const count = await getTotalRecordCount();
 *   expect(count).toBe(0);
 * });
 * ```
 */
export async function getTotalRecordCount(prisma?: PrismaClient): Promise<number> {
  const client = prisma || (await getPrismaTestClient());

  const [users, clients, codes, tokens] = await Promise.all([
    client.user.count(),
    client.oAuthClient.count(),
    client.authCode.count(),
    client.refreshToken.count(),
  ]);

  return users + clients + codes + tokens;
}

/**
 * Seed inicial para tests que necesiten datos base
 *
 * Crea un conjunto mínimo de datos necesarios para tests comunes.
 *
 * @param {PrismaClient} [prisma] - Cliente Prisma opcional
 * @returns {Promise<object>} Objeto con referencias a los datos creados
 *
 * @example
 * ```typescript
 * beforeEach(async () => {
 *   const { testUser, testClient } = await seedTestDatabase();
 *   // Usar testUser y testClient en los tests
 * });
 * ```
 */
export async function seedTestDatabase(prisma?: PrismaClient): Promise<{
  testUser: any;
  testClient: any;
}> {
  const client = prisma || (await getPrismaTestClient());

  // Crear usuario de prueba
  const testUser = await client.user.create({
    data: {
      id: '00000000-0000-0000-0000-000000000001',
      email: 'testuser@example.com',
      username: 'testuser',
      password: '$2b$10$abcdefghijklmnopqrstuvwxyz1234567890', // Hash fake
    },
  });

  // Crear cliente OAuth2 de prueba
  const testClient = await client.oAuthClient.create({
    data: {
      id: '00000000-0000-0000-0000-000000000002',
      clientId: 'test-client-id',
      clientSecret: null, // Public client
      clientName: 'Test OAuth2 Client',
      redirectUris: ['http://localhost:3000/callback'],
      grantTypes: ['authorization_code', 'refresh_token'],
      isPublic: true,
    },
  });

  return { testUser, testClient };
}
