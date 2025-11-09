import { Request, Response, NextFunction } from 'express';

import { IExchangeCodeForTokenUseCase } from '@/interfaces';
import { TokenRequestDto } from '@/application';

/**
 * Controller responsible for handling OAuth2 token exchange requests.
 *
 * This controller processes token endpoint requests by extracting authorization code
 * and related parameters from the request body, delegating the token exchange logic
 * to the use case layer, and returning the generated token response.
 *
 * @remarks
 * Implements the OAuth2 token endpoint handler following the authorization code grant flow.
 * Supports PKCE (Proof Key for Code Exchange) through the code_verifier parameter.
 *
 * @example
 * ```typescript
 * const tokenController = new TokenController(exchangeCodeUseCase);
 * app.post('/oauth/token', tokenController.handle);
 * ```
 */

export class TokenController {
  /**
   * Creates an instance of the token controller.
   *
   * @param exchangeCodeUseCase - The use case responsible for exchanging authorization codes for access tokens
   */

  constructor(private readonly exchangeCodeUseCase: IExchangeCodeForTokenUseCase) {}

  /**
   * Handles the OAuth2 token exchange request.
   *
   * @remarks
   * This method processes incoming token requests by extracting authorization code
   * and related parameters from the request body, executing the code exchange use case,
   * and returning the resulting access token.
   *
   * @param req - Express request object containing the token request parameters in the body
   * @param res - Express response object used to send the token response
   * @param next - Express next function for error handling middleware
   *
   * @throws Will forward any errors to the next middleware via the next() function
   *
   * @returns A promise that resolves when the token response has been sent
   */

  public handle = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const requestDto: TokenRequestDto = {
        grant_type: req.body.grant_type,
        code: req.body.code,
        redirect_uri: req.body.redirect_uri,
        client_id: req.body.client_id,
        code_verifier: req.body.code_verifier,
      };

      const token = await this.exchangeCodeUseCase.execute(requestDto);

      res.json(token);
    } catch (error) {
      next(error);
    }
  };
}
