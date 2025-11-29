import { TokenEntity } from '@/domain';

/**
 * Interface for managing OAuth2 tokens in a repository.
 *
 * Provides methods for saving tokens, checking if a token is blacklisted,
 * and blacklisting tokens.
 *
 * @interface ITokenRepository
 */

export interface ITokenRepository {
  /**
   * Save Token
   *
   * @param {TokenEntity} token - Token Entity to be saved
   * @return {*}  {Promise<void>} - Promise indicating completion
   * @memberof ITokenRepository
   */

  saveToken(token: TokenEntity): Promise<void>;

  /**
   * Find by Token ID
   *
   * @param {string} tokenId - Token Identifier
   * @return {*}  {(Promise<TokenEntity | null>)} - Promise resolving to the Token Entity or null if not found
   * @memberof ITokenRepository
   */

  findByTokenId(tokenId: string): Promise<TokenEntity | null>;

  /**
   * Is Blacklisted
   *
   * @param {string} tokenId - Token Identifier
   * @return {*}  {Promise<boolean>} - Promise resolving to true if token is blacklisted, false otherwise
   * @memberof ITokenRepository
   */

  isBlacklisted(tokenId: string): Promise<boolean>;

  /**
   * Blacklist Token
   *
   * @param {string} tokenId - Token Identifier
   * @return {*}  {Promise<void>} - Promise indicating completion
   * @memberof ITokenRepository
   */
  blacklistToken(tokenId: string): Promise<void>;
}
