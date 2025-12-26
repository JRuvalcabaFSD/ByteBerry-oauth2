import { SessionEntity, UserEntity } from '@domain';

/**
 * Represents a user entity with identification, contact information, and roles.
 *
 * @property {string} id - Unique identifier for the user.
 * @property {string} email - Email address of the user.
 * @property {string | null} username - Optional username for the user.
 * @property {string | null} fullName - Optional full name of the user.
 * @property {string[]} roles - List of roles assigned to the user.
 */

interface User {
	id: string;
	email: string;
	username: string | null;
	fullName: string | null;
	roles: string[];
}

/**
 * Represents the response data returned after a successful login.
 *
 * @property sessionId - Unique identifier for the user's session.
 * @property user - The authenticated user information.
 * @property expiresAt - The date and time when the session expires.
 * @property message - Additional message regarding the login process.
 */

interface LoginResponseData {
	sessionId: string;
	user: User;
	expiresAt: Date;
	message: string;
}

/**
 * Represents the response returned after a successful login operation.
 *
 * @remarks
 * This DTO encapsulates session information, user details, expiration time, and a message.
 *
 * @property sessionId - The unique identifier for the user's session.
 * @property user - The public representation of the authenticated user.
 * @property expiresAt - The date and time when the session expires.
 * @property message - A message describing the login result.
 *
 * @constructor
 * Creates a new instance of `LoginResponseDTO` using the provided data.
 *
 * @method static fromEntities
 * Constructs a `LoginResponseDTO` from user and session entities.
 *
 * @method toJson
 * Serializes the response to a JSON-compatible object, formatting the expiration date as an ISO string.
 */

export class LoginResponseDTO {
	public readonly sessionId!: string;
	public readonly user!: User;
	public readonly expiresAt!: Date;
	public readonly message!: string;

	constructor(data: LoginResponseData) {
		Object.assign(this, { ...data, message: data.message ?? 'Login successful' });
	}

	/**
	 * Creates a new instance of `LoginResponseDTO` from the provided `UserEntity` and `SessionEntity`.
	 *
	 * @param user - The user entity containing user information.
	 * @param session - The session entity containing session details.
	 * @returns A `LoginResponseDTO` populated with session ID, public user data, session expiration, and a success message.
	 */

	static fromEntities(user: UserEntity, session: SessionEntity): LoginResponseDTO {
		return new LoginResponseDTO({
			sessionId: session.id,
			user: user.toPublic(),
			expiresAt: session.expiresAt,
			message: 'Login successful',
		});
	}

	/**
	 * Converts the login response DTO to a JSON object.
	 *
	 * @returns An object containing the user, the expiration date as an ISO string, and a message.
	 */

	public toJson(): { user: User; expiresAt: string; message: string } {
		return {
			user: this.user,
			expiresAt: this.expiresAt.toISOString(),
			message: this.message,
		};
	}
}
