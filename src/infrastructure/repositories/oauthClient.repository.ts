import { OAuthClientEntity } from '@/domain';
import { ILogger, IOAuthClientRepository } from '@/interfaces';
import { handledPrismaError, LogContextClass, LogContextMethod } from '@/shared';
import { PrismaClient } from 'generated/prisma/client';

/**
 * Repository implementation for managing OAuth client entities using Prisma ORM.
 *
 * This class provides methods to interact with the OAuth client data source,
 * including finding clients by their client ID. It utilizes a domain mapper
 * to convert between persistence and domain models, and logs relevant events.
 *
 * @implements {IOAuthClientRepository}
 */

@LogContextClass()
export class OAuthClientRepository implements IOAuthClientRepository {
  constructor(
    private readonly client: PrismaClient,
    private readonly logger: ILogger
  ) {}

  /**
   * Retrieves an OAuth client entity by its client ID.
   *
   * @param clientId - The unique identifier of the OAuth client.
   * @returns A promise that resolves to the corresponding `OAuthClientEntity` if found, or `null` if not found.
   * @throws Throws a handled Prisma error if the database operation fails.
   */

  @LogContextMethod()
  public async findByClientId(clientId: string): Promise<OAuthClientEntity | null> {
    try {
      const record = await this.client.oAuthClient.findUnique({ where: { clientId } });
      if (!record) {
        this.logger.debug('OAuth client not found', { clientId });
        return null;
      }
      return OAuthClientEntity.create(record);
    } catch (error) {
      throw handledPrismaError(error);
    }
  }
}
