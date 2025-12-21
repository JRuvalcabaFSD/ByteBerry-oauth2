/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-console */

import { BootstrapError, ConfigError, ContainerError, getErrMsg, getErrStack, getUTCTimestamp } from '@shared';
import { AppError } from '@domain';

const Colors = { Red: '\x1b[31m', Yellow: '\x1b[33m', Bold: '\x1b[1m', Reset: '\x1b[0m' };

//TODO documentar
const HANDLERS = new Map<string, (error: any) => void>([
	[
		'config',
		(error: ConfigError) => {
			const isDevelopment = process.env.NODE_ENV === 'development';
			let logMessage = getMessage(error, 'Config error');

			// Just add context in development
			if (isDevelopment && error.context) {
				logMessage += `\n${JSON.stringify(error.context, null, 2)}`;
			}

			// Just add stack in development
			if (isDevelopment) {
				const stack = getErrStack(error);
				if (stack) {
					logMessage += `\n${stack}`;
				}
			}

			console.log(logMessage);
		},
	],
	[
		'container',
		(error: ContainerError) => {
			const isDevelopment = process.env.NODE_ENV === 'development';
			let logMessage = getMessage(error, 'Container');

			// Just add stack in development
			if (isDevelopment) {
				const stack = getErrStack(error);
				if (stack) {
					logMessage += `\n${stack}`;
				}
			}

			console.log(logMessage);
		},
	],
	[
		'bootstrap',
		(error: BootstrapError) => {
			const isDevelopment = process.env.NODE_ENV === 'development';
			let logMessage = getMessage(error, 'Bootstrap error');

			// Just add stack in development
			if (isDevelopment) {
				const stack = getErrStack(error);
				if (stack) {
					logMessage += `\n${stack}`;
				}
			}

			console.log(logMessage);
		},
	],
]);

/**
 * Default error handler that logs internal server errors to the console.
 *
 * @param error - The error object to be handled. Can be of any type.
 *
 * @remarks
 * This function processes errors by:
 * - Categorizing them as "Internal Server Error"
 * - Generating a UTC timestamp
 * - Extracting the error message using `getErrMsg`
 * - Logging the formatted error to the console with the ByteBerry-OAuth2 namespace
 *
 * @example
 * ```typescript
 * try {
 *   // some operation
 * } catch (error) {
 *   defaultHandler(error);
 * }
 * ```
 */

const defaultHandler = (error: any) => {
	const type = 'Internal Server Error';
	const timestamp = getUTCTimestamp();
	const message = getErrMsg(error);
	console.log(`${timestamp} [ByteBerry-OAuth2] ${type}: ${message}`);
};

/**
 * Handles service errors by routing them to appropriate error handlers based on error type.
 *
 * @param error - The error object to be handled. Can be of any type and will be cast internally.
 *
 * @remarks
 * This function examines the `errorType` property of the error object and dispatches it to
 * a corresponding handler from the HANDLERS map. If no matching handler is found or if the
 * errorType is not defined, the error is passed to the defaultHandler.
 *
 * @example
 * ```typescript
 * try {
 *   // some operation
 * } catch (error) {
 *   handledServicesError(error);
 * }
 * ```
 */

export function handledServicesError(error: any): void {
	const err = error as any;
	const handler = (err.errorType && HANDLERS.get(err.errorType)) || defaultHandler;

	handler(error);
}

function getMessage(error: AppError, type: string): string {
	const timestamp = getUTCTimestamp();
	return `${timestamp} [ByteBerry-OAuth2] ${Colors.Red}${Colors.Bold}${type ?? 'Error'}:${Colors.Reset} ${error.message}`;
}
