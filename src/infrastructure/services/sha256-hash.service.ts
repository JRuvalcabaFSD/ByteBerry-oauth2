import { IHashService } from '@interfaces';
import { createHash } from 'crypto';

/**
 * Implementation of the IHashService interface using Node.js crypto module.
 * Provides SHA-256 hashing functionality with base64url encoding.
 *
 * @remarks
 * This service uses the native Node.js `crypto` module to perform cryptographic operations.
 * The hash outputs are encoded in base64url format, which is URL-safe.
 *
 * @example
 * ```typescript
 * const hashService = new NodeHashService();
 * const hash = hashService.sha256('myPassword');
 * const isValid = hashService.verifySha256('myPassword', hash);
 * ```
 */

export class NodeHashService implements IHashService {
	/**
	 * Generates a SHA-256 hash of the provided value.
	 *
	 * @param value - The string value to be hashed
	 * @returns A base64url-encoded SHA-256 hash of the input value
	 *
	 * @example
	 * ```typescript
	 * const hash = sha256('mySecretValue');
	 * // Returns: 'base64url-encoded-hash-string'
	 * ```
	 */

	public sha256(value: string): string {
		return createHash('sha256').update(value).digest('base64url');
	}
	/**
	 * Verifies if a given value matches a SHA-256 hash.
	 *
	 * @param value - The plain text value to verify
	 * @param hash - The SHA-256 hash to compare against
	 * @returns `true` if the computed hash of the value matches the provided hash, `false` otherwise
	 *
	 * @example
	 * ```typescript
	 * const isValid = verifySha256('myPassword', 'a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3');
	 * console.log(isValid); // true or false
	 * ```
	 */

	public verifySha256(value: string, hash: string): boolean {
		const computed = this.sha256(value);
		return computed === hash;
	}
}
