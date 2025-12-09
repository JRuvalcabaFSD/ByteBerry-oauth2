import { AppError } from '@shared';

/**
 * Custom error class for domain validation errors in the OAuth2 system.
 *
 * This error is thrown when domain-specific validation rules are violated,
 * such as invalid business logic constraints or domain entity validation failures.
 *
 * @extends AppError
 *
 * @example
 * ```typescript
 * throw new DomainValidator('Invalid email format');
 * ```
 *
 * @remarks
 * This error automatically sets the error context to 'oauth' and the error name to 'DomainValidator'.
 */

export class DomainValidator extends AppError {
	/**
	 * Creates a new instance of the DomainValidator error.
	 *
	 * @param message - The error message describing the domain validation failure
	 */
	constructor(message: string) {
		super(message, 'domain');
		this.name = 'DomainValidator';
	}
}

/**
 * Error thrown when a value object fails validation.
 *
 * This error extends DomainValidator and is used to indicate that a value object
 * could not be created or validated due to invalid data or constraints violation.
 *
 * @extends DomainValidator
 *
 * @example
 * ```typescript
 * throw new InvalidValueObjectError('Email', 'Invalid email format');
 * // Error message: "Invalid Email: Invalid email format"
 * ```
 *
 * @param valueObjectName - The name of the value object that failed validation
 * @param reason - A detailed explanation of why the validation failed
 */

export class InvalidValueObjectError extends DomainValidator {
	/**
	 * Creates an instance of InvalidValueObjectError.
	 *
	 * @param valueObjectName - The name of the value object that is invalid
	 * @param reason - The reason why the value object is invalid
	 */

	constructor(reason: string) {
		super(`Invalid object: ${reason}`);
		this.name = 'InvalidValueObjectError';
	}
}
