import { AuthCode } from '@prisma/client';
import { AuthCodeEntity, ClientIdVO, CodeChallengeVO } from '@domain';

/**
 * Maps between the persistence model (`AuthCode`) and the domain entity (`AuthCodeEntity`)
 * for OAuth2 authorization codes.
 *
 * Provides methods to convert database records to domain entities (`toDomain`)
 * and domain entities back to persistence objects (`toPersistence`).
 *
 * - `toDomain(record: AuthCode)`: Converts a persistence model to a domain entity,
 *   including value object creation and expiration calculation.
 * - `toPersistence(entity: AuthCodeEntity)`: Converts a domain entity to a persistence
 *   object suitable for storage, handling value object extraction and property mapping.
 */

export class AuthCodeMapper {
	/**
	 * Maps a Prisma AuthCode record to a domain AuthCodeEntity.
	 *
	 * @param record - The AuthCode record from the database.
	 * @returns The corresponding AuthCodeEntity instance.
	 *
	 * @remarks
	 * - Converts primitive values and value objects as needed.
	 * - Calculates expiration in minutes based on the current time.
	 * - Joins scopes into a space-separated string.
	 * - Optionally sets the state if present.
	 * - Marks the entity as used if the record indicates so.
	 */

	public static toDomain(record: AuthCode): AuthCodeEntity {
		const { code, userId, clientId, redirectUri, codeChallenge, codeChallengeMethod, expiresAt, scopes, state, used } = record;
		const authCode = AuthCodeEntity.create({
			code,
			userId,
			clientId: ClientIdVO.create(clientId),
			redirectUri,
			codeChallenge: CodeChallengeVO.create(codeChallenge!, codeChallengeMethod as 'S256' | 'plain'),
			expirationMinutes: Math.floor((expiresAt.getTime() - Date.now()) / 1000 / 60),
			scope: scopes.join(' '),
			state: state ?? undefined,
		});

		if (used) authCode.markAsUsed();

		return authCode;
	}

	/**
	 * Maps an AuthCodeEntity domain object to a persistence-ready object for Prisma.
	 *
	 * @param entity - The AuthCodeEntity instance to be mapped.
	 * @returns An object suitable for Prisma persistence, omitting 'id', 'createdAt', and 'updatedAt' fields.
	 */

	public static toPersistence(entity: AuthCodeEntity): Omit<AuthCode, 'id' | 'createdAt' | 'updatedAt'> {
		const { code, clientId, userId, redirectUri, scope, codeChallenge, expiresAt, state } = entity;

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
