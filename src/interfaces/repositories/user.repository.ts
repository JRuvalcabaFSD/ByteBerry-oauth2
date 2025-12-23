import { UserEntity } from '@domain';

/**
 * Interface for user repository operations.
 *
 * Provides methods to retrieve and validate user entities based on various identifiers.
 *
 * @remarks
 * Implementations of this interface should handle data access and user credential validation logic.
 *
 * @method findByEmail
 * Retrieves a user entity by their email address.
 * @param email - The email address of the user.
 * @returns A promise that resolves to the user entity or undefined if not found.
 *
 * @method findByUserName
 * Retrieves a user entity by their username.
 * @param username - The username of the user.
 * @returns A promise that resolves to the user entity or undefined if not found.
 *
 * @method findById
 * Retrieves a user entity by their unique identifier.
 * @param id - The unique identifier of the user.
 * @returns A promise that resolves to the user entity or undefined if not found.
 *
 * @method validateCredentials
 * Validates user credentials using either email or username and a password.
 * @param emailOrUsername - The email address or username of the user.
 * @param password - The user's password.
 * @returns A promise that resolves to the user entity if credentials are valid, or undefined otherwise.
 */

export interface IUserRepository {
	findByEmail(email: string): Promise<UserEntity | undefined>;
	findByUserName(username: string): Promise<UserEntity | undefined>;
	findById(id: string): Promise<UserEntity | undefined>;
	validateCredentials(emailOrUsername: string, password: string): Promise<UserEntity | undefined>;
}
