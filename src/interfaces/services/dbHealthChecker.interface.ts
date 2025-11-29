/**
 * Represents the health status of the database connection and key tables.
 *
 * @property connected - Indicates if the database connection is active.
 * @property latency - The measured latency (in milliseconds) for a database operation.
 * @property tables - An object indicating the existence or health of essential tables.
 * @property tables.users - Status of the 'users' table.
 * @property tables.oAuthClients - Status of the 'oAuthClients' table.
 * @property tables.authCodes - Status of the 'authCodes' table.
 * @property tables.refreshTokens - Status of the 'refreshTokens' table.
 * @property [recordCounts] - Optional object containing the number of records in each table.
 * @property [recordCounts.users] - Number of records in the 'users' table.
 * @property [recordCounts.oAuthClients] - Number of records in the 'oAuthClients' table.
 * @property [recordCounts.authCodes] - Number of records in the 'authCodes' table.
 * @property [recordCounts.refreshTokens] - Number of records in the 'refreshTokens' table.
 * @property [error] - Optional error message if the health check failed or encountered issues.
 */

export interface IDatabaseHealthResponse {
  connected: boolean;
  latency: number;
  tables: {
    users: boolean;
    oAuthClients: boolean;
    authCodes: boolean;
    refreshTokens: boolean;
  };
  recordCounts?: {
    users: number;
    oAuthClients: number;
    authCodes: number;
    refreshTokens: number;
  };
  error?: string;
}

/**
 * Interface for checking the health of a database connection and its essential tables.
 *
 * @remarks
 * This interface defines methods to verify the database connection, check the existence of required tables,
 * and retrieve an overall health status including connection status, latency, table existence, and optional record counts.
 *
 * @method checkConnection
 * Checks if the database connection is active.
 * @returns A promise that resolves to `true` if the connection is healthy, otherwise `false`.
 *
 * @method checkTables
 * Checks the existence of essential tables in the database.
 * @returns A promise that resolves to an object indicating the presence of each required table.
 *
 * @method getHealthStatus
 * Retrieves the overall health status of the database, including connection status, latency, table existence, and optional record counts.
 * @returns A promise that resolves to an object containing health metrics.
 */

export interface IDatabaBaseHealthChecker {
  /**
   * Checks the database connection.
   *
   * @return {*}  {Promise<boolean>} True if the connection is healthy, false otherwise.
   * @memberof IDatabaBaseHealthChecker
   */

  checkConnection(): Promise<boolean>;

  /**
   * Checks the existence of essential tables in the database.
   *
   * @return {*}  {Promise<{ users: boolean; oAuthClients: boolean; authCodes: boolean; refreshToken: boolean }>} - An object indicating the presence of each required table.
   * @memberof IDatabaBaseHealthChecker
   */

  checkTables(): Promise<{ users: boolean; oAuthClients: boolean; authCodes: boolean; refreshTokens: boolean }>;

  /**
   * Gets the overall health status of the database.
   *
   * @return {*}  {Promise<IDatabaseHealthResponse>} - An object containing health metrics including connection status, latency, table existence, and optional record counts.
   * @memberof IDatabaBaseHealthChecker
   */

  getHealthStatus(): Promise<IDatabaseHealthResponse>;
}
