import { User } from 'generated/prisma/client';

import { UserEntity } from '@/domain';
import { IUserMapper } from '@/interfaces';

/**
 * Maps between persistence User records and domain UserEntity objects.
 *
 * @implements {IUserMapper}
 *
 * @remarks
 * This class provides methods to convert User records from the persistence layer
 * into domain entities and vice versa. It handles the transformation of fields,
 * such as mapping the `password` field from the persistence model to the
 * `passwordHash` property in the domain entity.
 *
 * @method toDomain
 * Converts a persistence User record to a domain UserEntity.
 * @param {User} record - The persistence User record.
 * @returns {UserEntity} The corresponding domain UserEntity.
 *
 * @method toPersistence
 * Converts a domain UserEntity to a persistence User object (excluding id, createdAt, and updatedAt).
 * @param {UserEntity} entity - The domain UserEntity.
 * @returns {Omit<User, 'id' | 'createdAt' | 'updatedAt'>} The persistence User object.
 */

export class UserMapper implements IUserMapper {
  /**
   * Maps a persistence User record to a UserEntity domain object.
   *
   * @param record - The User record from the data source.
   * @returns A UserEntity instance created from the provided record.
   */

  public toDomain(record: User): UserEntity {
    const { id, email, username, password, createdAt } = record;
    return UserEntity.create({
      id,
      email,
      username,
      passwordHash: password,
      createdAt,
    });
  }

  /**
   * Maps a UserEntity domain object to a persistence-ready User object,
   * omitting the 'id', 'createdAt', and 'updatedAt' fields.
   *
   * @param entity - The UserEntity instance to be mapped.
   * @returns An object containing the user's email, username, and hashed password,
   *          suitable for database persistence.
   */

  public toPersistence(entity: UserEntity): Omit<User, 'createdAt' | 'updatedAt'> {
    const { id, email, username } = entity;
    return {
      id,
      email,
      username,
      password: entity.getPasswordHash(),
    };
  }
}

/**
 * Factory function to create a new instance of the `UserMapper` class.
 *
 * @returns {UserMapper} A new `UserMapper` instance.
 */

export const createUserMapper = () => new UserMapper();
