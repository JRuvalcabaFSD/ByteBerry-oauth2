import { Server } from 'http';
import express, { Application } from 'express';

import { IClock, IConfig, IHealthController, IHttpServer, ILogger, IUuid, ServerInfo } from '@/interfaces';
import {
  createCORSMiddleware,
  createErrorMiddleware,
  createHealthRoutes,
  createLoggerMiddleware,
  createRequestIdMiddleware,
  createSecurityMiddleware,
} from '@/infrastructure';

/**
 * HTTP Server implementation that provides a complete Express.js server setup
 * with middleware configuration, routing, and lifecycle management.
 *
 * This class encapsulates an Express application with pre-configured security,
 * CORS, logging, and error handling middlewares. It provides methods to start
 * and stop the server, check its running status, and retrieve server information.
 *
 * @example
 * ```typescript
 * const httpServer = new HttpServer(config, logger, uuid, clock);
 * await httpServer.start();
 * console.log(httpServer.getServerInfo());
 * await httpServer.stop();
 * ```
 *
 * @implements {IHttpServer}
 */
export class HttpServer implements IHttpServer {
  private readonly app: Application;
  private server: Server | null = null;
  private startTime: Date | null = null;

  /**
   * Creates an instance of HttpServer.
   * @param {IConfig} config - Configuration settings for the server
   * @param {ILogger} logger - Logger instance for logging
   * @param {IUuid} uuid - UUID generator instance
   * @param {IClock} clock - Clock instance for time-related functions
   * @memberof HttpServer
   */

  constructor(
    private readonly config: IConfig,
    private readonly logger: ILogger,
    private readonly uuid: IUuid,
    private readonly clock: IClock,
    private readonly healthController: IHealthController
  ) {
    this.app = express();
    this.setupMiddlewares();
    this.setupRoutes();
    this.setupErrorHandlers();
  }

  /**
   * Starts the HTTP server and begins listening on the configured port.
   *
   * On successful startup, the server instance is created, the start time is recorded
   * using the injected clock, and a log entry is emitted indicating success. If an
   * error occurs either synchronously during startup or via the server's "error" event,
   * the error is logged and the returned promise is rejected.
   *
   * Side effects:
   * - Initializes and assigns the internal HTTP `server` instance.
   * - Registers an "error" event listener on the server.
   * - Updates `startTime` with the current timestamp from the clock.
   *
   * @returns A promise that resolves when the server is listening, or rejects if startup fails.
   * @throws Rejection with the underlying error if the server fails to start.
   * @public
   */

  public async start(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.server = this.app.listen(this.config.port, () => {
          this.startTime = this.clock.now();

          this.logger.info('HTTP Server started successfully');
          resolve();
        });

        this.server.on('error', (error: Error) => {
          this.logger.error('Http Server failed to start', {
            error: error.message,
            port: this.config.port,
          });
          reject(error);
        });
      } catch (error) {
        this.logger.error('Failed to start Http Server', {
          error: (error as Error).message,
        });
        reject(error);
      }
    });
  }
  /**
   * Stops the HTTP server gracefully.
   *
   * @returns A Promise that resolves when the server is successfully stopped,
   *          or rejects if an error occurs during shutdown.
   *
   * @remarks
   * - If the server is not currently running, logs a warning and resolves immediately
   * - Resets internal state (server and startTime) upon successful shutdown
   * - Logs appropriate messages for both success and error scenarios
   */

  public async stop(): Promise<void> {
    if (!this.server) {
      this.logger.warn('Http Server stop called but server is not running');
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      this.server?.close(error => {
        if (error) {
          this.logger.error('Error stopping Http Server', { error: error.message });
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
   * Retrieves the underlying Express application instance used by this HTTP server.
   *
   * Use this to register additional middleware, routes, or to integrate with testing
   * utilities that require direct access to the Express app.
   *
   * @returns The Express Application managed by this server.
   */

  public getApp(): Application {
    return this.app;
  }

  /**
   * Checks if the HTTP server is currently running and listening for connections.
   *
   * @returns {boolean} True if the server is initialized and actively listening, false otherwise.
   */

  public isRunning(): boolean {
    return this.server !== null && this.server.listening;
  }

  /**
   * Retrieves comprehensive information about the HTTP server's current state.
   *
   * @returns {ServerInfo} An object containing the server's configuration and runtime status,
   * including the port number, running state, and start time (if the server has been started).
   * The start time is only included in the response when the server has been previously started.
   */

  public getServerInfo(): ServerInfo {
    return {
      port: this.config.port,
      isRunning: this.isRunning(),
      ...(this.startTime && { startTime: this.startTime }),
    };
  }

  /**
   * Sets up all middleware for the Express application.
   *
   * Configures the following middleware in order:
   * - Trust proxy setting for proper client IP detection
   * - Disables the 'x-powered-by' header for security
   * - Security middleware for request protection
   * - CORS middleware for cross-origin request handling
   * - Request ID middleware for request tracking
   * - Logger middleware for request/response logging
   * - JSON body parser with 10MB limit
   * - URL-encoded body parser with 10MB limit
   *
   * @private
   */

  private setupMiddlewares() {
    this.app.set('trust proxy', true);
    this.app.disable('x-powered-by');
    this.app.use(createSecurityMiddleware());
    this.app.use(createCORSMiddleware(this.config));
    this.app.use(createRequestIdMiddleware(this.uuid));
    this.app.use(createLoggerMiddleware(this.logger, this.clock));
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  }

  /**
   * Sets up the HTTP routes for the server.
   *
   * Configures the following routes:
   * - GET `/` - Returns service information including version, status, timestamp, and available endpoints
   * - Catch-all `*` - Returns a 404 error response for unmatched routes
   *
   * The root endpoint provides service metadata and health check endpoint references,
   * while the catch-all handler ensures proper error responses for invalid routes.
   *
   * @private
   */

  private setupRoutes() {
    this.app.use('/', createHealthRoutes(this.healthController));
    this.app.get('/', (req, res) => {
      res.json({
        service: this.config.serviceName,
        version: this.config.version,
        status: 'running',
        timestamp: this.clock.isoString(),
        requestId: req.requestId,
        environment: this.config.nodeEnv,
        endpoints: {
          health: '/health',
          deepHealth: '/health/deep',
        },
      });
    });

    // 404 handler for unmatched routes
    this.app.use('{*splat}', (req, res) => {
      res.status(404).json({
        error: 'Not Found',
        message: `Route ${req.method} ${req.originalUrl} not found`,
        requestId: req.requestId,
        timestamp: this.clock.isoString(),
      });
    });
  }

  /**
   * Sets up error handling middleware for the Express application.
   *
   * This method configures the application to use a custom error middleware
   * that handles and logs errors throughout the request/response cycle.
   *
   * @private
   * @memberof HttpServer
   */

  private setupErrorHandlers() {
    this.app.use(createErrorMiddleware(this.logger, this.config));
  }
}
