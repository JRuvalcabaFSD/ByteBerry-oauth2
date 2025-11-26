/**
 * Prisma Test Client - Singleton para integration tests
 *
 * Proporciona una única instancia de PrismaClient para todos los tests,
 * evitando el error "too many clients" y mejorando performance.
 *
 * @module helpers/prisma-test-client
 */

import { PrismaClient } from '../../generated/prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

let prismaTestClient: PrismaClient | null = null;
let pgPool: Pool | null = null;

/**
 * Obtiene o crea el cliente Prisma singleton para tests
 *
 * @returns {Promise<PrismaClient>} Instancia compartida de PrismaClient
 *
 * @example
 * ```typescript
 * const prisma = await getPrismaTestClient();
 * const users = await prisma.user.findMany();
 * ```
 */
export async function getPrismaTestClient(): Promise<PrismaClient> {
  if (!prismaTestClient) {
    // Verificar que DATABASE_URL esté configurada
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL no está configurada en .env.test');
    }

    // Crear pool de conexiones PostgreSQL
    pgPool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 5, // Límite de conexiones para tests
    });

    // Crear adapter Prisma-Pg
    const adapter = new PrismaPg(pgPool);

    // Crear cliente Prisma con adapter
    prismaTestClient = new PrismaClient({
      adapter,
      log: [],
    });

    // Conectar explícitamente
    await prismaTestClient.$connect();
  }

  return prismaTestClient;
}

/**
 * Cierra la conexión del cliente Prisma de tests
 *
 * Debe llamarse al final de todos los tests para evitar memory leaks.
 *
 * @example
 * ```typescript
 * afterAll(async () => {
 *   await closePrismaTestClient();
 * });
 * ```
 */
export async function closePrismaTestClient(): Promise<void> {
  if (prismaTestClient) {
    await prismaTestClient.$disconnect();
    prismaTestClient = null;
  }

  if (pgPool) {
    await pgPool.end();
    pgPool = null;
  }
}

/**
 * Verifica si el cliente Prisma está conectado
 *
 * @returns {boolean} true si está conectado, false si no
 */
export function isPrismaTestClientConnected(): boolean {
  return prismaTestClient !== null;
}
