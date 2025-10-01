import { TOKENS } from '@/container';
import { WinstonLoggerService } from '@/infrastructure';
import { IContainer } from '@/interfaces';

/**
 * Creates a WinstonLoggerService using dependencies resolved from the provided container.
 *
 * @param c - The inversion-of-control container used to resolve the configuration and clock dependencies.
 * @returns A configured WinstonLoggerService instance.
 *
 * @remarks
 * Internally resolves TOKENS.Config and TOKENS.Clock from the container and passes them to the
 * WinstonLoggerService constructor.
 */

export function createWinstonLoggerService(c: IContainer): WinstonLoggerService {
  return new WinstonLoggerService(c.resolve(TOKENS.Config), c.resolve(TOKENS.Clock));
}
