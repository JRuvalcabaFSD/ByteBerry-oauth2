import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

import { PrismaClient } from '@prisma/client';
import type { ILogger } from '@interfaces';
import { LogContextClass } from '@shared';

/**
 * Configuration options for connecting to a database.
 *
 * @property connectionString - The connection string used to connect to the database.
 * @property poolMin - (Optional) The minimum number of connections in the connection pool.
 * @property pollMax - (Optional) The maximum number of connections in the connection pool.
 */

export interface DatabaseOptions {
	connectionString: string;
	poolMin?: number;
	pollMax?: number;
}

/**
 * Manages the configuration and connection to the database using Prisma and a PostgreSQL connection pool.
 *
 * @remarks
 * This class initializes a PostgreSQL connection pool and a Prisma client with a custom adapter.
 * It provides methods to retrieve the Prisma client, test the database connection, and disconnect from the database.
 *
 * @example
 * ```typescript
 * const dbConfig = new DatabaseConfig(options, logger);
 * const client = dbConfig.getClient();
 * await dbConfig.testConnection();
 * await dbConfig.disconnect();
 * ```
 *
 * @constructor
 * @param options - The database connection options.
 * @param logger - The logger instance for logging database events.
 */

@LogContextClass()
export class DatabaseConfig {
	private readonly client: PrismaClient;
	private readonly pool: Pool;

	/**
	 * Initializes a new instance of the database configuration class.
	 *
	 * @param options - The database connection and pool configuration options.
	 * @param logger - The logger instance used for logging database-related events.
	 *
	 * Sets up a PostgreSQL connection pool using the provided options and initializes
	 * a Prisma client with a custom adapter for database operations.
	 */

	constructor(
		options: DatabaseOptions,
		private readonly logger: ILogger
	) {
		this.pool = new Pool({
			connectionString: options.connectionString,
			min: options.poolMin,
			max: options.pollMax,
		});

		const adapter = new PrismaPg(this.pool);
		this.client = new PrismaClient({ adapter });
	}

	/**
	 * Retrieves the current instance of the PrismaClient.
	 *
	 * @returns {PrismaClient} The PrismaClient instance used for database operations.
	 */

	public getClient(): PrismaClient {
		return this.client;
	}

	/**
	 * Tests the connection to the database by executing a simple query.
	 * Logs a success message if the connection is established.
	 *
	 * @returns {Promise<boolean>} A promise that resolves to true if the connection is successful.
	 * @throws Will propagate any errors encountered during the query execution.
	 */

	public async testConnection(): Promise<boolean> {
		await this.client.$queryRawUnsafe('SELECT 1');
		this.logger.info('Connection with the database wae successful');
		return true;
	}

	/**
	 * Disconnects the database client if it is currently connected.
	 *
	 * This method checks if the database client exists, and if so, it calls the client's
	 * `$disconnect` method to close the connection. After successfully disconnecting,
	 * it logs an informational message indicating that the disconnection was successful.
	 *
	 * @returns {Promise<void>} A promise that resolves when the disconnection is complete.
	 */

	public async disconnect(): Promise<void> {
		if (this.client) {
			await this.client.$disconnect();
			this.logger.info('Disconnected with the database');
		}
	}
}
