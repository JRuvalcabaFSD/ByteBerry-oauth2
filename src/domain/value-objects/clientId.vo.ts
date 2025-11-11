/**
 * Value Object representing a Client ID in the OAuth2 domain.
 *
 * @remarks
 * This class encapsulates the Client ID with validation rules to ensure it meets
 * the required constraints. The Client ID is immutable once created.
 *
 * @example
 * ```typescript
 * const clientId = ClientId.create('my-client-id-12345');
 * console.log(clientId.getValue()); // 'my-client-id-12345'
 * ```
 *
 * @see {@link https://datatracker.ietf.org/doc/html/rfc6749#section-2.2 | OAuth 2.0 Client Identifier}
 */

import { InvalidValueObjectError } from '@/shared';

export class ClientId {
  /**
   * Creates a new instance of the ClientId value object.
   *
   * @param value - The string value representing the client identifier
   * @private
   */

  private constructor(private readonly value: string) {}

  /**
   * Creates a new `ClientId` instance after validating the provided value.
   *
   * @param value - The string value to be used as the client ID.
   * @returns A new `ClientId` instance if the value is valid.
   * @throws {InvalidValueObjectError} If the value is empty or its length is not between 8 and 128 characters.
   */

  static create(value: string): ClientId {
    if (!value || value.trim().length === 0) throw new InvalidValueObjectError('Client ID', 'cannot be empty');
    if (value.length < 8 || value.length > 128) throw new InvalidValueObjectError('Client ID', 'must be between 8 and 128 characters');
    return new ClientId(value);
  }

  /**
   * Retrieves the client ID value.
   *
   * @returns The string representation of the client ID.
   */

  public getValue(): string {
    return this.value;
  }

  /**
   * Compares this ClientId with another ClientId for equality.
   *
   * @param other - The ClientId instance to compare with
   * @returns `true` if both ClientId instances have the same value, `false` otherwise
   */

  public equals(other: ClientId): boolean {
    return this.value === other.value;
  }
}
