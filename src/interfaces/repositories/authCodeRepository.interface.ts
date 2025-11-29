import { AuthorizationCodeEntity } from '@/domain';

/**
 * Interface for managing authorization codes in an OAuth2 implementation.
 *
 * Provides methods to save, retrieve, and clean up authorization codes.
 *
 * @interface IAuthorizationCodeRepository
 */

export interface IAuthorizationCodeRepository {
  /**
   * Saves an authorization code entity to the repository.
   *
   * @param {AuthorizationCodeEntity} code - The authorization code entity to be saved.
   * @return {*}  {Promise<void>} A promise that resolves when the code has been successfully saved.
   * @memberof IAuthorizationCodeRepository
   */

  save(code: AuthorizationCodeEntity): Promise<void>;

  /**
   * Finds an authorization code entity by its code string.
   *
   * @param {string} code - The code string to search for.
   * @return {*}  {(Promise<AuthorizationCodeEntity | null>)} A promise that resolves to the found authorization code entity, or null if not found.
   * @memberof IAuthorizationCodeRepository
   */

  findByCode(code: string): Promise<AuthorizationCodeEntity | null>;

  /**
   * Cleans up expired or used authorization codes from the repository.
   *
   * @return {*}  {Promise<void>} A promise that resolves when the cleanup operation is complete.
   * @memberof IAuthorizationCodeRepository
   */

  cleanup(): Promise<void>;
}
