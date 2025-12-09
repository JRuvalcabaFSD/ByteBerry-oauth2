/**
 * Service interface for cryptographic hashing operations.
 *
 * Provides methods for generating and verifying SHA-256 hashes,
 * commonly used for data integrity verification and password hashing.
 *
 * @interface IHashService
 *
 * @example
 * ```typescript
 * const hashService: IHashService = new HashService();
 * const hash = hashService.sha256('myPassword');
 * const isValid = hashService.verifySha256('myPassword', hash);
 * ```
 */

export interface IHashService {
	sha256(value: string): string;
	verifySha256(value: string, hash: string): boolean;
}
