import { CodeChallengeVO } from '@domain';

/**
 * Use case interface for verifying a PKCE (Proof Key for Code Exchange) code challenge.
 *
 * @remarks
 * This interface defines the contract for verifying that a given code verifier matches a code challenge,
 * as specified in the OAuth 2.0 PKCE extension (RFC 7636).
 *
 * @method verify
 * Verifies whether the provided code verifier corresponds to the given code challenge.
 *
 * @param challenge - The code challenge value object to be verified against.
 * @param verifier - The code verifier string provided by the client.
 * @returns `true` if the verifier matches the challenge, otherwise `false`.
 */

export interface IPkceVerifierUseCase {
	verify(challenge: CodeChallengeVO, verifier: string): boolean;
}
