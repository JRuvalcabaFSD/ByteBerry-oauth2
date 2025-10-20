import { ServiceMap } from '@/container/tokens';
import { WinstonLoggerService } from '@/infrastructure';
import { IContainer } from '@/interfaces';

/**
 * Factory that constructs a WinstonLoggerService using dependencies provided by the container.
 *
 * Resolves the 'Config' and 'Clock' services from the given container and returns a new
 * WinstonLoggerService instance configured with those dependencies.
 *
 * @param c - An IoC container implementing resolution for the ServiceMap keys (must provide 'Config' and 'Clock').
 * @returns A fully constructed WinstonLoggerService.
 * @throws {Error} If required dependencies ('Config' or 'Clock') cannot be resolved from the container.
 * @example
 * const logger = createWinstonLoggerService(container);
 */

export function createWinstonLoggerService(c: IContainer<ServiceMap>): WinstonLoggerService {
  return new WinstonLoggerService(c.resolve('Config'), c.resolve('Clock'));
}
