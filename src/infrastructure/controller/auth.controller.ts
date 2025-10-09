/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response } from 'express';
import {
  IAuthController,
  IAuthorizeRequest,
  IAuthorizeResponse,
  IJwksResponse,
  ILogger,
  ITokenRequest,
  ITokenResponse,
} from '@/interfaces';
import { BadRequestError } from '@/shared/errors/http.errors';

/**
 * OAuth2 Authorization Controller
 *
 * Implements the OAuth2 authorization server endpoints for handling authorization
 * requests, token issuance, and JSON Web Key Set (JWKS) responses.
 *
 * This controller provides mock implementations for development and testing purposes,
 * generating temporary authorization codes and access tokens with basic validation.
 *
 * @implements {IAuthController}
 *
 * @example
 * ```typescript
 * const authController = new AuthController(logger);
 *
 * // Handle authorization request
 * app.get('/authorize', authController.authorize.bind(authController));
 *
 * // Handle token request
 * app.post('/token', authController.token.bind(authController));
 *
 * // Handle JWKS request
 * app.get('/.well-known/jwks.json', authController.jwks.bind(authController));
 * ```
 *
 * @remarks
 * - Supports OAuth2 Authorization Code flow with PKCE
 * - Validates required parameters according to OAuth2 specification
 * - Provides comprehensive logging for debugging and monitoring
 * - Returns mock responses suitable for development environments
 * - JWKS endpoint includes appropriate cache headers for performance
 *
 * @see {@link https://tools.ietf.org/html/rfc6749} OAuth 2.0 Authorization Framework
 * @see {@link https://tools.ietf.org/html/rfc7636} PKCE by OAuth Public Clients
 */

export class AuthController implements IAuthController {
  /**
   * Creates an instance of AuthController.
   * @param {ILogger} logger
   * @memberof AuthController
   */

  constructor(private readonly logger: ILogger) {
    this.logger.info('AuthController initialized', { context: 'AuthController' });
  }

  /**
   * Handles OAuth2 authorization requests and generates authorization codes.
   *
   * This method processes incoming authorization requests by validating the request parameters,
   * generating a mock authorization code, and returning the authorization response. It supports
   * OAuth2 features like state parameter for CSRF protection and PKCE for enhanced security.
   *
   * @param req - Express request object containing query parameters for OAuth2 authorization
   * @param res - Express response object used to send the authorization response
   * @returns Promise that resolves when the authorization response is sent
   *
   * @throws {Error} When authorization request validation fails or other errors occur
   *
   * @example
   * ```typescript
   * // GET /authorize?client_id=123&response_type=code&redirect_uri=https://app.com/callback&state=xyz
   * await authController.authorize(req, res);
   * // Returns: { code: "mock_authorization_code_1234567890", state: "xyz" }
   * ```
   */

  public authorize = async (req: Request, res: Response): Promise<void> => {
    const context = { context: 'AuthController.authorize', requestId: req.requestId };

    this.logger.info('Authorization request received', { ...context, clientId: req.query?.clientId });
    try {
      const authorizeParams = this.validateAuthorizeRequest(req.query ?? {});

      const mockResponse: IAuthorizeResponse = {
        code: 'mock_authorization_code_' + Date.now(),
        state: authorizeParams.state,
      };

      this.logger.info('Authorization code generated', {
        ...context,
        clientId: authorizeParams.client_id,
        hasState: !!authorizeParams.state,
        hasPkce: !!authorizeParams.code_challenge,
      });

      res.status(200).json(mockResponse);
    } catch (error) {
      this.logger.error('Authorization request failed', {
        ...context,
        error: error instanceof Error ? error.message : 'Unknown error',
      });

      throw error;
    }
  };

  /**
   * Handles OAuth2 token requests and issues access tokens.
   *
   * @param {Request} req - Express request object containing body parameters for token issuance
   * @param {Response} res - Express response object used to send the token response
   * @return {*}  {Promise<void>} Promise that resolves when the token response is sent
   * @memberof AuthController
   */

  public token = async (req: Request, res: Response): Promise<void> => {
    const context = { context: 'AuthController.token', requestId: req.requestId };

    this.logger.info('Token request received', {
      ...context,
      grantType: req.body?.grant_type,
      clientId: req.body?.client_id,
    });

    try {
      const tokenParams = this.validateTokenRequest(req.body ?? {});

      const mockResponse: ITokenResponse = {
        access_token: 'mock_jwt_token_' + Date.now(),
        token_type: 'Bearer',
        expires_in: 900, // 15 minutes
      };

      this.logger.info('Access token issued', {
        ...context,
        clientId: tokenParams.client_id,
        expiresIn: mockResponse.expires_in,
      });

      res.status(200).json(mockResponse);
    } catch (error) {
      this.logger.error('Token request failed', {
        ...context,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  };

  /**
   * Handles JWKS requests and returns the JSON Web Key Set.
   *
   * @param {Request} req - Express request object
   * @param {Response} res - Express response object
   * @return {*}  {Promise<void>} Promise that resolves when the JWKS response is sent
   * @memberof AuthController
   */

  public jwks = async (req: Request, res: Response): Promise<void> => {
    const context = { context: 'AuthController.token', requestId: req.requestId };

    this.logger.info('JWKS request received', context);

    try {
      const mockResponse: IJwksResponse = {
        keys: [
          {
            kty: 'RSA',
            use: 'sig',
            alg: 'RS256',
            kid: 'mock-key-id-' + Date.now(),
            n: 'mock_modulus_base64url',
            e: 'AQAB',
          },
        ],
      };

      this.logger.info('JWKS response sent', { ...context, keyCount: mockResponse.keys.length });

      // Set cache headers (keys don't change frequently)
      res.setHeader('Cache-Control', 'public, max-age=3600');
      res.status(200).json(mockResponse);
    } catch (error) {
      this.logger.error('JWKS request failed', {
        ...context,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  };

  /**
   * Validates the incoming authorization request parameters.
   *
   * @private
   * @param {*} query - The query parameters from the authorization request
   * @return {*}  {IAuthorizeRequest} The validated authorization request parameters
   * @memberof AuthController
   */

  private validateAuthorizeRequest(query: any): IAuthorizeRequest {
    if (!query.response_type) throw new BadRequestError('Missing required parameter: response_type');
    if (query.response_type !== 'code') throw new BadRequestError('Invalid response_type. Must be "code"');
    if (!query.client_id) throw new BadRequestError('Missing required parameter: client_id');
    if (!query.redirect_uri) throw new BadRequestError('Missing required parameter: redirect_uri');
    if (query.code_challenge && !query.code_challenge_method)
      throw new BadRequestError('code_challenge_method is required when code_challenge is provided');
    if (query.code_challenge_method && !['S256', 'plain'].includes(query.code_challenge_method))
      throw new BadRequestError('Invalid code_challenge_method. Must be "S256" or "plain"');

    return {
      response_type: query.response_type as string,
      client_id: query.client_id as string,
      redirect_uri: query.redirect_uri as string,
      state: query.state as string | undefined,
      code_challenge: query.code_challenge as string | undefined,
      code_challenge_method: query.code_challenge_method as string | undefined,
      scope: query.scope as string | undefined,
    };
  }

  /**
   * Validates the incoming token request parameters.
   *
   * @private
   * @param {*} body - The body parameters from the token request
   * @return {*}  {ITokenRequest} The validated token request parameters
   * @memberof AuthController
   */

  private validateTokenRequest(body: any): ITokenRequest {
    if (!body.grant_type) throw new BadRequestError('Missing required parameter: grant_type');
    if (body.grant_type !== 'authorization_code') throw new BadRequestError('Invalid grant_type. Must be "authorization_code"');
    if (!body.code) throw new BadRequestError('Missing required parameter: code');
    if (!body.redirect_uri) throw new BadRequestError('Missing required parameter: redirect_uri');
    if (!body.client_id) throw new BadRequestError('Missing required parameter: client_id');

    return {
      grant_type: body.grant_type as string,
      code: body.code as string,
      redirect_uri: body.redirect_uri as string,
      client_id: body.client_id as string,
      code_verifier: body.code_verifier as string | undefined,
    };
  }
}
