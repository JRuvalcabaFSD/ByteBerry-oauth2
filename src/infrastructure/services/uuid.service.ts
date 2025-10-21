import { IUuid } from '@/interfaces';
import { randomUUID } from 'crypto';

/**
 * UuidService
 *
 * Utility service for generating and validating RFC 4122 version 4 (v4) UUIDs.
 *
 * The service provides two primary operations:
 * - generate(): Create a cryptographically strong v4 UUID string using the runtime's
 *   random UUID source.
 * - isValid(uuid: string): Verify that the supplied value is a string and matches
 *   the v4 UUID pattern (including correct version and variant bits).
 *
 * @remarks
 * Validation is performed with a case-insensitive regular expression that enforces
 * the v4 version digit ('4') and the allowed variant characters ('8', '9', 'a', 'b').
 * The generate method delegates to the environment's randomUUID implementation;
 * environments that do not expose a compatible API may require a polyfill.
 *
 * @example
 * const id = uuidService.generate(); // '6f1e2d3c-4b5a-4f6e-9a0b-123456789abc'
 * uuidService.isValid(id); // true
 *
 * @public
 */

export class UuidService implements IUuid {
  private static readonly UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

  /**
   * Generates a cryptographically secure RFC 4122 version 4 UUID.
   *
   * Uses the platform's secure random generator (via crypto.randomUUID).
   *
   * @returns The generated UUID as a string (for example `"3f0a1e1e-7c6b-4d2a-9f1b-0a1b2c3d4e5f"`).
   * @example
   * const id = uuidService.generate();
   * // id => "3f0a1e1e-7c6b-4d2a-9f1b-0a1b2c3d4e5f"
   * @see https://nodejs.org/api/crypto.html#cryptorandomuuidoptions
   */

  public generate(): string {
    return randomUUID();
  }

  /**
   * Determines whether the provided value is a valid UUID string.
   *
   * The input is considered valid only if it is of type "string" and it
   * matches the regular expression defined by UuidService.UUID_REGEX.
   *
   * @param uuid - The value to validate as a UUID.
   * @returns True if `uuid` is a string that matches `UuidService.UUID_REGEX`; otherwise false.
   *
   * @example
   * // true
   * isValid('3fa85f64-5717-4562-b3fc-2c963f66afa6');
   *
   * @example
   * // false (not a string)
   * isValid(null);
   *
   * @example
   * // false (invalid UUID format)
   * isValid('not-a-uuid');
   */

  public isValid(uuid: string): boolean {
    return typeof uuid === 'string' && UuidService.UUID_REGEX.test(uuid);
  }
}

/**
 * Creates and returns a new UuidService instance.
 *
 * This factory function centralizes the construction of UuidService objects,
 * making it easy to obtain a fresh instance without importing the class
 * directly at the call site.
 *
 * @returns A new instance of UuidService.
 */

export const createUuidService = () => new UuidService();
