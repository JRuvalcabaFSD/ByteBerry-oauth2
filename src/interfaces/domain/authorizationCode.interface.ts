/**
 * Metadata interface for OAuth2 authorization code flow.
 *
 * This interface defines the structure for storing authorization code metadata
 * during the OAuth2 authorization code flow with PKCE (Proof Key for Code Exchange).
 *
 * @interface IAuthorizationCodeMetadata
 *
 * @property {string} clientId - The OAuth2 client identifier that requested the authorization code
 * @property {string} redirectUri - The URI where the authorization server will redirect the user-agent after authorization
 * @property {string} codeChallenge - The PKCE code challenge used to verify the authorization request
 * @property {Date} expiresAt - The expiration timestamp for the authorization code
 * @property {string[]} [scopes] - Optional array of OAuth2 scopes requested by the client
 */

export interface IAuthorizationCodeMetadata {
  clientId: string;
  redirectUri: string;
  codeChallenge: string;
  expiresAt: Date;
  scopes: string[] | undefined;
}

/**
 * Represents an OAuth2 authorization code with associated metadata and usage tracking.
 *
 * @interface IAuthorizationCode
 * @property {string} code - The unique authorization code string used in OAuth2 flow
 * @property {IAuthorizationCodeMetadata} metadata - Additional metadata associated with the authorization code
 * @property {Date} createAt - The timestamp when the authorization code was created
 * @property {boolean} used - Flag indicating whether the authorization code has been consumed/used
 */

export interface IAuthorizationCode {
  code: string;
  metadata: IAuthorizationCodeMetadata;
  createAt: Date;
  used: boolean;
}

/**
 * Interface representing the data required to exchange an authorization code for an access token
 * in the OAuth 2.0 authorization code flow with PKCE (Proof Key for Code Exchange).
 *
 * @interface IAuthorizationCodeExchange
 * @property {string} code - The authorization code received from the authorization server
 * @property {string} clientId - The client identifier issued to the client during registration
 * @property {string} redirectUrl - The redirection URI used in the authorization request
 * @property {string} codeVerifier - The code verifier used in PKCE to prove that the client making the token request is the same one that initiated the authorization request
 */

export interface IAuthorizationCodeExchange {
  code: string;
  clientId: string;
  redirectUri: string;
  codeVerifier: string;
}
