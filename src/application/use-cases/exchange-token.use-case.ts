import * as Interfaces from '@interfaces';
import * as Errors from '@shared';
import { getErrMsg, LogContextClass, LogContextMethod } from '@shared';
import { TokenRequestDTO, TokenResponseDTO } from '@application';
import { CodeVerifierVO } from '@domain';

/**
 * Use case for exchanging an OAuth2 authorization code for an access token.
 *
 * This class implements the logic required to validate an authorization code,
 * verify PKCE (Proof Key for Code Exchange), ensure client and redirect URI match,
 * and generate a JWT access token for the authenticated user.
 *
 * The process includes:
 * - Validating the existence, expiration, and usage status of the authorization code.
 * - Ensuring the client ID and redirect URI match the original authorization request.
 * - Verifying the PKCE code challenge and code verifier.
 * - Loading user data for JWT claims.
 * - Marking the authorization code as used to prevent replay attacks.
 * - Generating and returning a JWT access token with the appropriate claims and scope.
 *
 * Errors are logged and handled according to OAuth2 best practices, with specific
 * error types thrown for invalid codes, clients, or PKCE verification failures.
 *
 * @implements {Interfaces.IExchangeTokenUseCase}
 * @constructor
 * @param {Interfaces.IContainer} c - The dependency injection container providing required repositories and services.
 * @method execute
 * @param {TokenRequestDTO} request - The token exchange request containing the authorization code, client ID, redirect URI, and PKCE verifier.
 * @returns {Promise<TokenResponseDTO>} The response containing the access token, expiration, and scope.
 * @throws {InvalidAuthCodeError} If the authorization code is invalid, expired, already used, or has mismatched redirect URI.
 * @throws {InvalidClientError} If the client credentials are invalid.
 * @throws {OAuthError} If the user is not found.
 * @throws {InvalidTokenError} For unexpected errors during the token exchange process.
 */

@LogContextClass()
export class ExchangeTokenUseCase implements Interfaces.IExchangeTokenUseCase {
	public readonly codeRepository: Interfaces.IAuthCodeRepository;
	public readonly userRepository: Interfaces.IUserRepository;
	public readonly clientRepository: Interfaces.IOAuthClientRepository;
	public readonly jwtService: Interfaces.IJwtService;
	public readonly pkceVerifier: Interfaces.IPkceVerifierUseCase;
	public readonly expiresIn: number;
	public readonly logger: Interfaces.ILogger;

	constructor(c: Interfaces.IContainer) {
		this.codeRepository = c.resolve('AuthCodeRepository');
		this.userRepository = c.resolve('UserRepository');
		this.clientRepository = c.resolve('OAuthClientRepository');
		this.jwtService = c.resolve('JwtService');
		this.pkceVerifier = c.resolve('PKCEVerifierUseCase');
		this.expiresIn = c.resolve('Config').jwtAccessTokenExpiresIn || 900;
		this.logger = c.resolve('Logger');
	}

	/**
	 * Exchanges an authorization code for an access token following the OAuth2 protocol.
	 *
	 * This method performs the following steps:
	 * 1. Logs the start of the token exchange process.
	 * 2. Finds and validates the provided authorization code, ensuring it exists, is not expired, and has not been used.
	 * 3. Validates that the client ID and redirect URI match those associated with the authorization code.
	 * 4. Verifies the PKCE code challenge using the provided code verifier.
	 * 5. Loads the user associated with the authorization code and checks if the user account is active.
	 * 6. Marks the authorization code as used and persists the change.
	 * 7. Generates a JWT access token with appropriate claims.
	 * 8. Logs the successful token exchange and returns the access token response.
	 *
	 * Throws specific errors for invalid authorization codes, client mismatches, PKCE verification failures,
	 * user not found, and unexpected errors during the process.
	 *
	 * @param request - The token request DTO containing the authorization code, client credentials, redirect URI, and PKCE verifier.
	 * @returns A promise that resolves to a TokenResponseDTO containing the access token and related information.
	 * @throws {InvalidAuthCodeError} If the authorization code is invalid, expired, already used, or redirect URI mismatches.
	 * @throws {InvalidClientError} If the client ID does not match the authorization code.
	 * @throws {OAuthError} If the user associated with the authorization code is not found.
	 * @throws {InvalidTokenError} For unexpected errors during the token exchange process.
	 */

	@LogContextMethod()
	public async execute(request: TokenRequestDTO): Promise<TokenResponseDTO> {
		this.logger.info('Starting token exchange', {
			code: request.code.substring(0, 10) + '...',
			clientId: request.clientId,
		});

		try {
			//Find authorization code
			const authCode = await this.codeRepository.findByCode(request.code);
			if (!authCode) {
				this.logger.warn('Authorization code not found', {
					code: request.code.substring(0, 10) + '...',
				});
				throw new Errors.InvalidAuthCodeError('Invalid authorization code');
			}

			//Validate authorization code not expired
			if (authCode.isExpired()) {
				this.logger.warn('Authorization code expired', {
					code: request.code.substring(0, 10) + '...',
					expiresAt: authCode.expiresAt,
				});
				throw new Errors.InvalidAuthCodeError('Authorization code has expired');
			}

			//Validate authorization code not already used
			if (authCode.isUsed()) {
				this.logger.error('Authorization code already used - potential replay attack', {
					code: request.code.substring(0, 10) + '...',
					userId: authCode.userId,
					clientId: authCode.clientId.getValue(),
				});
				throw new Errors.InvalidAuthCodeError('Authorization code already been used');
			}

			//Validate client_id matches
			if (authCode.clientId.getValue() !== request.clientId) {
				this.logger.error('Client ID mismatch', {
					expected: authCode.clientId.getValue(),
					received: request.clientId,
				});

				throw new Errors.InvalidClientError('Invalid client credentials');
			}

			//Validate redirect_uri matches (if provided in original request)
			if (authCode.redirectUri !== request.redirectUri) {
				this.logger.error('Redirect URI mismatch', {
					expected: authCode.redirectUri,
					received: request.redirectUri,
				});
				throw new Errors.InvalidAuthCodeError('Redirect URI mismatch');
			}

			// Verify PKCE code
			const codeVerifier = CodeVerifierVO.create(request.codeVerifier);
			const isValidPKCE = this.pkceVerifier.verify(authCode.codeChallenge, codeVerifier.getValue());

			if (!isValidPKCE) {
				this.logger.error('PKCE verification failed', {
					code: request.code.substring(0, 10) + '...',
					method: authCode.codeChallenge.getMethod(),
				});
				throw new Errors.InvalidAuthCodeError('Invalid code verifier (PKCE verificación failed');
			}

			this.logger.debug('PKCE verification successful', {
				method: authCode.codeChallenge.getMethod(),
			});

			// Load user data for JWT claims
			const user = await this.userRepository.findById(authCode.userId);

			if (!user) {
				this.logger.error('User not found for authorization code', {
					userId: authCode.userId,
				});
				throw new Errors.OAuthError('User not found', 'User not found', 400);
			}

			if (!user.canLogin()) {
				this.logger.warn('User account is inactive', {
					userId: user.id,
					email: user.email,
				});
			}

			authCode.markAsUsed();
			await this.codeRepository.save(authCode);

			this.logger.info('Authorization code marked as used', {
				code: request.code.substring(0, 10) + '...',
			});

			//Generate JQT access token
			const accessToken = this.jwtService.generateAccessToken({
				sub: user.id,
				email: user.email,
				username: user.username,
				roles: user.roles,
				scope: authCode.scope || 'read',
				client_id: request.clientId,
			});

			const response = new TokenResponseDTO({ accessToken, expiresIn: this.expiresIn, scope: authCode.scope || 'read' });

			this.logger.info('Token exchange successful', {
				userId: user.id,
				email: user.email,
				clientId: request.clientId,
				scope: authCode.scope,
				expiresIn: this.expiresIn,
			});

			return response;
		} catch (error) {
			if (error instanceof Errors.OAuthError) throw error;

			this.logger.error('Unexpected error during token exchange', { error: getErrMsg(error) });

			throw new Errors.InvalidTokenError('Token exchange failed');
		}
	}
}
