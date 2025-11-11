import { Request, Response, NextFunction } from 'express';

import { IGenerateAuthorizationCodeUseCase } from '@/interfaces';
import { AuthorizeRequestDto } from '@/application';
import { InvalidRequestError } from '@/shared';

/**
 * Controller responsible for handling OAuth2 authorization requests.
 *
 * This controller processes authorization requests by validating client credentials,
 * generating authorization codes, and redirecting users back to the client application
 * with the authorization code.
 *
 * @remarks
 * Implements the OAuth2 Authorization Code Flow with PKCE (Proof Key for Code Exchange).
 * The controller extracts authorization parameters from the request query string,
 * delegates code generation to the use case, and constructs a redirect URL with
 * the generated authorization code and optional state parameter.
 *
 * @example
 * ```typescript
 * const controller = new AuthorizationController(generateUseCase);
 * app.get('/authorize', controller.handle);
 * ```
 */

export class AuthorizeController {
  /**
   * Creates an instance of the authorization controller.
   *
   * @param generateUseCase - The use case responsible for generating authorization codes
   */

  constructor(private readonly generateUseCase: IGenerateAuthorizationCodeUseCase) {}

  /**
   * Handles the OAuth2 authorization request.
   *
   * Processes the authorization request by extracting query parameters, validating the client,
   * generating an authorization code, and redirecting the user back to the specified redirect URI
   * with the authorization code and optional state parameter.
   *
   * @param req - Express request object containing query parameters:
   *   - client_id: The client identifier
   *   - response_type: The OAuth2 response type
   *   - redirect_uri: The URI to redirect after authorization
   *   - code_challenge: PKCE code challenge
   *   - code_challenge_method: PKCE code challenge method ('S256' or 'plain')
   *   - scope: Optional scope of the access request
   *   - state: Optional opaque value used to maintain state between request and callback
   * @param res - Express response object used to redirect the user
   * @param next - Express next function for error handling
   *
   * @returns A promise that resolves when the redirect is complete
   *
   * @throws Will pass any errors to the next middleware via the next function
   */

  public handle = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const requestDto: AuthorizeRequestDto = {
        client_id: req.query.client_id as string,
        response_type: req.query.response_type as string,
        redirect_uri: req.query.redirect_uri as string,
        code_challenge: req.query.code_challenge as string,
        code_challenge_method: req.query.code_challenge_method as 'S256' | 'plain',
        scope: req.query.scope as string | undefined,
        state: req.query.state as string | undefined,
      };

      const result = await this.generateUseCase.execute(requestDto);

      // Build redirect URL with code
      let redirectUrl: URL;
      try {
        redirectUrl = new URL(requestDto.redirect_uri);
      } catch {
        const message = 'Invalid redirect_uri: must be a valid absolute URL';
        throw new InvalidRequestError(message);
      }

      redirectUrl.searchParams.set('code', result.code);
      if (result.state) {
        redirectUrl.searchParams.set('state', result.state);
      }

      res.redirect(redirectUrl.toString());
    } catch (error) {
      next(error);
    }
  };
}
