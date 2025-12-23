/**
 * Represents the properties of a user entity.
 *
 * @property id - Unique identifier for the user.
 * @property email - The user's email address.
 * @property username - The user's username, or null if not set.
 * @property passwordHash - The hashed password of the user.
 * @property fullName - The user's full name, or null if not set.
 * @property roles - An array of roles assigned to the user.
 * @property isActive - Indicates whether the user account is active.
 * @property emailVerified - Indicates whether the user's email has been verified.
 * @property createdAt - The date and time when the user was created.
 * @property updatedAt - The date and time when the user was last updated.
 */

export interface UserProps {
	id: string;
	email: string;
	username: string | null;
	passwordHash: string;
	fullName: string | null;
	roles: string[];
	isActive: boolean;
	emailVerified: boolean;
	createdAt: Date;
	updatedAt: Date;
}

/**
 * Represents a user entity within the domain layer.
 * Encapsulates user-related properties and domain logic such as role checks and password validation.
 *
 * @remarks
 * This class uses a private constructor and a static factory method (`create`) to enforce controlled instantiation.
 *
 * @property {string} id - Unique identifier for the user.
 * @property {string} email - User's email address (stored in lowercase and trimmed).
 * @property {string | null} username - Optional username for the user.
 * @property {string} passwordHash - Hashed password for authentication.
 * @property {string | null} fullName - Optional full name of the user.
 * @property {string[]} roles - List of roles assigned to the user.
 * @property {boolean} isActive - Indicates if the user account is active.
 * @property {boolean} emailVerified - Indicates if the user's email has been verified.
 * @property {Date} createdAt - Timestamp of when the user was created.
 * @property {Date} updatedAt - Timestamp of the last update to the user.
 *
 * @method create - Factory method to instantiate a new UserEntity.
 * @method validatePassword - Validates a plain password against the stored password hash.
 * @method hasRole - Checks if the user has a specific role.
 * @method hasAnyRoles - Checks if the user has any of the specified roles.
 * @method canLogin - Determines if the user is allowed to log in.
 * @method toPublic - Returns a public representation of the user, omitting sensitive fields.
 */

export class UserEntity {
	private constructor(
		public readonly id: string,
		public readonly email: string,
		public readonly username: string | null,
		public readonly passwordHash: string,
		public readonly fullName: string | null,
		public readonly roles: string[],
		public readonly isActive: boolean,
		public readonly emailVerified: boolean,
		public readonly createdAt: Date,
		public readonly updatedAt: Date
	) {}

	/**
	 * Creates a new instance of the UserEntity with the provided properties.
	 *
	 * @param props - The properties required to create a UserEntity.
	 *   - `id`: The unique identifier for the user.
	 *   - `email`: The user's email address.
	 *   - `username`: (Optional) The user's username.
	 *   - `passwordHash`: The hashed password of the user.
	 *   - `fullName`: (Optional) The user's full name.
	 *   - `roles`: (Optional) The roles assigned to the user. Defaults to `['user']`.
	 *   - `isActive`: (Optional) Indicates if the user is active. Defaults to `true`.
	 *   - `emailVerified`: (Optional) Indicates if the user's email is verified. Defaults to `false`.
	 *   - `createdAt`: (Optional) The creation date of the user. Defaults to the current date.
	 *   - `updatedAt`: (Optional) The last update date of the user. Defaults to the current date.
	 * @returns A new UserEntity instance with normalized and defaulted properties.
	 *
	 * @example
	 * const user = UserEntity.create({
	 *   id: '123',
	 *   email: '
	 */

	public static create(props: UserProps): UserEntity {
		const now = new Date();

		return new UserEntity(
			props.id,
			props.email.toLowerCase().trim(),
			props.username ?? null,
			props.passwordHash,
			props.fullName ?? null,
			props.roles ?? ['user'],
			props.isActive ?? true,
			props.emailVerified ?? false,
			props.createdAt ?? now,
			props.updatedAt ?? now
		);
	}

	/**
	 * Validates whether the provided plain text password matches the stored password hash.
	 *
	 * @param plainPassword - The plain text password to validate.
	 * @returns `true` if the plain password matches the stored password hash; otherwise, `false`.
	 *
	 * @example
	 * const isValid = user.validatePassword('userInputPassword');
	 */

	public validatePassword(plainPassword: string): boolean {
		return this.passwordHash === plainPassword;
	}

	/**
	 * Checks if the user possesses a specific role.
	 *
	 * @param role - The name of the role to check for.
	 * @returns `true` if the user has the specified role; otherwise, `false`.
	 * @example
	 * const isAdmin = user.hasRole('admin');
	 */

	public hasRole(role: string): boolean {
		return this.roles.includes(role);
	}

	/**
	 * Checks if the user has at least one of the specified roles.
	 *
	 * @param roles - An array of role names to check against the user's roles.
	 * @returns `true` if the user has any of the specified roles, otherwise `false`.
	 *
	 * @example
	 * const hasAccess = user.hasAnyRoles(['admin', 'editor']);
	 */

	public hasAnyRoles(roles: string[]): boolean {
		return roles.some((role) => this.roles.includes(role));
	}

	/**
	 * Determines whether the user is allowed to log in.
	 *
	 * @returns {boolean} `true` if the user is active and can log in; otherwise, `false`.
	 *
	 * @example
	 * const canUserLogin = user.canLogin();
	 */

	public canLogin(): boolean {
		return this.isActive;
	}

	/**
	 * Returns a public representation of the user by omitting the `passwordHash` property.
	 * This method is useful for exposing user data without sensitive information.
	 *
	 * @returns An object containing all user properties except `passwordHash`.
	 *
	 * @example
	 * const publicUser = user.toPublic();
	 */

	public toPublic(): Omit<UserProps, 'passwordHash'> {
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const { passwordHash, ...rest } = this;
		return { ...rest };
	}
}
