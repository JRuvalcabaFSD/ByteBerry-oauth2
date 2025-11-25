import { PrismaClient } from 'generated/prisma/client';
import { compare } from 'bcrypt';

import { ILogger, IUserMapper, IUserRepository } from '@/interfaces';
import { handledPrismaError } from '@/shared';
import { UserEntity } from '@/domain';

/**
 * Repository implementation for managing user entities using Prisma ORM.
 *
 * @implements {IUserRepository}
 *
 * @remarks
 * This class provides methods for registering users, finding users by email or ID,
 * and authenticating users. It uses a mapper to convert between domain and persistence models,
 * a Prisma client for database operations, and a logger for logging actions.
 *
 * @constructor
 * @param {IUserMapper} mapper - Mapper for converting between domain and persistence models.
 * @param {PrismaClient} client - Prisma client instance for database access.
 * @param {ILogger} logger - Logger instance for logging repository actions.
 *
 * @method register Registers a new user in the database.
 * @method findByEmail Finds a user by their email address.
 * @method findById Finds a user by their unique identifier.
 * @method authenticate Authenticates a user by email and password.
 */

export class UserRepository implements IUserRepository {
  /**
   * Creates an instance of the repository.
   *
   * @param mapper - The user entity to persistence model mapper.
   * @param client - The Prisma client instance for database operations.
   * @param logger - The logger instance for logging repository actions.
   */

  constructor(
    private readonly mapper: IUserMapper,
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
      const data = this.mapper.toPersistence(user);
      await this.client.user.create({ data });
      this.logger.debug('User registered successfully', { email: user.email });
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

  public async findByEmail(email: string): Promise<UserEntity | null> {
    try {
      const record = await this.client.user.findUnique({ where: { email } });
      if (!record) return null;
      return this.mapper.toDomain(record);
    } catch (error) {
      throw handledPrismaError(error);
    }
  }

  /**
   * Retrieves a user entity by its unique identifier.
   *
   * @param id - The unique identifier of the user to retrieve.
   * @returns A promise that resolves to the corresponding {@link UserEntity} if found, or `null` if no user exists with the given ID.
   * @throws Throws a handled Prisma error if the database operation fails.
   */

  public async findById(id: string): Promise<UserEntity | null> {
    try {
      const record = await this.client.user.findUnique({ where: { id } });
      if (!record) return null;
      return this.mapper.toDomain(record);
    } catch (error) {
      throw handledPrismaError(error);
    }
  }

  /**
   * Authenticates a user by verifying the provided email and password.
   *
   * @param email - The email address of the user attempting to authenticate.
   * @param password - The plaintext password provided by the user.
   * @returns A promise that resolves to the authenticated UserEntity if credentials are valid, or null otherwise.
   * @throws Throws a handled Prisma error if an exception occurs during authentication.
   */

  public async authenticate(email: string, password: string): Promise<UserEntity | null> {
    try {
      const user = await this.findByEmail(email);
      if (!user || !user.hasPassword()) return null;

      const isValid = await compare(password, user.getPasswordHash()!);
      if (!isValid) return null;

      this.logger.debug('User authenticated successfully', { email });
      return user;
    } catch (error) {
      throw handledPrismaError(error);
    }
  }
}
