import { TokenRequestCommand, TokenResponseDto } from '@application';

/**
 * Use case interface for exchanging an authorization code for an access token.
 *
 * This interface defines the contract for implementing the OAuth2 authorization code flow's
 * token exchange step, where a previously obtained authorization code is exchanged for
 * an access token and optionally a refresh token.
 *
 * @interface ExchangeCodeForTokenUseCase
 *
 * @example
 * ```typescript
 * class ExchangeCodeForTokenService implements ExchangeCodeForTokenUseCase {
 *   async execute(request: TokenRequestCommand): Promise<TokenResponseDto> {
 *     // Implementation details
 *   }
 * }
 * ```
 */
export interface IExchangeCodeForTokenUseCase {
	/**
	 * Executes the token exchange process using the provided authorization code.
	 *
	 * @param {TokenRequestCommand} request - The command object containing the authorization code and other necessary parameters.
	 * @return {*}  {Promise<TokenResponseDto>} - A promise that resolves to a TokenResponseDto containing the access token and related information.
	 * @memberof ExchangeCodeForTokenUseCase
	 */
	execute(request: TokenRequestCommand): Promise<TokenResponseDto>;
}
