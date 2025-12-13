import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../../generated/prisma/client.js';
import { Pool } from 'pg';
import { ILogger } from '@interfaces';

export interface DatabaseOptions {
	connectionString: string;
	poolMin?: number;
	poolMax?: number;
}

/**
 * Provides a wrapper around the PrismaClient for database operations,
 * including connection management and testing connectivity.
 *
 * @remarks
 * This class initializes a PrismaClient instance using a provided
 * PostgreSQL connection string and a PrismaPg adapter.
 *
 * @example
 * ```typescript
 * const dbConfig = new DataBaseConfig('postgresql://user:pass@localhost:5432/db');
 * const client = dbConfig.getClient();
 * await dbConfig.testConnect();
 * await dbConfig.disconnect();
 * ```
 */

export class DataBaseConfig {
	private readonly dbClient: PrismaClient;
	private readonly pool: Pool;
	constructor(
		options: DatabaseOptions,
		private readonly logger: ILogger
	) {
		this.pool = new Pool({
			connectionString: options.connectionString,
			min: options.poolMin,
			max: options.poolMax,
		});
		const adapter = new PrismaPg(this.pool);
		this.dbClient = new PrismaClient({ adapter });
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
	 * Tests the database connection by executing a simple raw SQL query.
	 *
	 * @returns {Promise<boolean>} A promise that resolves to `true` if the connection is successful.
	 * @throws Will propagate any errors encountered during the query execution.
	 */

	public async testConnect(): Promise<boolean> {
		await this.dbClient.$queryRawUnsafe('SELECT 1');
		this.logger.info('Connection with the Database was successful');
		return true;
	}

	/**
	 * Disconnects from the database if a client instance exists.
	 *
	 * This method checks if the database client (`dbClient`) is initialized.
	 * If so, it gracefully closes the connection by calling `$disconnect()` on the client.
	 *
	 * @returns {Promise<void>} A promise that resolves when the disconnection is complete.
	 */

	public async disconnect(): Promise<void> {
		if (this.dbClient) {
			await this.dbClient.$disconnect();
			this.logger.info('Disconnected with the database');
		}
	}
}
