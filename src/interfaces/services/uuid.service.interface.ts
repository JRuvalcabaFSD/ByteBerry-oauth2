/**
 * Interface for UUID (Universally Unique Identifier) service.
 *
 * Provides methods to generate and validate UUIDs.
 *
 * @interface IUuid
 *
 * @method generate - Generates a new UUID string.
 * @method isValid - Validates if a given string is a valid UUID.
 *
 * @example
 * const uuidService: IUuid = ...;
 * const newUuid = uuidService.generate();
 * const isValid = uuidService.isValid(newUuid);
 */

export interface IUuid {
	generate(): string;
	isValid(uuid: string): boolean;
}
