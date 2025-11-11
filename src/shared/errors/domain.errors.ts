/**
 * Represents a domain validation error within the application.
 *
 * This error type is used to indicate that a validation rule specific to the domain
 * has been violated. It extends the standard `Error` class and sets the error type
 * to `'domain'` for identification.
 *
 * @example
 * ```typescript
 * throw new DomainValidationError('Invalid email address');
 * ```
 *
 * @extends Error
 */

export class DomainValidationError extends Error {
  public readonly errorType = 'domain';
  constructor(message: string) {
    super(message);
    this.name = 'DomainValidationError';
  }
}

/**
 * Represents an error thrown when a value object is invalid according to domain validation rules.
 *
 * @remarks
 * This error should be used to indicate that a value object failed validation due to a specific reason.
 *
 * @example
 * ```typescript
 * throw new InvalidValueObjectError('Email', 'Email format is incorrect');
 * ```
 *
 * @param valueObjectName - The name of the value object that is invalid.
 * @param reason - The reason why the value object is considered invalid.
 */

export class InvalidValueObjectError extends DomainValidationError {
  constructor(valueObjectName: string, reason: string) {
    super(`Invalid ${valueObjectName}: ${reason}`);
    this.name = 'InvalidValueObjectError';
  }
}
