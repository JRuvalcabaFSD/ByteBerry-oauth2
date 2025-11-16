import express, { Application } from 'express';
import { Server } from 'http';

import * as Middlewares from '@/infrastructure';

import { IClock, IConfig, IContainer, IHttpServer, ILogger, ServerInfo } from '@/interfaces';
import { getErrMsg, LogContextClass, LogContextMethod } from '@/shared';
import { createAppRoutes } from '@/presentation';

/**
 * HTTP server implementation that manages the Express application lifecycle.
 *
 * @remarks
 * This class is responsible for:
 * - Initializing and configuring the Express application
 * - Setting up middleware stack (security, CORS, logging, request parsing)
 * - Managing server lifecycle (start, stop, status)
 * - Providing server information and runtime state
 *
 * The server uses dependency injection through a container to resolve:
 * - Configuration settings
 * - Clock for time management
 * - Logger for application logging
 * - UUID generator for request tracking
 *
 * @example
 * ```typescript
 * const httpServer = new HttpServer(container);
 * await httpServer.start();
 * console.log(httpServer.getServerInfo());
 * await httpServer.stop();
 * ```
 *
 * @implements {IHttpServer}
 */

@LogContextClass()
export class HttpServer implements IHttpServer {
  private readonly app: Application;
  private readonly config: IConfig;
  private readonly clock: IClock;
  private readonly logger: ILogger;
  private server: Server | null = null;
  private startTime: Date | null = null;

  /**
   * Creates an instance of the HTTP server.
   *
   * Initializes the Express application with the following setup:
   * - Resolves required dependencies (Config, Clock, Logger) from the container
   * - Configures middleware stack
   * - Sets up application routes using the container
   * - Configures error handling middleware
   *
   * @param container - The dependency injection container used to resolve application dependencies
   */

  constructor(private readonly container: IContainer) {
    this.config = this.container.resolve('Config');
    this.clock = this.container.resolve('Clock');
    this.logger = this.container.resolve('Logger');
    this.app = express();
    this.setupMiddlewares();
    this.app.use(createAppRoutes(this.container));
    this.setupErrorHandler();
  }

  /**
   * Starts the HTTP server and listens on the configured port.
   *
   * @returns A promise that resolves when the server successfully starts listening,
   *          or rejects if an error occurs during startup.
   *
   * @remarks
   * This method performs the following actions:
   * - Initializes the server to listen on the port specified in the configuration
   * - Records the start time when the server begins listening
   * - Logs success or error messages based on the startup outcome
   * - Sets up an error handler for server startup failures
   *
   * @throws Will reject the promise if the server fails to start or encounters an error
   */

  @LogContextMethod()
  public async start(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.server = this.app.listen(this.config.port, () => {
          this.startTime = this.clock.now();

          this.logger.info('Http Server started successfully');
          resolve();
        });

        this.server.on('error', error => {
          this.logger.error('Http Server failed to start', { error: getErrMsg(error), port: this.config.port });
          reject(error);
        });
      } catch (error) {
        this.logger.error('Failed to start Http Server', { error: getErrMsg(error) });
      }
    });
  }

  /**
   * Stops the HTTP server gracefully.
   *
   * @remarks
   * This method closes all active connections and stops accepting new requests.
   * If the server is not running, it logs a warning and resolves immediately.
   * Upon successful shutdown, the server instance and start time are reset to null.
   *
   * @returns A promise that resolves when the server has been stopped successfully,
   * or rejects if an error occurs during the shutdown process.
   *
   * @throws {Error} Rejects with an error if the server fails to close properly.
   */

  @LogContextMethod()
  public async stop(): Promise<void> {
    if (!this.server) {
      this.logger.warn('Http Server stop called but server is not running');
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      this.server?.close(error => {
        if (error) {
          this.logger.error('Error stopping Http Server', { error: getErrMsg(error) });
          reject(error);
        } else {
          this.logger.info('Http Server stopped successfully');
          this.server = null;
          this.startTime = null;
          resolve();
        }
      });
    });
  }

  /**
   * Gets the Express application instance.
   *
   * @returns The Express application instance configured with all routes and middleware.
   */

  public getApp(): Application {
    return this.app;
  }

  /**
   * Checks if the HTTP server is currently running and actively listening for connections.
   *
   * @returns {boolean} `true` if the server is running and listening, `false` otherwise.
   */

  public isRunning(): boolean {
    return this.server !== null && this.server.listening;
  }

  /**
   * Retrieves information about the HTTP server's current state.
   *
   * @returns {ServerInfo} An object containing the server's port number, running status,
   * and optionally the start time if the server has been started.
   *
   * @remarks
   * The startTime property is only included in the returned object if the server
   * has been started at least once.
   */

  public getServerInfo(): ServerInfo {
    return {
      port: this.config.port,
      isRunning: this.isRunning(),
      ...(this.startTime && { startTime: this.startTime }),
    };
  }

  //TODO documentar
  private setupMiddlewares(): void {
    this.app.set('trust proxy', true);
    this.app.disable('x-powered-by');
    this.app.use(Middlewares.createSecurityMiddleware());
    this.app.use(Middlewares.createCORSMiddleware(this.config));
    this.app.use(Middlewares.createRequestIdMiddleware(this.container.resolve('Uuid')));
    this.app.use(Middlewares.createLoggerMiddleware(this.logger, this.clock));
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  }

  /**
   * Sets up the global error handling middleware for the Express application.
   *
   * This method registers an error middleware that catches and processes any errors
   * that occur during request handling. The middleware uses the application's logger
   * and configuration to properly format and log error responses.
   *
   * @remarks
   * This should be called after all other middleware and route handlers are registered,
   * as Express error handlers must be added last in the middleware chain.
   *
   * @private
   */

  private setupErrorHandler(): void {
    this.app.use(Middlewares.createErrorMiddleware(this.logger, this.config));
  }
}
