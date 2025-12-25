import { OAuthClientEntity } from '@domain';

/**
 * Interface for the OAuth client repository.
 * Provides methods to interact with OAuth client entities in the data store.
 *
 * @interface OAuthClientRepository
 *
 * @method findByClientId - Finds an OAuth client by its client ID.
 * @param {string} clientId - The client ID of the OAuth client.
 * @returns {Promise<OAuthClientEntity | null>} - A promise that resolves to the OAuth client entity or null if not found.
 */
export interface IOAuthClientRepository {
	findByClientId(clientId: string): Promise<OAuthClientEntity | null>;
}
