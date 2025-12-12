import { NodeEnv } from '@interfaces';

/**
 * Represents the response structure for the home/root endpoint of the service.
 *
 * @interface HomeResponse
 * @property {string} service - The name of the service
 * @property {string} version - The current version of the service
 * @property {string} status - The operational status of the service
 * @property {string} timestamp - The timestamp when the response was generated
 * @property {string | undefined} [requestId] - Optional unique identifier for the request
 * @property {NodeEnv} environment - The current environment (e.g., development, production)
 * @property {Record<string, unknown> | string[]} endpoints - Available API endpoints, either as an object or array of strings
 */

export interface HomeResponse {
	service: string;
	version: string;
	status: string;
	timestamp: string;
	requestId?: string | undefined;
	environment: NodeEnv;
	endpoints: Record<string, unknown> | string[];
}
