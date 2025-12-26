import { TokenRequestDTO, TokenResponseDTO } from '@application';

/**
 * Interface for the use case responsible for exchanging tokens.
 *
 * @remarks
 * This use case typically handles the logic for exchanging an authorization code or refresh token
 * for an access token and possibly a refresh token, following OAuth2 or similar authentication flows.
 *
 * @method execute
 * Executes the token exchange process.
 * @param request - The data transfer object containing the necessary information for the token exchange.
 * @returns A promise that resolves to a TokenResponseDTO containing the exchanged token(s) and related information.
 */

export interface IExchangeTokenUseCase {
	execute(request: TokenRequestDTO): Promise<TokenResponseDTO>;
}
