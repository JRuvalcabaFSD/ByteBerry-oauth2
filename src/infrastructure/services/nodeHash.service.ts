import * as crypto from 'crypto';

import { IHashService } from '@/interfaces';

/**
 * Service for hashing and verifying strings using the SHA-256 algorithm.
 *
 * Implements the `IHashService` interface.
 *
 * @remarks
 * Uses Node.js `crypto` module to generate SHA-256 hashes encoded in base64.
 *
 * @example
 * ```typescript
 * const hashService = new NodeHashService();
 * const hash = hashService.sha256('myValue');
 * const isValid = hashService.verifySha256('myValue', hash);
 * ```
 */

export class NodeHashService implements IHashService {
  /**
   * Generates a SHA-256 hash of the provided string value and returns it encoded in base64.
   *
   * @param value - The input string to be hashed.
   * @returns The base64-encoded SHA-256 hash of the input value.
   */

  public sha256(value: string): string {
    return crypto.createHash('sha256').update(value).digest('base64url');
  }
  /**
   * Verifies whether the SHA-256 hash of a given value matches a provided hash.
   *
   * @param value - The input string to hash and verify.
   * @param hash - The SHA-256 hash to compare against.
   * @returns `true` if the computed hash matches the provided hash, otherwise `false`.
   */

  public verifySha256(value: string, hash: string): boolean {
    const computed = this.sha256(value);
    return computed === hash;
  }
}

/**
 * Creates and returns a new instance of {@link NodeHashService}.
 *
 * @returns {NodeHashService} A newly instantiated NodeHashService.
 */

export const createNodeHashService = () => new NodeHashService();
