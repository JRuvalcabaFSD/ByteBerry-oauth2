import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

import { PrismaClient } from 'generated/prisma/client';

/**
 * Singleton class for managing the application's database configuration and connections.
 *
 * This class encapsulates the creation and management of a PrismaClient instance
 * and a PostgreSQL connection pool. It ensures that only one instance of the database
 * configuration exists throughout the application's lifecycle.
 *
 * @remarks
 * - Uses the Singleton pattern to provide a single shared instance.
 * - Integrates Prisma ORM with a custom PostgreSQL adapter.
 * - Optionally exposes the Prisma client globally in non-production environments for debugging.
 *
 * @example
 * ```typescript
 * const dbConfig = DatabaseConfig.getInstance(connectionString, nodeEnv);
 * const client = dbConfig.getClient();
 * ```
 *
 * @public
 */

export class DatabaseConfig {
  private static instance: DatabaseConfig | null = null;
  private readonly dbClient: PrismaClient;
  private readonly pool: Pool;

  /**
   * Initializes a new instance of the database configuration.
   *
   * @param connectionString - The connection string used to connect to the PostgreSQL database.
   *
   * @remarks
   * - Creates a new PostgreSQL connection pool using the provided connection string.
   * - Sets up a Prisma client with a custom adapter for PostgreSQL.
   * - In non-production environments, assigns the Prisma client instance to a global variable for reuse.
   */

  private constructor(connectionString: string) {
    this.pool = new Pool({ connectionString });
    const adapter = new PrismaPg(this.pool);
    this.dbClient = new PrismaClient({ adapter });
  }

  /**
   * Returns the singleton instance of the `DatabaseConfig` class.
   * If the instance does not exist, it creates a new one using the provided
   * connection string and node environment.
   *
   * @param connectionString - The database connection string.
   * @returns The singleton instance of `DatabaseConfig`.
   */

  public static getInstance(connectionString: string): DatabaseConfig {
    if (!this.instance) this.instance = new DatabaseConfig(connectionString);
    return this.instance;
  }

  /**
   * Retrieves the current instance of the PrismaClient.
   *
   * @returns {PrismaClient} The PrismaClient instance used for database operations.
   */

  public getClient(): PrismaClient {
    return this.dbClient;
  }

  /**
   * Tests the database connection by executing a simple query.
   *
   * @returns A promise that resolves to `true` if the connection is successful, or `false` if an error occurs.
   */

  public async testConnection(): Promise<boolean> {
    await this.dbClient.$queryRawUnsafe('SELECT 1');
    return true;
  }

  /**
   * Disconnects the database client if it exists and resets the singleton instance.
   *
   * @returns {Promise<void>} A promise that resolves when the database client has been disconnected.
   */

  public async disconnect(): Promise<void> {
    if (this.dbClient) {
      await this.dbClient.$disconnect();
      DatabaseConfig.instance = null;
    }
  }
}
