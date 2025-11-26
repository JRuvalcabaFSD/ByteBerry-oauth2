import { AuthCode, User } from 'generated/prisma/client';
import { AuthorizationCodeEntity, UserEntity } from '@/domain';

/**
 * Interface for mapping between persistence and domain representations of authorization codes.
 *
 * Provides methods to convert from a persistence model (`AuthCode`) to a domain entity
 * (`AuthorizationCodeEntity`) and vice versa.
 *
 * @interface IAUthCodeMapper
 */

export interface IAuthCodeMappers {
  /**
   * Maps a persistence-layer AuthCode record to a domain-level AuthorizationCodeEntity.
   *
   * @param {AuthCode} record - The AuthCode record containing authorization code data from the data source.
   * @return {*}  {AuthorizationCodeEntity} An instance of AuthorizationCodeEntity created from the provided record.
   * @memberof IAUthCodeMapper
   */

  toDomain(record: AuthCode): AuthorizationCodeEntity;

  /**
   * Maps an AuthorizationCodeEntity domain object to a persistence-ready AuthCode object.
   *
   * @param {AuthorizationCodeEntity} entity - The AuthorizationCodeEntity instance to be mapped.
   * @return {*}  {Partial<AuthCode>} A partial AuthCode object suitable for database storage, with properties
   * @memberof IAUthCodeMapper
   */

  toPersistence(entity: AuthorizationCodeEntity): Omit<AuthCode, 'id' | 'createdAt' | 'updatedAt'>;
}

/**
 * Interface for mapping between persistence User records and domain UserEntity objects.
 *
 * @remarks
 * This interface defines methods for converting data between the persistence layer (e.g., database models)
 * and the domain layer (business logic entities). Implementations of this interface should handle the
 * transformation logic required to map between these representations.
 *
 * @method toDomain Converts a persistence User record to a domain UserEntity.
 * @param record - The User record from the persistence layer.
 * @returns The corresponding UserEntity for use in the domain layer.
 *
 * @method toPersistence Converts a domain UserEntity to a persistence-ready object.
 * @param entity - The UserEntity from the domain layer.
 * @returns An object suitable for persistence, omitting 'id', 'createdAt', and 'updatedAt' fields.
 */

export interface IUserMapper {
  toDomain(record: User): UserEntity;
  toPersistence(entity: UserEntity): Omit<User, 'id' | 'createdAt' | 'updatedAt'>;
}
