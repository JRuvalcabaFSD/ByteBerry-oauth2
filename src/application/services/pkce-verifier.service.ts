import { CodeChallengeVO } from '@domain';
import { IHashService, ILogger, IPKceVerifierService } from '@interfaces';

/**
 * Service responsible for verifying PKCE (Proof Key for Code Exchange) challenges.
 *
 * This service implements the PKCE verification flow as defined in RFC 7636, supporting
 * both 'plain' and 'S256' (SHA-256) challenge methods. It validates that a code verifier
 * matches the previously provided code challenge.
 *
 * @remarks
 * The service uses a hash service for S256 method verification and a logger for
 * debugging and monitoring verification attempts.
 *
 * @example
 * ```typescript
 * const verifier = new PkceVerifierService(hashService, logger);
 * const isValid = verifier.verify(codeChallenge, codeVerifier);
 * ```
 *
 * @see {@link IPKceVerifierService} for the interface definition
 * @see {@link CodeChallengeVO} for the code challenge value object
 */

export class PkceVerifierService implements IPKceVerifierService {
	constructor(
		public readonly hashService: IHashService,
		public readonly logger: ILogger
	) {}

	/**
	 * Verifies a PKCE (Proof Key for Code Exchange) code verifier against a code challenge.
	 *
	 * This method supports two verification methods:
	 * - **Plain**: Direct string comparison between the verifier and challenge
	 * - **S256**: SHA-256 hash comparison where the verifier is hashed and compared to the challenge
	 *
	 * The verification process includes debug logging to track the verification steps and
	 * warnings when verification fails.
	 *
	 * @param challenge - The code challenge value object containing the challenge value and method
	 * @param verifier - The code verifier string to be verified against the challenge
	 * @returns `true` if the verifier matches the challenge according to the specified method, `false` otherwise
	 *
	 * @example
	 * ```typescript
	 * const challenge = new CodeChallengeVO('S256', 'E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM');
	 * const verifier = 'dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk';
	 * const isValid = pkceVerifier.verify(challenge, verifier);
	 * ```
	 */

	public verify(challenge: CodeChallengeVO, verifier: string): boolean {
		this.logger.debug('PKCE Verification Start', {
			method: challenge.getMethod(),
			challengeValue: challenge.getChallenge(),
			verifierLength: verifier.length,
		});

		if (challenge.isPlainMethod()) {
			return challenge.verifyPlain(verifier);
		}

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
