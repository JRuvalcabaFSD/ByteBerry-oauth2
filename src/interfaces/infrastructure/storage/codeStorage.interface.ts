import { AuthorizationCodeEntity } from '@/domain';

/**
 * Interface for managing authorization code state storage.
 *
 * Provides methods to store, retrieve, check existence, and cleanup authorization codes.
 * This interface is typically implemented by storage mechanisms that maintain the lifecycle
 * of authorization codes during the OAuth2 authorization flow.
 *
 * @interface ICodeStore
 */

export interface ICodeStore {
  /**
   * Sets the authorization code in the state.
   *
   * @param {string} code - The authorization code string.
   * @param {AuthorizationCodeEntity} authCode - The authorization code entity associated with the code.
   * @memberof ICodeStore
   */

  set(code: string, authCode: AuthorizationCodeEntity): void;

  /**
   * Retrieves the authorization code from the state.
   *
   * @param {string} code - The authorization code string.
   * @return {*}  {(AuthorizationCodeEntity | undefined)} - The authorization code entity if found, otherwise undefined.
   * @memberof ICodeStore
   */

  get(code: string): AuthorizationCodeEntity | undefined;

  /**
   * Checks if the authorization code exists in the state.
   *
   * @param {string} code - The authorization code string.
   * @return {*}  {boolean} - True if the code exists, otherwise false.
   * @memberof ICodeStore
   */

  has(code: string): boolean;

  /**
   * Cleans up expired authorization codes from the state.
   *
   * @memberof ICodeStore
   */

  cleanedExpired(): void;

  /**
   * Shuts down the authorization code state management.
   *
   * @memberof ICodeStore
   */
  shutdown(): void;
}
