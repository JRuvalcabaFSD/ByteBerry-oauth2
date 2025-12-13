/**
 * Represents the parameters required to create or update a user entity.
 *
 * @property id - The unique identifier for the user.
 * @property email - The user's email address.
 * @property username - (Optional) The user's username. Can be null.
 * @property passwordHash - (Optional) The hashed password of the user. Can be null.
 * @property createdAt - (Optional) The date and time when the user was created.
 */

interface UserParams {
	id: string;
	email: string;
	username?: string | null;
	passwordHash?: string | null;
	createdAt?: Date;
}

/**
 * Represents a user entity within the domain layer.
 * Encapsulates user-related properties and provides factory and utility methods.
 *
 * @remarks
 * This class is intended to be instantiated via the static {@link UserEntity.create} method.
 *
 * @property id - The unique identifier for the user.
 * @property email - The user's email address.
 * @property userName - The user's display name or username, or null if not set.
 * @property passwordHash - The hashed password for the user, or null if not set.
 * @property createAt - The date and time when the user was created.
 *
 * @method create - Factory method to instantiate a {@link UserEntity} from parameters.
 * @method getPasswordHas - Retrieves the user's password hash, or null if not set.
 * @method hasPassword - Indicates whether the user has a password set.
 */

export class UserEntity {
	/**
	 * Creates a new instance of the User entity.
	 *
	 * @param id - The unique identifier for the user.
	 * @param email - The user's email address.
	 * @param username - The user's display name, or null if not set.
	 * @param passwordHash - The hashed password, or null if not set.
	 * @param createAt - The date and time when the user was created.
	 */

	private constructor(
		public readonly id: string,
		public readonly email: string,
		public readonly username: string | null,
		public readonly passwordHash: string | null,
		public readonly createAt: Date
	) {}

	/**
	 * Creates a new instance of the UserEntity class using the provided parameters.
	 *
	 * @param params - An object containing the properties required to create a UserEntity.
	 * @param params.id - The unique identifier for the user.
	 * @param params.email - The email address of the user.
	 * @param params.username - (Optional) The username of the user.
	 * @param params.passwordHash - (Optional) The hashed password of the user.
	 * @param params.createdAt - (Optional) The date and time when the user was created. Defaults to the current date and time if not provided.
	 * @returns A new UserEntity instance initialized with the provided parameters.
	 */

	public static create(params: UserParams) {
		const { id, email, username, passwordHash, createdAt } = params;
		return new UserEntity(id, email, username || null, passwordHash || null, createdAt || new Date());
	}

	/**
	 * Retrieves the hashed password associated with the user.
	 *
	 * @returns The password hash as a string, or null if not set.
	 */

	public getPasswordHas(): string | null {
		return this.passwordHash;
	}

	/**
	 * Determines whether the user has a password set.
	 *
	 * @returns {boolean} `true` if the user has a password hash; otherwise, `false`.
	 */

	public hasPassword(): boolean {
		return this.passwordHash !== null;
	}
}
