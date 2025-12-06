/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-console */

import { BootstrapError, ConfigError, ContainerError, getErrMsg, getErrStack, getUTCTimestamp } from '@shared';

const Colors = { Red: '\x1b[31m', Yellow: '\x1b[33m', Bold: '\x1b[1m', Reset: '\x1b[0m' };

//TODO documentar
const HANDLERS = new Map<string, (error: any) => void>([
	[
		'config',
		(error: ConfigError) => {
			const timestamp = getUTCTimestamp();
			// Leer NODE_ENV en tiempo de ejecución
			const isDevelopment = process.env.NODE_ENV === 'development';
			const message = process.env.NODE_ENV === 'production' ? 'Configuration error' : error.message;

			let logMessage = `${timestamp} [ByteBerry-OAuth2] ${message}`;

			// Solo agregar contexto en desarrollo
			if (isDevelopment && error.context) {
				logMessage += `\n${JSON.stringify(error.context, null, 2)}`;
			}

			// Solo agregar stack en desarrollo
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
			const timestamp = getUTCTimestamp();
			// Leer NODE_ENV en tiempo de ejecución
			const message = process.env.NODE_ENV === 'production' ? 'Container error' : error.message;
			let stack = null;
			if (process.env.NODE_ENV === 'development') {
				stack = getErrStack(error);
			}
			console.log(`${timestamp} [ByteBerry-OAuth2] ${message}${stack ? `\n${stack}` : ''}`);
		},
	],
	[
		'bootstrap',
		(error: BootstrapError) => {
			const timestamp = getUTCTimestamp();
			const message = process.env.NODE_ENV === 'production' ? 'Bootstrap error' : error.message;
			const context = error.context;
			let stack = null;
			if (process.env.NODE_ENV === 'development') {
				stack = getErrStack(error);
			}
			console.log(
				`${timestamp} [ByteBerry-OAuth2] ${Colors.Red}${Colors.Bold}Bootstrap error:${Colors.Reset} ${message}${context ? `\n${JSON.stringify(context, null, 2)}` : ''}${stack ? `\n${stack}` : ''}`
			);
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
