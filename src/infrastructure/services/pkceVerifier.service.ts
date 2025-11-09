import { CodeChallenge } from '@/domain';
import { IHashService, IPKceVerifierService } from '@/interfaces';

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

export class PkceVerifierService implements IPKceVerifierService {
  /**
   * Creates an instance of the service with the provided hash service dependency.
   * @param hashService An implementation of the IHashService interface used for hashing operations.
   */

  constructor(private readonly hashService: IHashService) {}

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

  public verify(challenge: CodeChallenge, verifier: string): boolean {
    if (challenge.isPlainMethod()) {
      // Plain method: direct comparison (no hashing)
      return challenge.verifyPlain(verifier);
    }

    // S256 method: hash verifier and compare
    const computedHash = this.hashService.sha256(verifier);
    return computedHash === challenge.getChallenge();
  }
}
