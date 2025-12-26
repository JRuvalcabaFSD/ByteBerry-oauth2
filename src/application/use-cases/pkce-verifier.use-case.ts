import { CodeChallengeVO } from '@domain';
import type { IHashService, ILogger, IPkceVerifierUseCase } from '@interfaces';
import { LogContextClass, LogContextMethod } from '@shared';

/**
 * Use case class for verifying PKCE (Proof Key for Code Exchange) challenges.
 *
 * This class provides logic to verify a PKCE code challenge against a code verifier,
 * supporting both "plain" and "S256" (SHA-256) methods. It utilizes a hash service
 * for cryptographic verification and a logger for diagnostic output.
 *
 * @remarks
 * PKCE is used in OAuth 2.0 flows to mitigate authorization code interception attacks.
 *
 * @example
 * const isValid = pkceVerifierUseCase.verify(challenge, verifier);
 *
 * @see {@link IHashService}
 * @see {@link ILogger}
 * @see {@link CodeChallengeVO}
 */

@LogContextClass()
export class PkceVerifierUseCase implements IPkceVerifierUseCase {
	constructor(
		public readonly hashServices: IHashService,
		public readonly logger: ILogger
	) {}

	/**
	 * Verifies a PKCE code challenge against a provided verifier string.
	 *
	 * This method supports both "plain" and "S256" (SHA-256) challenge methods.
	 * It logs debug information at the start of verification and warns if verification fails.
	 *
	 * @param challenge - The code challenge value object containing the challenge and its method.
	 * @param verifier - The verifier string to be checked against the challenge.
	 * @returns `true` if the verifier matches the challenge according to its method; otherwise, `false`.
	 */

	@LogContextMethod()
	public verify(challenge: CodeChallengeVO, verifier: string): boolean {
		this.logger.debug('PKCE verification start', {
			methods: challenge.getMethod(),
			challengeValue: challenge.getChallenge(),
			verifierLength: verifier.length,
		});

		//Verificación plana
		if (challenge.isPlainMethod()) return challenge.verifyPlain(verifier);

		//Verificación Sha256
		const result = this.hashServices.verifySha256(verifier, challenge.getChallenge());

		if (!result) {
			this.logger.warn('PKCE verification failed - Hash mismatch');
		}

		return result;
	}
}
