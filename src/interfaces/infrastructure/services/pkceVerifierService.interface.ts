/**
 * Interface for a service that verifies PKCE (Proof Key for Code Exchange) challenges.
 *
 * PKCE is an OAuth 2.0 extension designed to enhance the security of public clients.
 * This service provides a method to validate that a given code verifier matches the expected code challenge.
 *
 * @see https://tools.ietf.org/html/rfc7636
 */

import { CodeChallenge } from '@/domain';

export interface IPKceVerifierService {
  /**
   * Verifies that the provided code verifier matches the given code challenge.
   *
   * @param {CodeChallenge} challenge - The code challenge to verify against.
   * @param {string} verifier - The code verifier provided by the client.
   * @return {*}  {boolean} - Returns true if the verifier matches the challenge; otherwise, false.
   * @memberof IPKceVerifierService
   */

  verify(challenge: CodeChallenge, verifier: string): boolean;
}
