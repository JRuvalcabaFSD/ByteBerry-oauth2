/**
 * Global Setup para Integration Tests
 *
 * Se ejecuta UNA VEZ antes de todos los tests de integración.
 * Responsable de:
 * - Cargar variables de entorno de .env.test
 * - Verificar que PostgreSQL esté corriendo
 * - Ejecutar migraciones de Prisma
 * - Preparar la base de datos para tests
 *
 * @module tests/setup.integration
 */

import { config } from 'dotenv';
import { resolve } from 'path';
import { execSync } from 'child_process';
import { Pool } from 'pg';

/**
 * Setup global ejecutado por Jest antes de todos los tests
 */
export default async function globalSetup(): Promise<void> {
  console.log('\n🚀 Starting Integration Tests Setup...\n');

  // 1. Cargar variables de entorno de .env.test
  const envTestPath = resolve(process.cwd(), '.env.test');
  const envResult = config({ path: envTestPath });

  if (envResult.error) {
    throw new Error(`Failed to load .env.test: ${envResult.error.message}`);
  }

  console.log('✅ Loaded environment variables from .env.test');

  // 2. Verificar que DATABASE_URL esté configurada
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not defined in .env.test');
  }

  console.log(`📦 Database URL: ${process.env.DATABASE_URL.replace(/:[^:@]+@/, ':****@')}`);

  // 3. Verificar conectividad con PostgreSQL
  console.log('\n🔍 Checking PostgreSQL connection...');

  const isConnected = await checkPostgresConnection(process.env.DATABASE_URL);

  if (!isConnected) {
    console.error('\n❌ Cannot connect to PostgreSQL test database.');
    console.error('💡 Make sure the test database is running:');
    console.error('   pnpm test:db:up\n');
    throw new Error('PostgreSQL test database is not accessible');
  }

  console.log('✅ PostgreSQL connection successful');

  // 4. Ejecutar migraciones de Prisma
  console.log('\n📊 Running Prisma migrations...');

  try {
    execSync('pnpm prisma migrate deploy', {
      env: {
        ...process.env,
        DATABASE_URL: process.env.DATABASE_URL,
      },
      stdio: 'inherit',
    });
    console.log('✅ Prisma migrations completed successfully');
  } catch (error) {
    console.error('❌ Failed to run Prisma migrations');
    throw error;
  }

  // 5. Generar Prisma Client (si no existe)
  console.log('\n🔧 Generating Prisma Client...');

  try {
    execSync('pnpm prisma generate', {
      stdio: 'inherit',
    });
    console.log('✅ Prisma Client generated successfully');
  } catch (error) {
    console.error('❌ Failed to generate Prisma Client');
    throw error;
  }

  console.log('\n✨ Integration Tests Setup Complete!\n');
}

/**
 * Verifica la conexión a PostgreSQL
 *
 * @param {string} databaseUrl - URL de conexión a PostgreSQL
 * @returns {Promise<boolean>} true si la conexión es exitosa
 */
async function checkPostgresConnection(databaseUrl: string): Promise<boolean> {
  const pool = new Pool({
    connectionString: databaseUrl,
    max: 1,
    connectionTimeoutMillis: 5000,
  });

  try {
    const client = await pool.connect();
    await client.query('SELECT 1');
    client.release();
    await pool.end();
    return true;
  } catch (error) {
    console.error('Connection error:', error);
    try {
      await pool.end();
      // eslint-disable-next-line no-empty
    } catch {}
    return false;
  }
}
