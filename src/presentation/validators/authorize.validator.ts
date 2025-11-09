import { InvalidRequestError } from '@/shared';
import { NextFunction, Request, Response } from 'express';

/**
 * Validates the OAuth2 authorization request parameters according to the Authorization Code Flow with PKCE.
 *
 * This middleware validates that all required query parameters are present and have the correct format:
 * - `client_id`: Must be a non-empty string
 * - `response_type`: Must be exactly "code"
 * - `redirect_uri`: Must be a non-empty string
 * - `code_challenge`: Must be a non-empty string (PKCE requirement)
 * - `code_challenge_method`: Must be either "S256" or "plain"
 *
 * @param req - Express request object containing the authorization parameters in query string
 * @param _res - Express response object (unused)
 * @param next - Express next function to pass control to the next middleware or error handler
 *
 * @throws {InvalidRequestError} When any required parameter is missing or has an invalid value
 *
 * @example
 * ```typescript
 * router.get('/authorize', ValidateAuthorizationRequest, authorizeController);
 * ```
 */

export const ValidateAuthorizationRequest = (req: Request, _res: Response, next: NextFunction): void => {
  const { client_id, response_type, redirect_uri, code_challenge, code_challenge_method } = req.query;

  try {
    if (!client_id || typeof client_id !== 'string') throw new InvalidRequestError('client_id is required');
    if (!response_type || response_type !== 'code') throw new InvalidRequestError('response_type must be code');
    if (!redirect_uri || typeof redirect_uri !== 'string') throw new InvalidRequestError('redirect_uri is required');
    if (!code_challenge || typeof code_challenge !== 'string') throw new InvalidRequestError('code_challenge is required (PKCE)');
    if (!code_challenge_method || (code_challenge_method !== 'S256' && code_challenge_method !== 'plain'))
      throw new InvalidRequestError('code_challenge_method must be S256 or plain');

    next();
  } catch (error) {
    next(error);
  }
};
