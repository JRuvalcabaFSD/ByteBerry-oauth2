import { TokenEntity } from '@domain';

/**
 * Repository interface for managing OAuth2 tokens and their lifecycle.
 *
 * Provides methods for storing, retrieving, and managing token blacklisting
 * to handle token revocation and security concerns.
 *
 * @interface ITokenRepository
 */

export interface ITokenRepository {
	/**
	 *  Saves a token entity to the repository.
	 *
	 * @param {TokenEntity} token - The token entity to be saved.
	 * @return {*}  {Promise<void>} - A promise that resolves when the token is saved.
	 * @memberof ITokenRepository
	 */

	saveToken(token: TokenEntity): Promise<void>;

	/**
	 * Finds a token by its ID.
	 *
	 * @param {string} tokenId - The ID of the token to be retrieved.
	 * @return {*}  {(Promise<TokenEntity | null>)} - A promise that resolves to the token entity if found, or null if not found.
	 * @memberof ITokenRepository
	 */

	findByTokenId(tokenId: string): Promise<TokenEntity | null>;

	/**
	 * Checks if a token is blacklisted.
	 *
	 * @param {string} tokenId - The ID of the token to check.
	 * @return {*}  {Promise<boolean>} - A promise that resolves to true if the token is blacklisted, false otherwise.
	 * @memberof ITokenRepository
	 */

	isBlacklisted(tokenId: string): Promise<boolean>;

	/**
	 * Blacklists a token by its ID.
	 *
	 * @param {string} tokenId - The ID of the token to be blacklisted.
	 * @return {*}  {Promise<void>} - A promise that resolves when the token is blacklisted.
	 * @memberof ITokenRepository
	 */

	blacklistToken(tokenId: string): Promise<void>;
}
