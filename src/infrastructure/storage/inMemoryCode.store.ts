import { AuthorizationCodeEntity } from '@/domain';
import { ICodeStore, ILogger } from '@/interfaces';
import { LogContextClass, LogContextMethod } from '@/shared';

/**
 * In-memory implementation of the authorization code storage interface.
 *
 * This store maintains authorization codes in a Map data structure and provides
 * automatic cleanup of expired codes through a periodic background task.
 *
 * @remarks
 * The cleanup interval runs every 600ms to remove expired authorization codes.
 * Make sure to call {@link shutdown} when the store is no longer needed to prevent
 * memory leaks from the interval timer.
 *
 * @example
 * ```typescript
 * const store = new InMemoryCodeStore(logger);
 * store.set('code123', authCodeEntity);
 * const retrieved = store.get('code123');
 * // Don't forget to cleanup
 * store.shutdown();
 * ```
 */

@LogContextClass()
export class InMemoryCodeStore implements ICodeStore {
  private readonly store: Map<string, AuthorizationCodeEntity>;
  private cleanupInterval: NodeJS.Timeout | null = null;

  /**
   * Creates an instance of the in-memory code store.
   * Initializes the internal Map storage and starts the cleanup process for expired entries.
   *
   * @param logger - The logger instance used for logging storage operations and errors
   */

  constructor(private readonly logger: ILogger) {
    this.store = new Map();
    this.startCleanup();
  }

  /**
   * Starts a periodic cleanup process to remove expired codes from storage.
   *
   * @remarks
   * This method initiates an interval that runs every 600 milliseconds to automatically
   * clean up expired entries by calling the `cleanedExpired` method.
   *
   * @private
   * @returns {void}
   */

  private startCleanup(): void {
    this.cleanupInterval = setInterval(() => {
      this.cleanedExpired();
    }, 600);
  }

  /**
   * Stores an authorization code entity in the in-memory store.
   *
   * @param code - The authorization code string to use as the key
   * @param authCode - The authorization code entity to store
   * @returns void
   */

  public set(code: string, authCode: AuthorizationCodeEntity): void {
    this.store.set(code, authCode);
  }
  /**
   * Retrieves an authorization code entity from the in-memory store.
   *
   * @param code - The authorization code to look up in the store
   * @returns The authorization code entity if found, undefined otherwise
   */

  public get(code: string): AuthorizationCodeEntity | undefined {
    return this.store.get(code);
  }
  /**
   * Checks if a code exists in the in-memory store.
   *
   * @param code - The authorization code to check for existence
   * @returns `true` if the code exists in the store, `false` otherwise
   */

  public has(code: string): boolean {
    return this.store.has(code);
  }
  /**
   * Removes all expired authorization codes from the store.
   *
   * Iterates through all stored authorization codes and deletes those that have expired.
   * Logs the number of removed codes if any were cleaned up.
   *
   * @returns {void}
   */

  @LogContextMethod()
  public cleanedExpired(): void {
    let removed = 0;
    for (const [code, authCode] of this.store.entries()) {
      if (authCode.isExpired()) {
        this.store.delete(code);
        removed++;
      }
    }

    if (removed > 0) this.logger.debug('Cleaned expired authorization codes', { removed });
  }

  /**
   * Shuts down the in-memory code store by clearing the cleanup interval.
   * This method should be called when the store is no longer needed to prevent memory leaks
   * and ensure proper cleanup of background tasks.
   *
   * @returns {void}
   */

  public shutdown(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
  }
}
