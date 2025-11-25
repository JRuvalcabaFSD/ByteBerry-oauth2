import { AuthorizationCodeEntity } from '@/domain';
import { AuthCode } from 'generated/prisma/client';

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
