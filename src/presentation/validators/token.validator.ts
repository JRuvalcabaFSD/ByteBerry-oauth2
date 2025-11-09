import { InvalidRequestError } from '@/shared';
import { NextFunction, Response, Request } from 'express';

/**
 * Validates the token request parameters for OAuth2 authorization code flow.
 *
 * This middleware validator ensures that all required parameters for exchanging
 * an authorization code for an access token are present and valid according to
 * the OAuth2 specification (RFC 6749).
 *
 * @param req - The Express request object containing the token request parameters in the body
 * @param _res - The Express response object (unused)
 * @param next - The Express next function to pass control to the next middleware
 *
 * @throws {InvalidRequestError} When grant_type is missing or not 'authorization_code'
 * @throws {InvalidRequestError} When code is missing
 * @throws {InvalidRequestError} When redirect_uri is missing
 * @throws {InvalidRequestError} When client_id is missing
 * @throws {InvalidRequestError} When code_verifier is missing (PKCE)
 *
 * @remarks
 * This validator implements PKCE (Proof Key for Code Exchange) by requiring
 * the code_verifier parameter, enhancing security for public clients.
 *
 * @example
 * ```typescript
 * app.post('/token', TokenValidator, tokenController);
 * ```
 */

export const TokenValidator = (req: Request, _res: Response, next: NextFunction): void => {
  const { grant_type, code, redirect_uri, client_id, code_verifier } = req.body;

  try {
    if (!grant_type || grant_type !== 'authorization_code') throw new InvalidRequestError('grant_type must be authorization_code');
    if (!code) throw new InvalidRequestError('code is required');
    if (!redirect_uri) throw new InvalidRequestError('redirect_uri is required');
    if (!client_id) throw new InvalidRequestError('client_id is required');
    if (!code_verifier) throw new InvalidRequestError('code_verifier is required');

    next();
  } catch (error) {
    next(error);
  }
};
