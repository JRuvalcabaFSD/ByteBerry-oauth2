import { PrismaClient } from '@prisma/client';

import { IAuthCodeRepository, ILogger } from '@interfaces';
import { AuthCodeMapper } from '@infrastructure';
import { handledPrismaError } from '@shared';
import { AuthCodeEntity } from '@domain';

/**
 * Repository implementation for managing OAuth2 authorization codes using Prisma ORM.
 *
 * This class provides methods to persist, retrieve, and clean up authorization codes
 * in the database. It implements the `IAuthCodeRepository` interface and uses a
 * PrismaClient instance for database operations and an ILogger for logging.
 *
 * @remarks
 * - The `save` method upserts an authorization code, marking it as used if it already exists.
 * - The `findByCode` method retrieves an authorization code by its code string.
 * - The `cleanup` method deletes all expired authorization codes from the database.
 *
 * @example
 * ```typescript
 * const repo = new PrismaAuthCodeRepository(prismaClient, logger);
 * await repo.save(authCodeEntity);
 * const code = await repo.findByCode('some-code');
 * await repo.cleanup();
 * ```
 */

export class PrismaAuthCodeRepository implements IAuthCodeRepository {
	constructor(
		private readonly client: PrismaClient,
		private readonly logger: ILogger
	) {}

	/**
	 * Saves an authorization code entity to the database.
	 * If the code already exists, it updates the record and marks it as used.
	 * If the code does not exist, it creates a new record.
	 *
	 * @param code - The authorization code entity to be saved.
	 * @returns A promise that resolves when the operation is complete.
	 * @throws Throws a handled Prisma error if the database operation fails.
	 */

	public async save(code: AuthCodeEntity): Promise<void> {
		try {
			const data = AuthCodeMapper.toPersistence(code);
			await this.client.authCode.upsert({ where: { code: data.code }, update: { ...data, used: true }, create: data });
			this.logger.info('Authorization code saved to database', { code: data.code });
		} catch (error) {
			throw handledPrismaError(error);
		}
	}
	/**
	 * Retrieves an authorization code entity from the database by its code.
	 *
	 * @param code - The authorization code to search for.
	 * @returns A promise that resolves to the corresponding `AuthCodeEntity` if found, or `null` if not found.
	 * @throws Throws a handled Prisma error if the database operation fails.
	 */

	public async findByCode(code: string): Promise<AuthCodeEntity | null> {
		try {
			const record = await this.client.authCode.findUnique({ where: { code } });
			if (!record) {
				this.logger.debug('code not found', { code });
				return null;
			}
			this.logger.debug('find Authorization Code in database', { code });
			return AuthCodeMapper.toDomain(record);
		} catch (error) {
			throw handledPrismaError(error);
		}
	}

	/**
	 * Removes all expired authorization codes from the database.
	 *
	 * This method deletes records from the `authCode` table where the `expiresAt` timestamp
	 * is earlier than the current date and time. It logs a message upon successful cleanup.
	 * Any errors encountered during the operation are handled by `handledPrismaError`.
	 *
	 * @returns {Promise<void>} A promise that resolves when the cleanup is complete.
	 */

	public async cleanup(): Promise<void> {
		try {
			this.logger.info('cleared expired codes successfully');
			await this.client.authCode.deleteMany({ where: { expiresAt: { lt: new Date() } } });
		} catch (error) {
			handledPrismaError(error);
		}
	}
}
