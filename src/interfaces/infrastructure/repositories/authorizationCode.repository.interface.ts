import { IAuthorizationCode } from '@/interfaces';

/**
 * Interface for managing OAuth2 authorization codes in a persistent storage.
 * Provides methods to save, retrieve, update, and delete authorization codes,
 * as well as to clean up expired codes.
 *
 * Implementations of this interface are responsible for ensuring the integrity
 * and security of authorization code storage and lifecycle management.
 */

export interface IAuthorizationCodeRepository {
  /**
	 * Saves a new authorization code.
	 * @param {IAuthorizationCode} authCode - The authorization code to be saved.
	 * @return {*} {Promise<void>} A promise that resolves when the operation is complete.
	 * @memberof IAuthorizationCodeRepository
	 * @example ```typescript
	const newAuthCode: IAuthorizationCode = {
		code: 'AC_xxx...',
		clientId: 'client_id',
		userId: 'user_id',
		redirectUri: 'https://example.com/callback',
		createdAt: new Date(),
		expiresAt: new Date(Date.now() + 60 * 1000), // 1 minute expiration
	};
	await repository.save(newAuthCode);
	```
	 */
  save(authCode: IAuthorizationCode): Promise<void>;

  /**
   * Finds an authorization code by its code value.
   *
   * @param {string} code - The code value of the authorization code to find.
   * @return {*}  {(Promise<IAuthorizationCode | null>)} A promise that resolves to the found authorization code or null if not found.
   * @memberof IAuthorizationCodeRepository
   * @example
   * ```typescript
   * const authCode = await repository.findByCode('AC_xxx...');
   * if (authCode) {
   *   // Process the found authorization code
   * } else {
   *   // Handle the case where the code is not found
   * }
   * ```
   */

  findByCode(code: string): Promise<IAuthorizationCode | null>;

  /**
   * Marks an authorization code as used.
   *
   * @param {string} code - The code value of the authorization code to mark as used.
   * @return {*}  {Promise<void>} A promise that resolves when the operation is complete.
   * @memberof IAuthorizationCodeRepository
   * @example
   * ```typescript
   * // After successful exchange for tokens
   * await repository.markAsUsed('AC_xxx...');
   * ```
   */

  markAsUsed(code: string): Promise<void>;

  /**
   * Deletes an authorization code by its code value.
   *
   * @param {string} code - The code value of the authorization code to delete.
   * @return {*}  {Promise<void>} A promise that resolves when the operation is complete.
   * @memberof IAuthorizationCodeRepository
   * @example
   * ```typescript
   * // Clean up after use or on error
   * await repository.delete('AC_xxx...');
   * ```
   */

  delete(code: string): Promise<void>;

  /**
   * Cleans up expired authorization codes.
   *
   * @return {*}  {Promise<number>} A promise that resolves to the number of deleted expired authorization codes.
   * @memberof IAuthorizationCodeRepository
   * @example
   * ```typescripttypescript
   * // Periodic cleanup of expired codes
   * const deletedCount = await repository.cleanupExpired();
   * console.log(`Deleted ${deletedCount} expired authorization codes.`);
   * ```
   */

  cleanupExpired(): Promise<number>;
}
