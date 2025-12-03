/**
 * Extracts an error message from an unknown error value.
 *
 * @param error - The error value to extract a message from. Can be of any type.
 * @returns A string containing the error message if the error is an instance of Error,
 *          otherwise returns the string 'unknown error'.
 *
 * @example
 * ```ts
 * try {
 *   throw new Error('Something went wrong');
 * } catch (error) {
 *   console.log(getErrMsg(error)); // Output: 'Something went wrong'
 * }
 *
 * console.log(getErrMsg('not an error')); // Output: 'unknown error'
 * ```
 */

export function getErrMsg(error: unknown): string {
	return error instanceof Error ? error.message : 'unknown error';
}

// /**
//  * Extracts the stack trace from an error object.
//  *
//  * @param error - The error object to extract the stack trace from. Can be of any type.
//  * @returns The stack trace as a string if the error is an instance of Error, otherwise undefined.
//  *
//  * @example
//  * ```ts
//  * try {
//  *   throw new Error('Something went wrong');
//  * } catch (error) {
//  *   const stack = getErrStack(error);
//  *   console.log(stack);
//  * }
//  * ```
//  */

// export function getErrStack(error: unknown): string | undefined {
// 	return error instanceof Error ? error.stack : undefined;
// }
