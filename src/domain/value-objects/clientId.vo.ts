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

export class ClientId {
  /**
   * Creates a new instance of the ClientId value object.
   *
   * @param value - The string value representing the client identifier
   * @private
   */

  private constructor(private readonly value: string) {}

  /**
   * Creates a new ClientId instance from a string value.
   *
   * @param value - The client ID string to validate and wrap
   * @returns A new ClientId instance
   * @throws {Error} When the value is empty or contains only whitespace
   * @throws {Error} When the value length is less than 8 or greater than 128 characters
   *
   * @example
   * ```typescript
   * const clientId = ClientId.create('my-client-id-123');
   * ```
   */

  static create(value: string): ClientId {
    if (!value || value.trim().length === 0) throw new Error('Client ID cannot be empty');
    if (value.length < 8 || value.length > 128) throw new Error('Client ID must be between 8 and 128 characters');
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
