/**
 * Represents the data associated with a user session.
 *
 * @property id - Unique identifier for the session.
 * @property userId - Identifier of the user associated with the session.
 * @property createdAt - Timestamp indicating when the session was created.
 * @property expiresAt - Timestamp indicating when the session will expire.
 * @property userAgent - (Optional) The user agent string of the client initiating the session.
 * @property ipAddress - (Optional) The IP address from which the session was created.
 * @property metadata - (Optional) Additional metadata related to the session.
 */

interface SessionData {
	id: string;
	userId: string;
	createdAt: Date;
	expiresAt: Date;
	userAgent?: string | null;
	ipAddress?: string | null;
	metadata?: Record<string, unknown>;
}

/**
 * Defines the properties required to create or represent a session entity.
 *
 * Extends all properties from `SessionData` except for `ttlSeconds`, `userAgent`, `ipAddress`, `metadata`, `createdAt`, and `expiresAt`.
 *
 * @property {number} [ttlSeconds] - Optional. The time-to-live for the session in seconds.
 * @property {string | null} [userAgent] - Optional. The user agent string associated with the session, or null if not available.
 * @property {string | null} [ipAddress] - Optional. The IP address from which the session was created, or null if not available.
 * @property {Record<string, unknown>} [metadata] - Optional. Additional metadata associated with the session.
 */
interface SessionProps extends Omit<SessionData, 'ttlSeconds' | 'userAgent' | 'ipAddress' | 'metadata' | 'createdAt' | 'expiresAt'> {
	ttlSeconds?: number;
	userAgent?: string | null;
	ipAddress?: string | null;
	metadata?: Record<string, unknown>;
}

/**
 * Represents a user session within the authentication domain.
 *
 * The `SessionEntity` encapsulates all relevant information about a session,
 * including its unique identifier, associated user, creation and expiration times,
 * client metadata, and utility methods for session management.
 *
 * Use the static `create` method to instantiate a new session, and instance methods
 * such as `isExpired`, `isValid`, `getRemainingSeconds`, and `extend` to manage session lifecycle.
 *
 * @property {string} id - Unique identifier for the session.
 * @property {string} userId - Identifier of the user associated with the session.
 * @property {Date} createdAt - Timestamp when the session was created.
 * @property {Date} expiresAt - Timestamp when the session will expire.
 * @property {string | null} userAgent - User agent string of the client, if available.
 * @property {string | null} ipAddress - IP address of the client, if available.
 * @property {Record<string, unknown>} metadata - Additional metadata associated with the session.
 *
 * @method create - Static factory method to create a new session.
 * @method isExpired - Returns `true` if the session has expired.
 * @method isValid - Returns `true` if the session is still valid (not expired).
 * @method getRemainingSeconds - Returns the number of seconds until the session expires.
 * @method extend - Returns a new session entity with an extended expiration time.
 * @method toObject - Serializes the session entity to a plain object.
 */

export class SessionEntity {
	public readonly id!: string;
	public readonly userId!: string;
	public readonly createdAt!: Date;
	public readonly expiresAt!: Date;
	public readonly userAgent!: string | null;
	public readonly ipAddress!: string | null;
	public readonly metadata!: Record<string, unknown>;

	/**
	 * Creates a new instance of the Session entity with the provided session data.
	 *
	 * This private constructor assigns all properties from the given `SessionData` object
	 * to the instance. If `userAgent` or `ipAddress` are not provided, they default to `null`.
	 * If `metadata` is not provided, it defaults to an empty object.
	 *
	 * @param data - The session data used to initialize the session entity.
	 */

	private constructor(data: SessionData) {
		Object.assign(this, {
			...data,
			userAgent: data.userAgent ?? null,
			ipAddress: data.ipAddress ?? null,
			metadata: data.metadata ?? {},
		});
	}

	/**
	 * Creates a new instance of `SessionEntity` with the provided properties.
	 *
	 * @param props - The properties required to create a session, including user ID, optional TTL, user agent, IP address, and metadata.
	 * @returns A new `SessionEntity` object initialized with the current timestamp and calculated expiration time.
	 */

	public static create(props: SessionProps): SessionEntity {
		const now = new Date();
		const ttl = props.ttlSeconds ?? 3600;

		return new SessionEntity({
			id: props.id,
			userId: props.userId,
			createdAt: now,
			expiresAt: new Date(now.getTime() + ttl * 1000),
			userAgent: props.userAgent,
			ipAddress: props.ipAddress,
			metadata: props.metadata,
		});
	}

	/**
	 * Determines whether the session has expired.
	 *
	 * @returns {boolean} `true` if the current date and time is after the session's expiration date (`expiresAt`), otherwise `false`.
	 */

	public isExpired(): boolean {
		return new Date() > this.expiresAt;
	}

	/**
	 * Determines whether the session is currently valid.
	 *
	 * @returns {boolean} `true` if the session is not expired; otherwise, `false`.
	 */

	public isValid(): boolean {
		return !this.isExpired();
	}

	/**
	 * Calculates the number of seconds remaining until the session expires.
	 *
	 * @returns {number} The number of seconds remaining until expiration. Returns 0 if the session has already expired.
	 */

	public getRemainingSeconds(): number {
		const remaining = Math.floor((this.expiresAt.getTime() - Date.now()) / 1000);
		return Math.max(0, remaining);
	}

	/**
	 * Returns a new `SessionEntity` instance with the expiration time extended by the specified number of seconds.
	 *
	 * @param ttlSeconds - The number of seconds to extend the session's expiration time.
	 * @returns A new `SessionEntity` with the updated `expiresAt` property.
	 */

	public extend(ttlSeconds: number): SessionEntity {
		return new SessionEntity({
			id: this.id,
			userId: this.userId,
			createdAt: this.createdAt,
			expiresAt: new Date(Date.now() + ttlSeconds * 1000),
			userAgent: this.userAgent,
			ipAddress: this.ipAddress,
			metadata: this.metadata,
		});
	}

	/**
	 * Converts the current Session entity instance into a plain object
	 * conforming to the SessionData interface. This method is useful for
	 * serializing the session data or transferring it across application layers.
	 *
	 * @returns {SessionData} An object containing the session's id, userId,
	 * createdAt, expiresAt, userAgent, ipAddress, and metadata.
	 */

	public toObject(): SessionData {
		return {
			id: this.id,
			userId: this.userId,
			createdAt: this.createdAt,
			expiresAt: this.expiresAt,
			userAgent: this.userAgent,
			ipAddress: this.ipAddress,
			metadata: this.metadata,
		};
	}
}
