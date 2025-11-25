import { OAuthClientEntity } from '@/domain';

/**
 * Oauth Client Repository Interface
 *
 * @export
 * @interface IOauthClientRepository
 */
export interface IOAuthClientRepository {
  /**
   * Find OAuth Client by Client ID
   *
   * @param {string} clientId - The Client ID
   * @return {*}  {(Promise<OAuthClientEntity | null>)} - The OAuth Client Entity or null if not found
   * @memberof IOAuthClientRepository
   */

  findByClientId(clientId: string): Promise<OAuthClientEntity | null>;
}
