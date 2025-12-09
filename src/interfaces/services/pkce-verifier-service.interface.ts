import { CodeChallengeVO } from '@domain';

/**
 * Service interface for verifying PKCE (Proof Key for Code Exchange) code challenges.
 *
 * @remarks
 * PKCE is an extension to the OAuth 2.0 Authorization Code flow to prevent
 * authorization code interception attacks. This service handles the verification
 * of the code verifier against the previously provided code challenge.
 *
 * @public
 */

export interface IPKceVerifierService {
	/**
	 * Verifies the provided code verifier against the stored code challenge.
	 *
	 * @param {CodeChallengeVO} challenge - The code challenge stored during the authorization request.
	 * @param {string} verifier - The code verifier provided during the token exchange request.
	 * @return {*}  {boolean} - Returns true if the verifier matches the challenge, false otherwise.
	 * @memberof IPKceVerifierService
	 */

	verify(challenge: CodeChallengeVO, verifier: string): boolean;
}
