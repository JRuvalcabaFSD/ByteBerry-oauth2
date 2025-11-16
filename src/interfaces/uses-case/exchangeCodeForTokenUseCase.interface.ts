import { TokenRequestDto, TokenResponseDto } from '@/application';

/**
 * Interface for the use case that exchanges an authorization code for an access token.
 *
 * This use case is part of the OAuth 2.0 authorization code flow, where after a user
 * authorizes an application, the application exchanges the received authorization code
 * for an access token that can be used to access protected resources.
 *
 * @interface IExchangeCodeForTokenUseCaseInterface
 *
 * @example
 * ```typescript
 * class ExchangeCodeForTokenUseCase implements IExchangeCodeForTokenUseCaseInterface {
 *   async execute(request: TokenRequestDto): Promise<TokenResponseDto> {
 *     // Implementation logic
 *   }
 * }
 * ```
 */

export interface IExchangeCodeForTokenUseCase {
  /**
   * Executes the use case to exchange an authorization code for an access token.
   *
   * @param {TokenRequestDto} request - The request DTO containing the authorization code and other necessary parameters.
   * @return {*}  {Promise<TokenResponseDto>} - A promise that resolves to the response DTO containing the access token and related information.
   * @memberof IExchangeCodeForTokenUseCaseInterface
   */

  execute(request: TokenRequestDto): Promise<TokenResponseDto>;
}
