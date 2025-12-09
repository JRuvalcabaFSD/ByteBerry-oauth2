import { AuthCodeEntity } from '@domain';

/**
 * Repository interface for managing OAuth 2.0 authorization codes.
 *
 * This interface defines the contract for persisting and retrieving authorization codes
 * used in the OAuth 2.0 authorization code flow. Implementations should handle the storage,
 * retrieval, and cleanup of authorization codes with their associated metadata.
 *
 * @interface IAuthCodeRepository
 *
 * @example
 * ```typescript
 * class InMemoryAuthCodeRepository implements IAuthCodeRepository {
 *   async save(code: AuthCodeEntity): Promise<void> {
 *     // Implementation
 *   }
 *
 *   async findByCode(code: string): Promise<AuthCodeEntity | null> {
 *     // Implementation
 *   }
 *
 *   async cleanup(): Promise<void> {
 *     // Implementation
 *   }
 * }
 * ```
 */

export interface IAuthCodeRepository {
	save(code: AuthCodeEntity): Promise<void>;
	findByCode(code: string): Promise<AuthCodeEntity | null>;
	cleanup(): Promise<void>;
}
