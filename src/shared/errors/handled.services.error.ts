/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-console */

import { ConfigError, ContainerError, getErrMsg, getErrStack, getUTCTimestamp } from '@shared';

//TODO documentar
const HANDLERS = new Map<string, (error: any) => void>([
	[
		'config',
		(error: ConfigError) => {
			const timestamp = getUTCTimestamp();
			// Leer NODE_ENV en tiempo de ejecución
			const message = process.env.NODE_ENV === 'production' ? 'Configuration error' : error.message;
			let stack = null;
			if (process.env.NODE_ENV === 'development') {
				stack = getErrStack(error);
			}
			console.log(`${timestamp} [ByteBerry-OAuth2] ${message}${stack ? `\n${stack}` : ''}`);
		},
	],
	[
		'container',
		(error: ContainerError) => {
			const timestamp = getUTCTimestamp();
			const message = process.env.NODE_ENV === 'production' ? 'Container error' : error.message;
			let stack = null;
			// Leer NODE_ENV en tiempo de ejecución
			if (process.env.NODE_ENV === 'development') {
				stack = getErrStack(error);
			}
			console.log(`${timestamp} [ByteBerry-OAuth2] ${message}${stack ? `\n${stack}` : ''}`);
		},
	],
	[
		'bootstrap',
		(error: ContainerError) => {
			const timestamp = getUTCTimestamp();
			const message = process.env.NODE_ENV === 'production' ? 'Bootstrap error' : error.message;
			let stack = null;
			// Leer NODE_ENV en tiempo de ejecución
			if (process.env.NODE_ENV === 'development') {
				stack = getErrStack(error);
			}
			console.log(`${timestamp} [ByteBerry-OAuth2] ${message}${stack ? `\n${stack}` : ''}`);
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
