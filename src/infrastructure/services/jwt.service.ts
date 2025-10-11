import { decode, sign, verify } from 'jsonwebtoken';

import { IClock, IConfig, IJwtGenerateOption, IJwtPayload, IJwtService, IJwtVerifyResult, ILogger } from '@/interfaces';
import { JwtConfigurationError, JwtGenerationError } from '@/shared';

/**
 * JwtService is responsible for generating, verifying, and decoding JSON Web Tokens (JWTs) using RS256 algorithm.
 *
 * @class JwtService
 * @implements {IJwtService}
 *
 * @param {IConfig} config - Configuration object containing JWT settings such as private key, public key, issuer, audience, and expiration time.
 * @param {ILogger} logger - Logger instance for logging debug and error messages.
 * @param {IClock} clock - Clock instance for getting the current time.
 *
 * @throws {JwtConfigurationError} If the JWT configuration is invalid, such as missing keys or incorrect format.
 *
 * @method generateToken(options: IJwtGenerateOption): Promise<string>
 * Generates a JWT token with the specified options.
 *
 * @param {IJwtGenerateOption} options - Options for generating the token, including subject, client ID, scope, and expiration time.
 *
 * @returns {Promise<string>} The generated JWT token.
 *
 * @method verifyToken(token: string): Promise<IJwtVerifyResult>
 * Verifies the validity of a given JWT token.
 *
 * @param {string} token - The JWT token to verify.
 *
 * @returns {Promise<IJwtVerifyResult>} An object indicating whether the token is valid and the decoded payload if valid.
 *
 * @method decodeToken(token: string): IJwtPayload | null
 * Decodes a given JWT token without verifying its validity.
 *
 * @param {string} token - The JWT token to decode.
 *
 * @returns {IJwtPayload | null} The decoded payload or null if decoding fails.
 */

export class JwtService implements IJwtService {
  private readonly privateKey: string;
  private readonly publicKey: string;
  private readonly issuer: string;
  private readonly audience: string;
  private readonly defaultExpiresIn: number;
  private readonly mainContext = 'JwtService';

  /**
   * Constructs a new JWT service instance.
   *
   * Initializes JWT settings (RS256 keys, issuer, audience, and default expiration) from the
   * provided configuration, validates the configuration, and logs a debug message upon success.
   *
   * @param config Application configuration containing JWT options (private/public keys, issuer, audience, expiration).
   * @param logger Logger used to emit diagnostic information during initialization.
   * @param clock Time provider used for time-based operations such as token issuance and expiration.
   * @throws Error If the JWT configuration is missing or invalid.
   */

  constructor(
    private readonly config: IConfig,
    private readonly logger: ILogger,
    private readonly clock: IClock
  ) {
    const context = this.mainContext + 'constructor';
    this.privateKey = this.config.jwt.privateKey;
    this.publicKey = this.config.jwt.publicKey;
    this.issuer = this.config.jwt.issuer;
    this.audience = this.config.jwt.audience;
    this.defaultExpiresIn = config.jwt.expiresIn;

    this.validateConfiguration();

    this.logger.debug('JwtService initialized with RS256 algorithm', { context });
  }

  /**
   * Validates the JWT service configuration before any token operations.
   *
   * This method ensures that:
   * - A non-empty private key is configured.
   * - A non-empty public key is configured.
   * - The configured keys are in PEM format (e.g., contain BEGIN/END markers).
   * - Both `issuer` and `audience` are provided.
   *
   * On successful validation, a debug message is logged for traceability.
   *
   * @throws {JwtConfigurationError} If the private key is missing or empty.
   * @throws {JwtConfigurationError} If the public key is missing or empty.
   * @throws {JwtConfigurationError} If the keys are not in the expected PEM format.
   * @throws {JwtConfigurationError} If either the issuer or audience is not configured.
   *
   * @private
   */

  private validateConfiguration(): void {
    const context = this.mainContext + 'validateConfiguration';
    if (!this.privateKey || this.privateKey.length === 0) throw new JwtConfigurationError('JWT_PRIVATE_KEY is not configured');
    if (!this.publicKey || this.publicKey.length === 0) throw new JwtConfigurationError('JWT_PUBLIC_KEY is not configured');
    if (!this.privateKey.includes('BEGIN') || this.privateKey.includes('BEGIN')) {
      throw new JwtConfigurationError('JWT keys must be in PEM format');
    }
    if (!this.issuer || !this.audience) throw new JwtConfigurationError('JWT issuer and audience must be configured');
    this.logger.debug('JWT configuration validated successfully', { context });
  }

  /**
   * Generates and signs a JWT for the provided subject and client.
   *
   * The payload includes the following registered and custom claims: `sub`, `client_id`, `scope`,
   * `iat`, `exp`, `iss`, and `aud`. The token is signed with RS256 using the service’s private key
   * and includes a JOSE header `kid` of `"default"`.
   *
   * Expiration is calculated as `iat + expiresIn` (in seconds). If `expiresIn` is not provided,
   * the service’s default expiration is used.
   *
   * @param options - Token generation options.
   * @param options.subject - The subject (`sub`) of the token (e.g., user or entity identifier).
   * @param options.clientId - The OAuth2 client identifier to place in the `client_id` claim.
   * @param options.scope - A space-delimited string of scopes to include in the `scope` claim.
   * @param options.expiresIn - Token lifetime in seconds; defaults to the service’s configured value.
   *
   * @returns A promise that resolves to the signed JWT string.
   *
   * @throws JwtGenerationError If token signing fails or any unexpected error occurs.
   *
   * @remarks
   * - `iss` (issuer) and `aud` (audience) are derived from the service configuration.
   * - `iat` (issued at) is based on the service clock at signing time.
   * - Emits debug logs on success and error logs on failure before throwing.
   */

  public async generateToken(options: IJwtGenerateOption): Promise<string> {
    const context = this.mainContext + 'generateToken';
    try {
      const now = this.clock.now();
      const iat = Math.floor(now.getTime() / 1000);
      const exp = iat + (options.expiresIn || this.defaultExpiresIn);

      const payload: IJwtPayload = {
        sub: options.subject,
        client_id: options.clientId,
        scope: options.scope,
        iat,
        exp,
        iss: this.issuer,
        aud: this.audience,
      };

      const token = sign(payload, this.privateKey, { algorithm: 'RS256', keyid: 'default' });

      this.logger.debug('JWT token generated', {
        context,
        subject: options.subject,
        clientId: options.clientId,
        expiresIn: options.expiresIn || this.defaultExpiresIn,
      });

      return token;
    } catch (error) {
      this.logger.error('Failed to generate JWT token', { context, error });
      throw new JwtGenerationError(error instanceof Error ? error.message : 'Unknown error', error instanceof Error ? error : undefined);
    }
  }

  /**
   * Verifies a JWT using the configured RS256 public key and validates the `iss` (issuer) and `aud` (audience) claims.
   *
   * On success, resolves with `{ valid: true, payload }`. On failure, resolves with `{ valid: false, error }`.
   * This method does not throw; failures are captured and returned in the result object. It also logs a debug message
   * on success and a warning on failure.
   *
   * @param token - The JWT string to verify (for example, the value from an Authorization header without the "Bearer " prefix).
   * @returns A promise that resolves to the verification result, including a validity flag, the decoded payload when valid,
   *          or an error message when invalid.
   * @remarks The token must be signed with RS256 and match the configured issuer and audience. Standard JWT checks
   *          (such as expiration) are enforced by the underlying verification.
   */

  public async verifyToken(token: string): Promise<IJwtVerifyResult> {
    const context = this.mainContext + 'verifyToken';
    try {
      const decoded = verify(token, this.publicKey, { algorithms: ['RS256'], issuer: this.issuer, audience: this.audience }) as IJwtPayload;

      this.logger.debug('JWT token verified successfully', { context, subject: decoded.sub, clientId: decoded.client_id });

      return {
        valid: true,
        payload: decoded,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      this.logger.warn('JWT token verification failed', { context, error: errorMessage });

      return {
        valid: false,
        error: errorMessage,
      };
    }
  }

  /**
   * Decodes a JSON Web Token (JWT) and returns its payload without validating the signature.
   *
   * Use this for non-sensitive scenarios (e.g., reading non-trusted claims) where full verification
   * is not required. Do not use the result for authentication or authorization decisions.
   *
   * @param token - The encoded JWT string to decode.
   * @returns The decoded payload as `IJwtPayload` if successful; otherwise `null` when decoding fails.
   * @remarks
   * - No cryptographic verification is performed.
   * - On failure, a warning is logged and `null` is returned instead of throwing.
   * @example
   * const payload = jwtService.decodeToken(accessToken);
   * if (payload) {
   *   console.log(payload.sub);
   * }
   */

  public decodeToken(token: string): IJwtPayload | null {
    const context = this.mainContext + 'decodeToken';
    try {
      return decode(token) as IJwtPayload;
    } catch (error) {
      this.logger.warn('Failed to decode JWT token', { context, error });
      return null;
    }
  }
}
