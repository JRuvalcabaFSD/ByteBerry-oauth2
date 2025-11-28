/* eslint-disable @typescript-eslint/no-explicit-any */
import { IDatabaBaseHealthChecker, IDatabaseHealthResponse, ILogger } from '@/interfaces';
import { LogContextClass, LogContextMethod } from '@/shared';
import { PrismaClient } from 'generated/prisma/client';

/**
 * Service for checking the health and status of the database connection and schema.
 *
 * This service provides methods to:
 * - Check if the database connection is alive.
 * - Verify the existence of required tables.
 * - Retrieve health status including connection, latency, table existence, and record counts.
 *
 * @implements {IDatabaBaseHealthChecker}
 *
 * @example
 * const healthChecker = new DataBaseHealthCheckerService(prismaClient, logger);
 * const healthStatus = await healthChecker.getHealthStatus();
 *
 * @remarks
 * This service is intended for use in infrastructure monitoring and diagnostics.
 *
 * @param dbClient - The PrismaClient instance used for database operations.
 * @param logger - The logger instance for logging health check results.
 */

@LogContextClass()
export class DataBaseHealthCheckerService implements IDatabaBaseHealthChecker {
  /**
   * Creates an instance of the service.
   *
   * @param dbClient - An instance of PrismaClient used to interact with the database.
   * @param logger - An implementation of ILogger for logging service activities.
   */

  constructor(
    private readonly dbClient: PrismaClient,
    private readonly logger: ILogger
  ) {}

  /**
   * Checks the health of the database connection by executing a simple query.
   *
   * @returns {Promise<boolean>} A promise that resolves to `true` if the database connection is healthy,
   * or `false` if the connection check fails.
   *
   * @remarks
   * Logs a debug message on successful connection, or an error message if the check fails.
   */

  @LogContextMethod()
  public async checkConnection(): Promise<boolean> {
    try {
      // Prisma no lanza error tras $disconnect en algunos entornos, así que forzamos una comprobación adicional
      if (typeof (this.dbClient as any).$isPooledConnectionActive === 'function') {
        const isActive = await (this.dbClient as any).$isPooledConnectionActive();
        if (!isActive) throw new Error('Prisma pool not active');
      }
      await this.dbClient.$queryRawUnsafe('SELECT 1');
      this.logger.debug('Database connection check successful');
      return true;
    } catch (error) {
      this.logger.error('Database connection check failed', { error });
      return false;
    }
  }

  /**
   * Checks the existence of specific tables in the database: 'users', 'oauth_clients', 'auth_codes', and 'refresh_tokens'.
   *
   * Executes a raw SQL query to determine if each of the required tables exists in the 'public' schema.
   * Returns an object indicating the presence (`true`) or absence (`false`) of each table.
   * Logs the result of the check or any errors encountered during execution.
   *
   * @returns {Promise<{ users: boolean; oAuthClients: boolean; authCodes: boolean; refreshTokens: boolean }>}
   * An object with boolean flags for each table, indicating whether the table exists.
   */

  @LogContextMethod()
  public async checkTables(): Promise<{ users: boolean; oAuthClients: boolean; authCodes: boolean; refreshTokens: boolean }> {
    const tables = {
      users: false,
      oAuthClients: false,
      authCodes: false,
      refreshTokens: false,
    };
    try {
      // Prisma no lanza error tras $disconnect en algunos entornos, así que forzamos una comprobación adicional
      if (typeof (this.dbClient as any).$isPooledConnectionActive === 'function') {
        const isActive = await (this.dbClient as any).$isPooledConnectionActive();
        if (!isActive) throw new Error('Prisma pool not active');
      }
      const result = await this.dbClient.$queryRaw<Array<{ tablename: string }>>`
        SELECT tablename
        FROM pg_tables
        WHERE schemaname = 'public'
        AND tablename IN ('users', 'oauth_clients', 'auth_codes', 'refresh_tokens')
      `;

      const existingTables = result.map(row => row.tablename);

      tables.users = existingTables.includes('users');
      tables.oAuthClients = existingTables.includes('oauth_clients');
      tables.authCodes = existingTables.includes('auth_codes');
      tables.refreshTokens = existingTables.includes('refresh_tokens');

      this.logger.debug('Database tables check completed', { tables });

      return tables;
    } catch (error) {
      this.logger.error('Database tables check failed', { error });
      return tables;
    }
  }

  /**
   * Retrieves the current health status of the database connection.
   *
   * This method checks the database connectivity, measures the latency,
   * verifies the existence of required tables, and optionally retrieves
   * the record counts for key tables if the connection is established.
   * It logs relevant information and warnings during the process.
   *
   * @returns A promise that resolves to an object containing:
   * - `connected`: Whether the database is connected.
   * - `latency`: The time in milliseconds taken to check the connection.
   * - `tables`: An object indicating the existence of required tables.
   * - `recordCounts` (optional): The number of records in each key table.
   */

  @LogContextMethod()
  public async getHealthStatus(): Promise<IDatabaseHealthResponse> {
    const startTime = Date.now();

    // Check connection
    const connected = await this.checkConnection();

    // Measure latency
    const latency = Date.now() - startTime;

    // Check tables
    const tables = await this.checkTables();

    // If connected, get record counts
    let recordCounts:
      | {
          users: number;
          oAuthClients: number;
          authCodes: number;
          refreshTokens: number;
        }
      | undefined;

    if (connected) {
      try {
        // Prisma no lanza error tras $disconnect en algunos entornos, así que forzamos una comprobación adicional
        if (typeof (this.dbClient as any).$isPooledConnectionActive === 'function') {
          const isActive = await (this.dbClient as any).$isPooledConnectionActive();
          if (!isActive) throw new Error('Prisma pool not active');
        }
        const [users, clients, codes, tokens] = await Promise.all([
          this.dbClient.user.count(),
          this.dbClient.oAuthClient.count(),
          this.dbClient.authCode.count(),
          this.dbClient.refreshToken.count(),
        ]);

        recordCounts = {
          users,
          oAuthClients: clients,
          authCodes: codes,
          refreshTokens: tokens,
        };

        this.logger.debug('Database record counts retrieved', { recordCounts });
      } catch (error) {
        this.logger.warn('Failed to retrieve record counts', { error });
      }
    }

    const status = {
      connected,
      latency,
      tables,
      ...(recordCounts !== undefined && { recordCounts }),
    };

    this.logger.info('Database health status retrieved', {
      connected: status.connected,
      latency: status.latency,
    });

    return status;
  }
}
