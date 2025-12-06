/**
 * Interface for UUID generation and validation services.
 *
 * @interface IUuid
 * Provides methods for generating universally unique identifiers (UUIDs)
 * and validating UUID strings.
 */

/**
 * Generates a new UUID string.
 *
 * @returns {string} A newly generated UUID string
 */

/**
 * Validates whether a given string is a valid UUID.
 *
 * @param {string} uuid - The string to validate as a UUID
 * @returns {boolean} True if the string is a valid UUID, false otherwise
 */

export interface IUuid {
	generate(): string;
	isValid(uuid: string): boolean;
}
