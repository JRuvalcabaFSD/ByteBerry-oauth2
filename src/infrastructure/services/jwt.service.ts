import { JsonWebTokenError, sign, SignOptions, TokenExpiredError, verify, decode } from 'jsonwebtoken';

import { IJwtPayload, IJwtService, IKeyProvider, ILogger } from '@/interfaces';
import { getErrMsg, InvalidTokenError } from '@/shared';

export class JwtService implements IJwtService {
  private readonly algorithm = 'RS256';

  constructor(
    private readonly issuer: string,
    private readonly expiresIn: number,
    private readonly audience: string | string[] | undefined,
    private readonly keyProvider: IKeyProvider,
    private readonly logger: ILogger
  ) {}

  public generateAccessToken(payload: { sub: string; scope?: string | undefined; client_id?: string | undefined }): string {
    this.logger.debug('Generating JWT access token', { sub: payload.sub, expiresIn: this.expiresIn });

    try {
      const privateKey = this.keyProvider.getPrivateKey();
      const keyId = this.keyProvider.getKeyId();

      const tokenPayload: Omit<IJwtPayload, 'iat' | 'exp'> = {
        sub: payload.sub,
        iss: this.issuer,
        aud: this.audience,
        ...(payload.scope && { scope: payload.scope }),
        ...(payload.client_id && { client_id: payload.client_id }),
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
   * Verifies a JWT token using the configured public key, algorithm, and issuer.
   * Validates the token's audience against the expected audience if provided.
   * Logs verification steps and errors.
   *
   * @param token - The JWT token to verify.
   * @param expectedAudience - The expected audience value to validate against the token's `aud` claim.
   * @returns The decoded JWT payload as an {@link IJwtPayload} object.
   * @throws {InvalidTokenError} If the token is expired, has an invalid signature or format, or fails audience validation.
   */

  public verifyToken(token: string, expectedAudience?: string): IJwtPayload {
    this.logger.debug('Verifying JWT token');

    try {
      const publicKey = this.keyProvider.getPublicKey();

      const decoded = verify(token, publicKey, {
        algorithms: [this.algorithm],
        issuer: this.issuer,
      });

      if (typeof decoded === 'string') {
        throw new Error('El token decodificado es un string, no un objeto JWT válido');
      }

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
   * @param token - The JWT token string to decode.
   * @returns The decoded payload as `IJwtPayload` if successful, or `null` if decoding fails.
   *
   * @remarks
   * This method does not perform any validation or verification of the token's signature.
   * Use with caution if you require token authenticity.
   *
   * @example
   * ```typescript
   * const payload = jwtService.decodeToken(token);
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
   * Validates whether the provided token audience matches the expected audience.
   *
   * This method checks if the `tokenAudience` (which may be a string, an array of strings, or undefined)
   * contains the `expectedAudience`. If `tokenAudience` is a string, it compares directly.
   * If it's an array, it checks for inclusion. Returns `false` if `tokenAudience` is undefined or does not match.
   *
   * @param tokenAudience - The audience claim from the token, which can be a string, an array of strings, or undefined.
   * @param expectedAudience - The audience value to validate against.
   * @returns `true` if the expected audience is present in the token audience; otherwise, `false`.
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
