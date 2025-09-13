import express, { Request, Response, Application } from 'express';
import http from 'node:http';

import { HttpServer, Logger } from '@/interfaces';
import { HealthController } from '@/presentation';

// TODO mover el controller para el AppRoutes

type ExpressHttpServerDeps = {
  logger: Logger;
  port: number;
  healthController: HealthController;
};

export class ExpressHttpServer implements HttpServer {
  private app: Application;
  private server?: http.Server;
  private readonly port: number;
  private readonly logger: Logger;
  private readonly healthController: HealthController;

  constructor({ healthController, logger, port }: ExpressHttpServerDeps) {
    this.logger = logger;
    this.port = port;
    this.healthController = healthController;
    this.app = express();
    this.configure();
    this.registerRoutes();
  }
  configure() {
    this.app.disable('x-powered-by');
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
  }
  registerRoutes() {
    this.app.get('/health', (_req: Request, res: Response) => {
      const payload = this.healthController.status();
      res.status(200).json(payload);
    });

    this.app.use((_req: Request, res: Response) => {
      res.status(404).json({ error: 'NOT_FOUND', message: 'Not Found' });
    });
  }
  async start(): Promise<void> {
    await new Promise<void>(resolve => {
      this.server = this.app.listen(this.port, () => resolve());
    });
    this.logger.info(`HTTP server running on port ${this.port}`);
  }
  async stop(): Promise<void> {
    if (!this.server) return;
    await new Promise<void>((resolve, reject) => {
      this.server!.close(err => (err ? reject(err) : resolve()));
    });
    this.logger.info(`HTTP server stopped`);
  }
}
