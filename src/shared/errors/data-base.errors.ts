/**
 * Represents an error that occurs during a database operation.
 *
 * @remarks
 * This error is thrown when a database-related operation fails.
 * It extends the built-in `Error` class and includes additional properties
 * such as `statusCode` and `errorType` for standardized error handling.
 *
 * @example
 * ```typescript
 * throw new DatabaseError('Failed to connect to database');
 * ```
 *
 * @property statusCode - The HTTP status code associated with the error (default: 400).
 * @property errorType - A string identifying the type of error ('database').
 * @param message - A descriptive error message (default: 'Database operation failed').
 * @param cause - The underlying cause of the error, if any.
 */

import { PrismaClientKnownRequestError } from '@prisma/client/runtime/client';
import { AppError } from './app.error.js';

class DatabaseError extends Error {
	public statusCode = 422;
	public readonly errorType = 'database';
	constructor(message = 'Database operation failed', cause?: unknown) {
		super(message);
		this.cause = cause;
	}
}

/**
 * Error thrown when a unique constraint is violated in the database.
 *
 * @extends DatabaseError
 * @example
 * throw new UniqueConstraintError('email');
 *
 * @param field - The name of the field that caused the unique constraint violation.
 * @param cause - (Optional) The underlying cause of the error.
 */

class UniqueConstraintError extends DatabaseError {
	constructor(field: string, cause?: unknown) {
		super(`Unique constraint violated on field: ${field}`, cause);
	}
}

/**
 * Error thrown when a foreign key constraint is violated in the database.
 *
 * @extends DatabaseError
 * @example
 * throw new ForeignKeyConstraintError('fk_user_profile');
 *
 * @param constraint - The name of the violated foreign key constraint.
 * @param cause - Optional. The underlying cause of the error.
 */

class ForeignKeyConstraintError extends DatabaseError {
	constructor(constraint: string, cause?: unknown) {
		super(`Foreign key constraint violated: ${constraint}`, cause);
	}
}

/**
 * Represents an error that occurs when a database connection fails or times out.
 *
 * @extends DatabaseError
 * @remarks
 * This error should be thrown when the application is unable to establish a connection
 * to the database, or when a connection attempt exceeds the allowed timeout period.
 *
 * @param cause - (Optional) The underlying cause of the connection failure.
 */

class DatabaseConnectionError extends DatabaseError {
	constructor(cause?: unknown) {
		super('Database connection failed or timeout', cause);
	}
}

export function handledPrismaError(error: unknown): Error {
	if (process.env.NODE_ENV === 'production') {
		delete (error as AppError).stack;
	}

	if (!(error instanceof PrismaClientKnownRequestError)) {
		return new DatabaseConnectionError(error);
	}

	switch (error.code) {
		case 'P2002': {
			const field = (error.meta?.target as string[])?.join(', ') || 'unknown';
			return new UniqueConstraintError(field, error);
		}
		case 'P2003': {
			const constraint = error.meta?.field_name as string;
			return new ForeignKeyConstraintError(constraint, error);
		}
		case 'P2011': // Null constraint violation
			return new UniqueConstraintError('null_constraint', error);
		case 'P1001': // Can't reach database server
		case 'P1003': // Database does not exist
		case 'P1017': // Server has closed the connection
			return new DatabaseConnectionError(error);

		default:
			// Todos los demás errores de Prisma → 500 genérico
			return new DatabaseConnectionError(error);
	}
}
