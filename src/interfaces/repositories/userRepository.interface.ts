import { UserEntity } from '@/domain';

/**
 * Interface for user repository operations.
 *
 * Defines the contract for user-related data access methods, such as registration,
 * authentication, and retrieval by email or ID.
 */

export interface IUserRepository {
  /**
   * Registers a new user in the repository.
   *
   * @param {UserEntity} user - The user entity to be registered.
   * @return {*}  {Promise<void>} - A promise that resolves when the user is successfully registered.
   * @memberof IUserRepository
   */

  register(user: UserEntity): Promise<void>;

  /**
   * Finds a user by their email address.
   *
   * @param {string} email - The email address of the user to find.
   * @return {*}  {(Promise<UserEntity | null>)} - A promise that resolves to the user entity if found, or null if not found.
   * @memberof IUserRepository
   */

  findByEmail(email: string): Promise<UserEntity | null>;

  /**
   * Finds a user by their unique identifier.
   *
   * @param {string} id - The unique identifier of the user to find.
   * @return {*}  {(Promise<UserEntity | null>)} - A promise that resolves to the user entity if found, or null if not found.
   * @memberof IUserRepository
   */

  findById(id: string): Promise<UserEntity | null>;

  /**
   * Authenticates a user using their email and password.
   *
   * @param {string} email - The email address of the user.
   * @param {string} password - The password of the user.
   * @return {*}  {(Promise<UserEntity | null>)} - A promise that resolves to the user entity if authentication is successful, or null if it fails.
   * @memberof IUserRepository
   */

  authenticate(email: string, password: string): Promise<UserEntity | null>;
}
