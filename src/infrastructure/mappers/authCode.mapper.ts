import { AuthorizationCodeEntity, ClientId, CodeChallenge } from '@/domain';
import { IAuthCodeMappers } from '@/interfaces';
import { AuthCode } from 'generated/prisma/client';

/**
 * Maps between persistence-layer AuthCode records and domain-level AuthorizationCodeEntity objects.
 *
 * @remarks
 * The `AuthCodeMapper` class provides methods to convert authorization code data between
 * the persistence format (used for database storage) and the domain format (used within the application logic).
 * It handles value object creation, expiration calculations, and scope formatting.
 *
 * @implements IAuthCodeMappers
 */

export class AuthCodeMapper implements IAuthCodeMappers {
  /**
   * Maps a persistence-layer AuthCode record to a domain-level AuthorizationCodeEntity.
   *
   * @param record - The AuthCode record from the data source.
   * @returns An instance of AuthorizationCodeEntity created from the provided record.
   *
   * @remarks
   * - Converts the `clientId` and `codeChallenge` fields to their respective value objects.
   * - Calculates the expiration time in minutes based on the `expiresAt` timestamp.
   * - Joins the `scopes` array into a space-delimited string.
   */

  public toDomain(record: AuthCode): AuthorizationCodeEntity {
    const { code, userId, clientId, redirectUri, codeChallenge, codeChallengeMethod, expiresAt, scopes, used } = record;
    const authCode = AuthorizationCodeEntity.create({
      code,
      userId,
      clientId: ClientId.create(clientId),
      redirectUri,
      codeChallenge: CodeChallenge.create(codeChallenge!, codeChallengeMethod as 'S256' | 'plain'),
      expirationMinutes: Math.floor((expiresAt.getTime() - Date.now()) / 1000 / 60),
      scope: scopes.join(' '),
      state: record.state ?? undefined,
    });

    if (used) authCode.markAsUsed();

    return authCode;
  }

  /**
   * Maps an AuthorizationCodeEntity domain object to a partial AuthCode persistence object.
   *
   * @param entity - The AuthorizationCodeEntity instance to be mapped.
   * @returns A partial AuthCode object suitable for persistence, with properties such as code, clientId, redirectUri, scopes, codeChallenge, codeChallengeMethod, and expiresAt.
   */

  public toPersistence(entity: AuthorizationCodeEntity): Omit<AuthCode, 'id' | 'createdAt' | 'updatedAt'> {
    const { code, userId, clientId, redirectUri, scope, codeChallenge, expiresAt, state } = entity;
    return {
      code,
      clientId: clientId.getValue(),
      userId,
      redirectUri,
      scopes: scope?.split(' ') ?? [],
      codeChallenge: codeChallenge.getChallenge(),
      codeChallengeMethod: codeChallenge.getMethod(),
      expiresAt,
      used: entity.isUsed(),
      state: state ?? null,
    };
  }
}
