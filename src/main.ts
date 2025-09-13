import { buildContainer, TOKENS } from '@/container';
import { Logger } from '@/interfaces';
import { ExpressHttpServer } from '@/presentation';

export async function main(): Promise<void> {
  const container = buildContainer();
  const logger = container.resolve<Logger>(TOKENS.Logger);
  const server = container.resolve<ExpressHttpServer>(TOKENS.HttpServer);

  const shutdown = async (signal: string) => {
    try {
      logger.warn(`Received ${signal}. Shutting down...`);
      await server.stop();
      process.exit(0);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      logger.error('Error during shutdown', error);
      process.exit(1);
    }
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));

  await server.start();
}
