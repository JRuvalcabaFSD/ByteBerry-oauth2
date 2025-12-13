import { UserEntity } from '@domain';
import { User } from '@prisma/client';

/**
 * Maps between Prisma User records and domain UserEntity objects.
 *
 * Provides static methods to convert from persistence (database) models
 * to domain entities and vice versa, ensuring proper transformation of
 * sensitive fields such as passwords.
 *
 * @remarks
 * - `toDomain` converts a Prisma `User` record to a `UserEntity`, mapping
 *   the `password` field to `passwordHash` and omitting it from the rest.
 * - `toPersistence` converts a `UserEntity` back to a format suitable for
 *   persistence, extracting the password hash and spreading entity properties.
 */
export class UserMapper {
	/**
	 * Maps a Prisma `User` record to a domain `UserEntity`.
	 *
	 * @param record - The Prisma `User` record to map.
	 * @returns A new `UserEntity` instance with the password mapped to `passwordHash`.
	 */

	public static toDomain(record: User): UserEntity {
		const { password, ...rest } = record;
		return UserEntity.create({ passwordHash: password, ...rest });
	}

	/**
	 * Maps a UserEntity domain object to a persistence-ready User object,
	 * omitting the 'createdAt' and 'updatedAt' fields. The returned object
	 * includes the user's hashed password under the 'password' property,
	 * along with all other properties from the entity.
	 *
	 * @param entity - The UserEntity instance to be mapped.
	 * @returns An object suitable for persistence, excluding 'createdAt' and 'updatedAt'.
	 */

	public static toPersistence(entity: UserEntity): Omit<User, 'createdAt' | 'updatedAt'> {
		return { password: entity.getPasswordHas(), ...entity };
	}
}
