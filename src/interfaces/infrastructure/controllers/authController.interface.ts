import { Request, Response } from 'express';
/**
 * Interface representing the parameters for an OAuth2 authorization request.
 *
 * This interface defines the structure for authorization requests in the OAuth2 flow,
 * including both required and optional parameters as specified in RFC 6749 and RFC 7636 (PKCE).
 *
 * @interface IAuthorizeRequest
 *
 * @property {string} response_type - The OAuth2 response type (e.g., "code" for authorization code flow)
 * @property {string} client_id - The unique identifier for the OAuth2 client application
 * @property {string} redirect_uri - The URI where the authorization server will redirect the user after authorization
 * @property {string} [state] - Optional opaque value used to maintain state between request and callback to prevent CSRF attacks
 * @property {string} [code_challenge] - Optional code challenge for PKCE (Proof Key for Code Exchange) flow
 * @property {string} [code_challenge_method] - Optional method used to generate the code challenge (e.g., "S256", "plain")
 * @property {string} [scope] - Optional space-delimited list of permissions being requested
 */

export interface IAuthorizeRequest {
  response_type: string;
  client_id: string;
  redirect_uri: string;
  state: string | undefined;
  code_challenge: string | undefined;
  code_challenge_method: string | undefined;
  scope: string | undefined;
}

/**
 * Represents a request for an OAuth2 token exchange.
 *
 * @property grant_type - The type of grant being used (e.g., "authorization_code").
 * @property code - The authorization code received from the authorization server.
 * @property redirect_uri - The URI to which the response will be sent. Must match the redirect URI used in the authorization request.
 * @property client_id - The client identifier issued to the client during the registration process.
 * @property code_verifier - (Optional) The code verifier used for PKCE (Proof Key for Code Exchange) if applicable.
 */

export interface ITokenRequest {
  grant_type: string;
  code: string;
  redirect_uri: string;
  client_id: string;
  code_verifier: string | undefined;
}

/**
 * Represents the response returned after an authorization request.
 *
 * @property code - (Optional) The authorization code issued by the authorization server.
 * @property state - (Optional) The state parameter to maintain state between the request and callback.
 */

export interface IAuthorizeResponse {
  code: string | undefined;
  state: string | undefined;
}

/**
 * Represents the response returned after a successful authentication request.
 *
 * @property access_token - The token used to access protected resources.
 * @property toke_type - The type of the token issued (e.g., "Bearer").
 * @property expires_in - The lifetime in seconds of the access token.
 * @property refresh_token - (Optional) The token that can be used to obtain new access tokens.
 * @property scope - (Optional) The scope of the access token as granted by the authorization server.
 */

export interface ITokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
  scope?: string;
}

/**
 * Represents the response structure for a JSON Web Key Set (JWKS) endpoint.
 *
 * @property keys - An array of JSON Web Keys (JWKs) provided by the JWKS endpoint.
 */

export interface IJwksResponse {
  keys: Array<IJwk>;
}

/**
 * Represents a JSON Web Key (JWK) used for cryptographic operations.
 *
 * @property kty - The cryptographic algorithm family used with the key (e.g., "RSA").
 * @property use - The intended use of the public key (e.g., "sig" for signature).
 * @property alg - The algorithm intended for use with the key (e.g., "RS256").
 * @property kid - The unique identifier for the key.
 * @property n - The modulus value for the RSA public key, encoded in Base64URL.
 * @property e - The exponent value for the RSA public key, encoded in Base64URL.
 */

export interface IJwk {
  kty: string;
  use: string;
  alg: string;
  kid: string;
  n: string;
  e: string;
}

/**
 * Interface for authentication controller handling OAuth2-related endpoints.
 *
 * @remarks
 * This interface defines the contract for controllers responsible for
 * handling authorization, token issuance, and JWKS (JSON Web Key Set) endpoints.
 *
 * @method authorize Handles the OAuth2 authorization endpoint.
 * @param req - The HTTP request object.
 * @param res - The HTTP response object.
 * @returns A promise that resolves when the authorization process is complete.
 *
 * @method token Handles the OAuth2 token endpoint.
 * @param req - The HTTP request object.
 * @param res - The HTTP response object.
 * @returns A promise that resolves when the token issuance process is complete.
 *
 * @method jwks Handles the JWKS endpoint for serving public keys.
 * @param req - The HTTP request object.
 * @param res - The HTTP response object.
 * @returns A promise that resolves when the JWKS response is sent.
 */

export interface IAuthController {
  /**
   * Handles the OAuth2 authorization request.
   *
   * @param {Request} req - The HTTP request object.
   * @param {Response} res - The HTTP response object.
   * @return {*}  {Promise<void>} A promise that resolves when the authorization process is complete.
   * @memberof IAuthController
   */

  authorize(req: Request, res: Response): Promise<void>;

  /**
   * Handles the OAuth2 token request.
   *
   * @param {Request} req - The HTTP request object.
   * @param {Response} res - The HTTP response object.
   * @return {*}  {Promise<void>} A promise that resolves when the token process is complete.
   * @memberof IAuthController
   */

  token(req: Request, res: Response): Promise<void>;

  /**
   * Handles the JWKS request.
   *
   * @param {Request} req - The HTTP request object.
   * @param {Response} res - The HTTP response object.
   * @return {*}  {Promise<void>} A promise that resolves when the JWKS process is complete.
   * @memberof IAuthController
   */

  jwks(req: Request, res: Response): Promise<void>;
}
