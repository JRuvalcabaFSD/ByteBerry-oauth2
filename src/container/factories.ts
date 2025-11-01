import { WinstonLoggerService } from '@/infrastructure';
import { IContainer } from '@/interfaces';

/**
 * Factory function to create a WinstonLoggerService instance.
 *
 * @param c - The dependency injection container used to resolve dependencies
 * @returns A new instance of WinstonLoggerService with resolved Config and Clock dependencies
 */

export function createWinstonLoggerService(c: IContainer): WinstonLoggerService {
  return new WinstonLoggerService(c.resolve('Config'), c.resolve('Clock'));
}
