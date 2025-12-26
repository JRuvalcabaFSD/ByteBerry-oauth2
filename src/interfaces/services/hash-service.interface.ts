/**
 * Interface for a service that provides hashing-related operations.
 *
 * @remarks
 * This interface defines a contract for verifying if a given value matches a provided SHA-256 hash.
 *
 * @method verifySha256
 * Verifies whether the provided value, when hashed using SHA-256, matches the given hash.
 *
 * @param value - The plain text string to verify.
 * @param hash - The SHA-256 hash to compare against.
 * @returns `true` if the value matches the hash; otherwise, `false`.
 */

export interface IHashService {
	verifySha256(value: string, hash: string): boolean;
}
