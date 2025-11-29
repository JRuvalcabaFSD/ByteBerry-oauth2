import { AuthorizationCodeEntity } from '@/domain';
import { IAuthorizationCodeRepository, ILogger } from '@/interfaces';
import { PrismaClient } from 'generated/prisma/client';
import type { AuthCodeMapper } from '..';
import { handledPrismaError, LogContextClass, LogContextMethod } from '@/shared';

/**
 * Repository implementation for managing OAuth2 authorization codes using a database.
 *
 * This class provides methods to persist, retrieve, and clean up authorization codes
 * in the underlying database using Prisma ORM. It utilizes a mapper to convert between
 * domain entities and persistence models, and logs relevant operations.
 *
 * @implements {IAuthorizationCodeRepository}
 *
 * @constructor
 * @param {AuthCodeMapper} mapper - Maps between domain and persistence models for authorization codes.
 * @param {PrismaClient} dbClient - Prisma client instance for database operations.
 * @param {ILogger} logger - Logger instance for logging repository actions.
 *
 * @method save Persists or updates an authorization code in the database.
 * @method findByCode Retrieves an authorization code entity by its code value.
 * @method cleanup Removes expired authorization codes from the database.
 */

@LogContextClass()
export class DatabaseAuthorizationCodeRepository implements IAuthorizationCodeRepository {
  /**
   * Initializes a new instance of the repository with the required dependencies.
   *
   * @param mapper - An instance of {@link AuthCodeMapper} used for mapping between domain and persistence models.
   * @param dbClient - An instance of {@link PrismaClient} for database operations.
   * @param logger - An instance of {@link ILogger} for logging activities within the repository.
   */

  constructor(
    private readonly mapper: AuthCodeMapper,
    private readonly dbClient: PrismaClient,
    private readonly logger: ILogger
  ) {}

  /**
   * Saves an authorization code entity to the database.
   * If the code already exists, it updates the record and marks it as used.
   * Otherwise, it creates a new record.
   *
   * @param code - The authorization code entity to be persisted.
   * @returns A promise that resolves when the operation is complete.
   */

  @LogContextMethod()
  public async save(code: AuthorizationCodeEntity): Promise<void> {
    try {
      const data = this.mapper.toPersistence(code);
      await this.dbClient.authCode.upsert({ where: { code: data.code }, update: { ...data, used: true }, create: data });
      this.logger.info('Authorization code saved to database', { code: data.code });
    } catch (error) {
      throw handledPrismaError(error);
    }
  }

  /**
   * Retrieves an authorization code entity by its code value.
   *
   * @param code - The unique authorization code to search for.
   * @returns A promise that resolves to the corresponding {@link AuthorizationCodeEntity} if found, or `null` if not found.
   */

  public async findByCode(code: string): Promise<AuthorizationCodeEntity | null> {
    try {
      const record = await this.dbClient.authCode.findUnique({ where: { code } });

      if (!record) return null;

      return this.mapper.toDomain(record);
    } catch (error) {
      throw handledPrismaError(error);
    }
  }

  /**
   * Removes all expired authorization codes from the database.
   *
   * This method deletes all records from the `authCode` table where the `expiresAt`
   * timestamp is earlier than the current date and time. After successful deletion,
   * it logs an informational message indicating that the cleanup has been completed.
   *
   * @returns {Promise<void>} A promise that resolves when the cleanup operation is finished.
   */

  @LogContextMethod()
  public async cleanup(): Promise<void> {
    try {
      await this.dbClient.authCode.deleteMany({ where: { expiresAt: { lt: new Date() } } });
      this.logger.info('Authorization codes cleanup completed');
    } catch (error) {
      throw handledPrismaError(error);
    }
  }
}
