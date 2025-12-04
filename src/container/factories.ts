import { IContainer, ILogContext, ILogger } from '@interfaces';
import { Config } from '@config';
import { ClockService } from '@infrastructure';
import { WinstonLoggerService } from 'src/infrastructure/services/winston.logger.service.js';

/**
 * Creates and returns a new instance of the Config class.
 *
 * @returns {Config} A new Config instance
 *
 * @example
 * ```typescript
 * const config = createConfig();
 * ```
 */

export const createConfig = () => new Config();

/**
 * Factory function that creates and returns a new instance of ClockService.
 *
 * @returns {ClockService} A new ClockService instance
 *
 * @example
 * ```ts
 * const clockService = createClockService();
 * ```
 */

export const createClockService = () => new ClockService();

/**
 * Factory function that creates and configures a Winston logger service instance.
 *
 * @param c - The dependency injection container used to resolve required dependencies
 * @returns A configured instance of the Winston logger service implementing the ILogger interface
 *
 * @remarks
 * This factory resolves the 'Config' and 'Clock' dependencies from the container
 * and injects them into the WinstonLoggerService constructor.
 */

export function createWintonLoggerService(c: IContainer): ILogger {
	return new WinstonLoggerService(c.resolve('Config'), c.resolve('Clock'));
}
