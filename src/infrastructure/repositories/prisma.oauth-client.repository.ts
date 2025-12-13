import { ILogger, IOAthClientRepository } from '@interfaces';
import { PrismaClient } from '@prisma/client';
import { handledPrismaError } from '@shared';
import { OAuthClientEntity } from '@domain';

/**
 * Repository implementation for managing OAuth client entities using Prisma ORM.
 *
 * This class provides methods to interact with the OAuth client data source,
 * such as finding clients by their client ID. It handles database operations,
 * error handling, and logging for OAuth client-related actions.
 *
 * @remarks
 * Implements the `IOAthClientRepository` interface.
 *
 * @example
 * ```typescript
 * const repository = new PrismaOAuthClientRepository(prismaClient, logger);
 * const client = await repository.findByClientId('my-client-id');
 * ```
 *
 * @param dbClient - The PrismaClient instance for database access.
 * @param logger - The logger instance for logging debug and error messages.
 */

export class PrismaOAuthClientRepository implements IOAthClientRepository {
	constructor(
		private readonly client: PrismaClient,
		private readonly logger: ILogger
	) {}

	/**
	 * Retrieves an OAuth client entity by its client ID.
	 *
	 * @param clientId - The unique identifier of the OAuth client.
	 * @returns A promise that resolves to the corresponding {@link OAuthClientEntity} if found, or `null` if not found.
	 * @throws Throws a handled Prisma error if the database operation fails.
	 */

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
