import jwt, { JwtPayload } from 'jsonwebtoken';

import { IConfig, IJwtPayload, IJwtService, IKeyLoader, ILogger } from '@interfaces';
import { getErrMsg, InvalidTokenError } from '@shared';

/**
 * Service for handling JWT (JSON Web Token) operations such as generation, verification, and decoding.
 *
 * @remarks
 * This service uses asymmetric cryptography (RS256) for signing and verifying JWTs.
 * It loads private and public keys via the provided `IKeyLoader` and uses configuration values
 * for issuer, audience, and token expiration.
 *
 * @implements {IJwtService}
 *
 * @constructor
 * @param config - The configuration object containing JWT settings.
 * @param KeyLoader - Service responsible for loading private and public keys.
 * @param logger - Logger instance for logging debug and error information.
 *
 * @method generateAccessToken
 * Generates a signed JWT access token with the provided payload.
 *
 * @param payload - The JWT payload excluding standard claims (`iat`, `exp`, `iss`, `aud`).
 * @returns The signed JWT access token as a string.
 * @throws Error if token generation fails.
 *
 * @method verifyToken
 * Verifies the provided JWT token's signature, issuer, and (optionally) audience.
 *
 * @param token - The JWT token to verify.
 * @param expectedAudience - (Optional) The expected audience to validate against the token's audience claim.
 * @returns The decoded JWT payload if verification succeeds.
 * @throws InvalidTokenError if verification fails, token is expired, or audience does not match.
 *
 * @method decodeToken
 * Decodes a JWT token without verifying its signature.
 *
 * @param token - The JWT token to decode.
 * @returns The decoded JWT payload, or `null` if decoding fails.
 *
 * @private
 * @method validateAudience
 * Validates the audience claim in the JWT payload against the expected audience.
 *
 * @param aud - The audience claim from the JWT payload.
 * @param expectedAudience - The expected audience value.
 * @returns `true` if the audience matches, otherwise `false`.
 */

export class JwtService implements IJwtService {
	private readonly privateKey: string;
	private readonly publicKey: string;
	private readonly issuer: string;
	private readonly audience: string[];
	private readonly accessTokenExpiration: number;
	private readonly algorithm = 'RS256';

	constructor(
		private readonly config: IConfig,
		private readonly KeyLoader: IKeyLoader,
		private readonly logger: ILogger
	) {
		this.privateKey = this.KeyLoader.getPrivateKey();
		this.publicKey = this.KeyLoader.getPublicKey();
		this.issuer = this.config.jwtIssuer;
		this.audience = this.config.jwtAudience;
		this.accessTokenExpiration = this.config.jwtAccessTokenExpiresIn;
	}

	public generateAccessToken(payload: Omit<IJwtPayload, 'iat' | 'exp' | 'iss' | 'aud'>): string {
		try {
			const now = Math.floor(Date.now() / 1000);

			//Generate the payload
			const completedPayload: JwtPayload = {
				...payload,
				iss: this.issuer,
				aud: this.audience,
				iat: now,
				exp: now + this.accessTokenExpiration,
			};

			//Create and return the token
			const token = jwt.sign(completedPayload, this.privateKey, { algorithm: this.algorithm });

			this.logger.debug('Access token generated', {
				sub: payload.sub,
				email: payload.email,
				client_id: payload.client_id,
				scope: payload.scope,
				expiresIn: this.accessTokenExpiration,
			});

			return token;
		} catch (error) {
			this.logger.error('Failed to generate JWT access token', { error: getErrMsg(error), sub: payload.sub });
			throw error;
		}
	}

	public verifyToken(token: string, expectedAudience?: string): JwtPayload {
		try {
			const decoded = jwt.verify(token, this.publicKey, { algorithms: [this.algorithm], issuer: this.issuer });
			if (typeof decoded === 'string') throw new Error('The decoded token is a string, not a valid JWT object');
			if (expectedAudience) {
				const isValidAudience = this.validateAudience(decoded.aud, expectedAudience);

				if (!isValidAudience)
					throw new InvalidTokenError(`Token audience mismatch. Expected: ${expectedAudience}, Got: ${JSON.stringify(decoded.aud)}`);
			}

			this.logger.debug('JWT token verified successfully', { sub: decoded.sub });

			return decoded;
		} catch (error) {
			this.logger.warn('JWT token verification failed', { error: getErrMsg(error) });

			if (error instanceof jwt.TokenExpiredError) throw new InvalidTokenError('Token has expired');
			if (error instanceof jwt.JsonWebTokenError) throw new InvalidTokenError('Invalid token signature or format');
			throw new InvalidTokenError('Token verification failed');
		}
	}

	public decodeToken(token: string): JwtPayload | null {
		this.logger.debug('Decoding JWT token without verification');

		try {
			const decoded = jwt.decode(token);

			if (!decoded || typeof decoded === 'string') {
				this.logger.warn('JWT token decoding failed');
				return null;
			}

			this.logger.debug('JWT token decoded successfully', { sub: (decoded as IJwtPayload).sub });

			return decoded as JwtPayload;
		} catch (error) {
			this.logger.warn('JWT token decoding failed', { error: getErrMsg(error) });
			return null;
		}
	}

	private validateAudience(aud: string | string[] | undefined, expectedAudience: string): boolean {
		if (typeof aud === 'string') {
			return aud === expectedAudience;
		}

		if (Array.isArray(aud)) {
			return aud.includes(expectedAudience);
		}

		return false;
	}
}
