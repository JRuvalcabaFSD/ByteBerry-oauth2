import { IAuthorizationCode, IAuthorizationCodeRepository, ILogger } from '@/interfaces';

/**
 * Implementation of the {@link IAuthorizationCodeRepository} interface using an in-memory `Map` for storage.
 *
 * This repository manages OAuth2 authorization codes, supporting operations such as saving, finding, marking as used,
 * deleting, and cleaning up expired codes. It also periodically removes expired codes via an internal cleanup task.
 *
 * @remarks
 * - The repository is intended for in-memory use only and is not persistent.
 * - Expired codes are automatically cleaned up at a fixed interval.
 * - Logging is performed for all major operations using the provided {@link ILogger} instance.
 *
 * @example
 * ```typescript
 * const repo = new AuthorizationCodeRepositoryImpl(logger);
 * await repo.save(authCode);
 * const found = await repo.findByCode(authCode.code);
 * await repo.markAsUsed(authCode.code);
 * await repo.delete(authCode.code);
 * ```
 *
 * @see IAuthorizationCodeRepository
 * @see IAuthorizationCode
 * @see ILogger
 */

export class AuthorizationCodeRepositoryImpl implements IAuthorizationCodeRepository {
  private readonly storage: Map<string, IAuthorizationCode>;
  private cleanupInterval: NodeJS.Timeout | null = null;
  private static readonly CLEANUP_INTERVAL_MS = 60000;

  /**
   * Creates an instance of AuthorizationCodeRepositoryImpl.
   * @param {ILogger} logger - The logger instance for logging repository operations.
   * @memberof AuthorizationCodeRepositoryImpl
   */

  constructor(private readonly logger: ILogger) {
    const context = 'AuthorizationCodeRepositoryImpl.constructor';
    this.storage = new Map<string, IAuthorizationCode>();
    this.startCleanupTask();

    this.logger.debug('authorization code repository initialized', { context });
  }

  /**
   * Saves a new authorization code to the repository.
   *
   * @param {IAuthorizationCode} authCode - The authorization code to save.
   * @return {*}  {Promise<void>} A promise that resolves when the operation is complete.
   * @example
   * ```typescript
   * await repo.save(authCode);
   * ```
   * @throws {Error} If an error occurs during the save operation.
   * @memberof AuthorizationCodeRepositoryImpl
   */

  public async save(authCode: IAuthorizationCode): Promise<void> {
    const context = { context: 'AuthorizationCodeRepositoryImpl.save', code: authCode.code };
    this.logger.debug('Saving authorization code', { ...context, clientId: authCode.metadata.clientId });

    this.storage.set(authCode.code, authCode);
    this.logger.info('Authorization code saved', { ...context, totalCodes: this.storage.size });
  }

  /**
   * Finds an authorization code by its code string.
   *
   * @param {string} code - The authorization code string to search for.
   * @return {*}  {(Promise<IAuthorizationCode | null>)} A promise that resolves to the found authorization code or null if not found.
   * @example
   * ```typescript
   * const authCode = await repo.findByCode('some-code');
   * if (authCode) {
   *   // Use the found authorization code
   * } else {
   *   // Handle not found case
   * }
   * ```
   * @throws {Error} If an error occurs during the find operation.
   * @memberof AuthorizationCodeRepositoryImpl
   */

  public async findByCode(code: string): Promise<IAuthorizationCode | null> {
    const context = { context: 'AuthorizationCodeRepositoryImpl.findByCode', code };
    this.logger.debug('Finding authorization code', { ...context });

    const authCode = this.storage.get(code) || null;

    if (authCode) {
      this.logger.debug('Authorization code found', { ...context, used: authCode.used });
    } else {
      this.logger.debug('Authorization code not found', { ...context });
    }

    return authCode;
  }

  /**
   * Marks an authorization code as used.
   *
   * @param {string} code - The authorization code string to mark as used.
   * @return {*}  {Promise<void>} A promise that resolves when the operation is complete.
   * @example
   * ```typescript
   * await repo.markAsUsed('some-code');
   * ```
   * @throws {Error} If an error occurs during the operation.
   * @memberof AuthorizationCodeRepositoryImpl
   */

  public async markAsUsed(code: string): Promise<void> {
    const context = { context: 'AuthorizationCodeRepositoryImpl.markAsUsed', code };
    this.logger.debug('Marking authorization code as used', { ...context });
    const authCode = this.storage.get(code);

    if (authCode) {
      authCode.used = true;
      this.storage.set(code, authCode);

      this.logger.info('Authorization code marked as used', { ...context });
    } else {
      this.logger.warn('Authorization code not found for marking', { ...context });
    }
  }

  /**
   * Deletes an authorization code from the repository.
   *
   * @param {string} code - The authorization code string to delete.
   * @return {*}  {Promise<void>} A promise that resolves when the operation is complete.
   * @example
   * ```typescript
   * await repo.delete('some-code');
   * ```
   * @throws {Error} If an error occurs during the delete operation.
   * @memberof AuthorizationCodeRepositoryImpl
   */

  public async delete(code: string): Promise<void> {
    const context = { context: 'AuthorizationCodeRepositoryImpl.delete', code };
    this.logger.debug('Deleting authorization code', { ...context });

    const deleted = this.storage.delete(code);

    if (deleted) {
      this.logger.info('Authorization code deleted', { ...context, remainingCodes: this.storage.size });
    } else {
      this.logger.warn('Authorization code not found for deletion', { ...context });
    }
  }

  /**
   * Cleans up expired authorization codes from the repository.
   *
   * @return {*}  {Promise<number>} A promise that resolves to the number of deleted expired codes.
   * @example
   * ```typescript
   * const deletedCount = await repo.cleanupExpired();
   * console.log(`Deleted ${deletedCount} expired codes`);
   * ```
   * @throws {Error} If an error occurs during the cleanup operation.
   * @memberof AuthorizationCodeRepositoryImpl
   */

  public async cleanupExpired(): Promise<number> {
    const context = 'AuthorizationCodeRepositoryImpl.cleanupExpired';
    this.logger.debug('Deleting expired authorization codes', { context });

    const now = new Date();
    let deleteCount = 0;

    for (const [code, authCode] of this.storage.entries()) {
      if (now > authCode.metadata.expiresAt) {
        this.storage.delete(code);
        deleteCount++;
      }
    }

    if (deleteCount > 0) {
      this.logger.info('Expired authorization codes deleted', { context, deleteCount, remainingCodes: this.storage.size });
    }

    return deleteCount;
  }

  /**
   * Clears all authorization codes from the repository.
   *
   * @return {*}  {Promise<void>} A promise that resolves when the operation is complete.
   * @example
   * ```typescript
   * await repo.clear();
   * ```
   * @throws {Error} If an error occurs during the clear operation.
   * @memberof AuthorizationCodeRepositoryImpl
   */

  public async clear(): Promise<void> {
    const context = 'AuthorizationCodeRepositoryImpl.clear';
    this.logger.warn('Clearing all authorization codes', { context, codesCleared: this.storage.size });

    this.storage.clear();

    this.logger.info('All authorization codes cleared', { context });
  }

  /**
   * Counts the total number of authorization codes in the repository.
   *
   * @return {*}  {Promise<number>} A promise that resolves to the total count of authorization codes.
   * @memberof AuthorizationCodeRepositoryImpl
   */

  public async count(): Promise<number> {
    return this.storage.size;
  }

  /**
   * Starts a periodic cleanup task that removes expired authorization codes from the repository.
   * The task runs at intervals defined by `AuthorizationCodeRepositoryImpl.CLEANUP_INTERVAL_MS`.
   * Logs the outcome of each cleanup attempt, including the number of deleted records or any errors encountered.
   * Intended to be called once during the repository's lifecycle to ensure expired codes are regularly purged.
   *
   * @private
   */

  private startCleanupTask(): void {
    const context = 'AuthorizationCodeRepositoryImpl.startCleanupTask';
    this.cleanupInterval = setInterval(async () => {
      try {
        const deletedCount = await this.cleanupExpired();
        if (deletedCount > 0) {
          this.logger.info('Cleanup task completed', { context, deletedCount });
        }
      } catch (error) {
        this.logger.error('Cleanup task failed', { context, error: error instanceof Error ? error.message : 'Unknown error' });
      }
    }, AuthorizationCodeRepositoryImpl.CLEANUP_INTERVAL_MS);

    this.logger.info('Cleanup task started', { context, intervalMs: AuthorizationCodeRepositoryImpl.CLEANUP_INTERVAL_MS });
  }

  /**
   * Stops the periodic cleanup task that removes expired authorization codes from the repository.
   * If the cleanup task is not running, this method has no effect.
   *
   * @memberof AuthorizationCodeRepositoryImpl
   */

  public stopCleanupTask(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }

    this.logger.info('Cleanup task stopped', {
      context: 'InMemoryAuthorizationCodeRepository.stopCleanupTask',
    });
  }
}
