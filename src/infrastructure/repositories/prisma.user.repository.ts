import { compare } from 'bcrypt';
import { PrismaClient } from '@prisma/client';

import { ILogger, IUserRepository } from '@interfaces';
import { UserMapper } from '@infrastructure';
import { handledPrismaError } from '@shared';
import { UserEntity } from '@domain';

/**
 * Repository implementation for user-related operations using Prisma ORM.
 *
 * @implements {IUserRepository}
 *
 * @remarks
 * This class provides methods to register users, find users by email or ID, and authenticate users.
 * It uses a PrismaClient instance for database interactions and an ILogger for logging.
 * All methods handle and rethrow errors using a custom Prisma error handler.
 *
 * @constructor
 * @param client - The PrismaClient instance for database access.
 * @param logger - The ILogger instance for logging actions and errors.
 *
 * @method register
 * Registers a new user in the database.
 * @param user - The UserEntity to register.
 * @returns Promise<void>
 *
 * @method finByEmail
 * Finds a user by their email address.
 * @param email - The email address to search for.
 * @returns Promise<UserEntity | null>
 *
 * @method findById
 * Finds a user by their unique ID.
 * @param id - The user ID to search for.
 * @returns Promise<UserEntity | null>
 *
 * @method authenticate
 * Authenticates a user by email and password.
 * @param email - The user's email address.
 * @param password - The user's password.
 * @returns Promise<UserEntity | null>
 */

export class PrismaUserRepository implements IUserRepository {
	/**
	 * Creates an instance of the repository with the provided Prisma client and logger.
	 *
	 * @param client - The PrismaClient instance used for database operations.
	 * @param logger - The ILogger instance used for logging activities.
	 */

	constructor(
		private readonly client: PrismaClient,
		private readonly logger: ILogger
	) {}

	/**
	 * Registers a new user in the database.
	 *
	 * @param user - The user entity to be registered.
	 * @returns A promise that resolves when the user has been successfully registered.
	 * @throws Throws a handled Prisma error if the registration fails.
	 */

	public async register(user: UserEntity): Promise<void> {
		try {
			const data = UserMapper.toPersistence(user);
			await this.client.user.create({ data });
			this.logger.info('User registered successfully', { email: user.email });
		} catch (error) {
			throw handledPrismaError(error);
		}
	}
	/**
	 * Finds a user by their email address.
	 *
	 * @param email - The email address of the user to find.
	 * @returns A promise that resolves to a `UserEntity` if found, or `null` if no user exists with the given email.
	 * @throws Throws a handled Prisma error if the database operation fails.
	 */

	public async finByEmail(email: string): Promise<UserEntity | null> {
		try {
			const record = await this.client.user.findUnique({ where: { email } });
			if (!record) {
				this.logger.debug('User not found', { email });
				return null;
			}
			this.logger.info('find User in database', { user: record.username });
			return UserMapper.toDomain(record);
		} catch (error) {
			throw handledPrismaError(error);
		}
	}

	/**
	 * Retrieves a user by their unique identifier.
	 *
	 * @param id - The unique identifier of the user to find.
	 * @returns A promise that resolves to a `UserEntity` if found, or `null` if no user exists with the given ID.
	 * @throws Throws a handled Prisma error if the database operation fails.
	 */

	public async findById(id: string): Promise<UserEntity | null> {
		try {
			const record = await this.client.user.findUnique({ where: { id } });
			if (!record) {
				this.logger.debug('User not found', { id });
				return null;
			}
			this.logger.info('find User in database', { user: record.username });
			return UserMapper.toDomain(record);
		} catch (error) {
			throw handledPrismaError(error);
		}
	}

	/**
	 * Authenticates a user by their email and password.
	 *
	 * Attempts to find a user by the provided email and verifies the password.
	 * Logs authentication attempts and returns the user entity if authentication is successful.
	 * Returns `null` if authentication fails due to incorrect email or password.
	 * Throws a handled Prisma error if an exception occurs during the process.
	 *
	 * @param email - The email address of the user attempting to authenticate.
	 * @param password - The plaintext password provided by the user.
	 * @returns A promise that resolves to the authenticated `UserEntity` or `null` if authentication fails.
	 */

	public async authenticate(email: string, password: string): Promise<UserEntity | null> {
		let isValid: boolean = false;

		try {
			const user = await this.finByEmail(email);
			if (user && user.hasPassword()) {
				isValid = await compare(password, user.getPasswordHas()!);
			}

			if (!isValid || !user) {
				this.logger.warn('Authentication failed, email or password is incorrect');
				return null;
			}

			this.logger.info('User authenticated successfully', { email });
			return user;
		} catch (error) {
			throw handledPrismaError(error);
		}
	}
}
