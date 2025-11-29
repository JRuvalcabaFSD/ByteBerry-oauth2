/**
 * Represents a user entity within the domain layer.
 *
 * @remarks
 * This class is used to encapsulate user-related data and behavior, such as user identification,
 * email, username, password hash, and creation date. The constructor is private to enforce the use
 * of the static {@link UserEntity.create} method for instantiation.
 *
 * @property id - The unique identifier for the user.
 * @property email - The user's email address.
 * @property userName - The user's display name, or `null` if not set.
 * @property passwordHash - The hashed password, or `null` if not set.
 * @property createdAt - The date and time when the user was created.
 *
 * @method create - Static factory method to create a new {@link UserEntity} instance.
 * @method getPasswordHash - Returns the user's password hash, or `null` if not set.
 * @method hasPassword - Returns `true` if the user has a password hash set, otherwise `false`.
 */

export class UserEntity {
  private constructor(
    public readonly id: string,
    public readonly email: string,
    public readonly username: string | null,
    public readonly passwordHash: string | null,
    public readonly createdAt: Date
  ) {}

  /**
   * Creates a new instance of the UserEntity class with the provided parameters.
   *
   * @param params - An object containing the properties required to create a UserEntity.
   * @param params.id - The unique identifier for the user.
   * @param params.email - The email address of the user.
   * @param params.userName - (Optional) The username of the user.
   * @param params.passwordHash - (Optional) The hashed password of the user, or null.
   * @param params.createdAt - (Optional) The date and time when the user was created. Defaults to the current date and time if not provided.
   * @returns A new UserEntity instance initialized with the given parameters.
   */

  static create(params: {
    id: string;
    email: string;
    username?: string | null;
    passwordHash?: string | null;
    createdAt?: Date;
  }): UserEntity {
    return new UserEntity(params.id, params.email, params.username || null, params.passwordHash || null, params.createdAt || new Date());
  }

  /**
   * Retrieves the hashed password associated with the user.
   *
   * @returns The password hash as a string, or `null` if not set.
   */

  public getPasswordHash(): string | null {
    return this.passwordHash;
  }

  /**
   * Determines whether the user has a password set.
   *
   * @returns {boolean} `true` if the user has a password hash, otherwise `false`.
   */

  public hasPassword(): boolean {
    return this.passwordHash !== null;
  }
}
