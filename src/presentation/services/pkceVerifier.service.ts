import { CodeChallenge } from '@/domain';
import { IHashService, ILogger, IPKceVerifierService } from '@/interfaces';
import { LogContextClass, LogContextMethod } from '@/shared';

/**
 * Service for verifying PKCE (Proof Key for Code Exchange) code challenges.
 * Supports both "plain" and "S256" challenge methods as defined by OAuth 2.0 PKCE specification.
 *
 * @remarks
 * - For the "plain" method, the verifier is compared directly to the challenge.
 * - For the "S256" method, the verifier is hashed using SHA-256 and compared to the challenge.
 *
 * @param hashService - An implementation of {@link IHashService} used for hashing the verifier.
 *
 * @see {@link IPKceVerifierService}
 * @see {@link CodeChallenge}
 */

@LogContextClass()
export class PkceVerifierService implements IPKceVerifierService {
  /**
   * Creates an instance of the service.
   * @param hashService - Service responsible for hashing operations.
   * @param logger - Logger instance for logging messages and errors.
   */

  constructor(
    private readonly hashService: IHashService,
    private readonly logger: ILogger
  ) {}

  /**
   * Verifies a PKCE code challenge against a provided verifier.
   *
   * Supports both "plain" and "S256" challenge methods:
   * - For "plain", it directly compares the verifier to the challenge.
   * - For "S256", it hashes the verifier using SHA-256 and compares it to the challenge.
   *
   * @param challenge - The code challenge object containing the challenge value and method.
   * @param verifier - The code verifier string to validate against the challenge.
   * @returns `true` if the verifier matches the challenge according to the method; otherwise, `false`.
   */

  @LogContextMethod()
  public verify(challenge: CodeChallenge, verifier: string): boolean {
    this.logger.debug('PKCE Verification Start', {
      method: challenge.getMethod(),
      challengeValue: challenge.getChallenge(),
      verifierLength: verifier.length,
    });

    if (challenge.isPlainMethod()) {
      // Plain method: direct comparison (no hashing)
      return challenge.verifyPlain(verifier);
    }

    // S256 method: hash verifier and compare
    const computedHash = this.hashService.sha256(verifier);

    this.logger.debug('PKCE S256 Verification', {
      expectedChallenge: challenge.getChallenge(),
      computedHash: computedHash,
      match: computedHash === challenge.getChallenge(),
      expectedLength: challenge.getChallenge().length,
      computedLength: computedHash.length,
    });

    const result = computedHash === challenge.getChallenge();

    if (!result) {
      this.logger.warn('PKCE Verification Failed - Hash Mismatch', {
        expected: challenge.getChallenge(),
        computed: computedHash,
      });
    }

    return result;
  }
}
