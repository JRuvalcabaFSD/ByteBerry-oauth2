import { OAuthClientEntity } from '@domain';

//TODO documentar
export interface IOAthClientRepository {
	/**
	 * Finds an OAuth client by its client ID.
	 *
	 * @param {string} clientId - The client ID of the OAuth client to find.
	 * @return {*}  {(Promise<OAuthClientEntity | null>)} - A promise that resolves to the OAuthClientEntity if found, or null if not found.
	 * @memberof IUAthClientRepository
	 * @example
	 * ```typescript
	 * const client = await oauthClientRepository.findByClientId('my-client-id');
	 * if (client) {
	 *   console.log('Client found:', client);
	 * } else {
	 *   console.log('Client not found');
	 * }
	 * ```
	 */
	findByClientId(clientId: string): Promise<OAuthClientEntity | null>;
}
