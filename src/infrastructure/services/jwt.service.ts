import { IJwtPayload, IJwtService, ILogger } from '@interfaces';
import { getErrMsg, InvalidTokenError } from '@shared';
import jwt, { SignOptions } from 'jsonwebtoken';

const { JsonWebTokenError, sign, TokenExpiredError, verify, decode } = jwt;

/**
 * Service for handling JSON Web Token (JWT) operations including generation, verification, and decoding.
 *
 * @remarks
 * This service implements the IJwtService interface and provides functionality for:
 * - Generating RS256 signed access tokens with configurable issuer, audience, and expiration
 * - Verifying tokens against a public key with optional audience validation
 * - Decoding tokens without verification for inspection purposes
 *
 * @example
 * ```typescript
 * const jwtService = new JwtService(
 *   'https://auth.example.com',
 *   3600,
 *   'https://api.example.com',
 *   logger
 * );
 *
 * const token = jwtService.generateAccessToken({
 *   sub: 'user123',
 *   scope: 'read:users',
 *   client_id: 'client456'
 * });
 * ```
 *
 * @see {@link IJwtService}
 * @see {@link IJwtPayload}
 */

export class JwtService implements IJwtService {
	private readonly algorithm = 'HS256'; // TODO remover al crear llaves
	// private readonly algorithm = 'RS256';

	/**
	 * Creates an instance of the JWT service.
	 *
	 * @param issuer - The issuer identifier for the JWT tokens (typically the authorization server's URL)
	 * @param expiresIn - The expiration time for JWT tokens in seconds
	 * @param audience - The intended recipient(s) of the JWT token. Can be a single string or an array of strings, or undefined
	 * @param logger - Logger instance for logging JWT service operations
	 */

	constructor(
		private readonly issuer: string,
		private readonly expiresIn: number,
		private readonly audience: string | string[] | undefined,
		private readonly logger: ILogger
	) {}

	/**
	 * Generates a JWT access token with the provided payload.
	 *
	 * @param payload - The token payload containing user and client information
	 * @param payload.sub - The subject (user identifier) for whom the token is issued
	 * @param payload.scope - Optional OAuth2 scope defining access permissions
	 * @param payload.client_id - Optional client identifier for OAuth2 client credentials
	 *
	 * @returns A signed JWT access token string
	 *
	 * @throws {Error} If token generation fails (e.g., invalid signing key or payload)
	 *
	 * @remarks
	 * The generated token includes:
	 * - Standard JWT claims (sub, iss, aud, iat, exp)
	 * - Optional scope and client_id if provided
	 * - Signature using the configured algorithm and private key
	 *
	 * @example
	 * ```typescript
	 * const token = jwtService.generateAccessToken({
	 *   sub: 'user123',
	 *   scope: 'read:profile write:profile',
	 *   client_id: 'client_abc'
	 * });
	 * ```
	 *
	 * @todo Implement keys Provider for proper key management
	 */

	public generateAccessToken(payload: { sub: string; scope?: string | undefined; client_id?: string | undefined }): string {
		this.logger.debug('Generating JWT access token', { sub: payload.sub, expiresIn: this.expiresIn });

		try {
			// TODO Implementar keys Provider
			const privateKey = 'Temporal Key';
			const keyId = 'Key-T-001';

			const tokenPayload: Omit<IJwtPayload, 'iat' | 'exp'> = {
				sub: payload.sub,
				iss: this.issuer,
				aud: this.audience,
				...(payload.scope && { scope: payload.scope }),
				...(payload.client_id && { scope: payload.client_id }),
			};

			const options: SignOptions = {
				algorithm: this.algorithm,
				keyid: keyId,
				expiresIn: this.expiresIn,
			};

			const token = sign(tokenPayload, privateKey, options);
			this.logger.debug('JWT access token generated successfully', { sub: payload.sub, tokenLength: token.length });
			return token;
		} catch (error) {
			this.logger.error('Failed to generate JWT access token', { error: getErrMsg(error), sub: payload.sub });
			throw error;
		}
	}
	/**
	 * Verifies and decodes a JWT token.
	 *
	 * @param token - The JWT token string to verify
	 * @param expectedAudience - Optional expected audience value to validate against the token's audience claim
	 *
	 * @returns The decoded JWT payload containing token claims
	 *
	 * @throws {InvalidTokenError} When the token has expired, has an invalid signature/format,
	 *                             audience doesn't match the expected value, or verification fails for any other reason
	 *
	 * @remarks
	 * This method performs the following validations:
	 * - Verifies token signature using the configured algorithm and issuer
	 * - Validates token expiration
	 * - Optionally validates the audience claim if expectedAudience is provided
	 *
	 * @example
	 * ```typescript
	 * const payload = jwtService.verifyToken(tokenString, 'my-app');
	 * console.log(payload.sub); // user identifier
	 * ```
	 */

	public verifyToken(token: string, expectedAudience?: string): IJwtPayload {
		this.logger.debug('Verifying JWT token');

		try {
			// TODO implementar key provider
			const publicKey = 'Temporal Key';

			const decoded = verify(token, publicKey, { algorithms: [this.algorithm], issuer: this.issuer });

			if (typeof decoded === 'string') throw new Error('El token decodificado es un string, no un objeto JWT válido');
			const payload = decoded as IJwtPayload;

			if (expectedAudience) {
				const isAudienceValid = this.validateAudience(payload.aud, expectedAudience);
				if (!isAudienceValid)
					throw new InvalidTokenError(`Token audience mismatch. Expected: ${expectedAudience}, Got: ${JSON.stringify(payload.aud)}`);
			}

			this.logger.debug('JWT token verified successfully', { sub: decoded.sub });

			return decoded as IJwtPayload;
		} catch (error) {
			this.logger.warn('JWT token verification failed', { error: getErrMsg(error) });

			if (error instanceof TokenExpiredError) throw new InvalidTokenError('Token has expired');
			if (error instanceof JsonWebTokenError) throw new InvalidTokenError('Invalid token signature or format');
			throw new InvalidTokenError('Token verification failed');
		}
	}
	/**
	 * Decodes a JWT token without verifying its signature.
	 *
	 * @param token - The JWT token string to decode
	 * @returns The decoded JWT payload if successful, or null if decoding fails or the token is invalid
	 *
	 * @remarks
	 * This method decodes the token without performing signature verification.
	 * It validates that the decoded result is an object (not a string).
	 * All operations are logged for debugging and monitoring purposes.
	 *
	 * @example
	 * ```typescript
	 * const payload = jwtService.decodeToken('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...');
	 * if (payload) {
	 *   console.log(payload.sub);
	 * }
	 * ```
	 */

	public decodeToken(token: string): IJwtPayload | null {
		this.logger.debug('Decoding JWT token without verification');

		try {
			const decoded = decode(token);

			if (!decoded || typeof decoded === 'string') {
				this.logger.warn('JWT token decoding failed', { token });
				return null;
			}

			this.logger.debug('JWT token decoded successfully', { sub: (decoded as IJwtPayload).sub });

			return decoded as IJwtPayload;
		} catch (error) {
			this.logger.warn('JWT token decoding failed', {
				error: error instanceof Error ? error.message : 'Unknown error',
			});
			return null;
		}
	}

	/**
	 * Validates if the token's audience claim matches the expected audience.
	 *
	 * @param tokenAudience - The audience claim from the token, which can be a string, an array of strings, or undefined
	 * @param expectedAudience - The expected audience value to validate against
	 * @returns `true` if the token audience matches the expected audience, `false` otherwise
	 *
	 * @remarks
	 * - If `tokenAudience` is a string, it performs a direct equality check
	 * - If `tokenAudience` is an array, it checks if the expected audience is included in the array
	 * - If `tokenAudience` is undefined or any other type, it returns `false`
	 */

	private validateAudience(tokenAudience: string | string[] | undefined, expectedAudience: string): boolean {
		if (typeof tokenAudience === 'string') {
			return tokenAudience === expectedAudience;
		}

		if (Array.isArray(tokenAudience)) {
			return tokenAudience.includes(expectedAudience);
		}

		return false;
	}
}
