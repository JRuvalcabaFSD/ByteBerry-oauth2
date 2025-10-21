import express, { Application } from 'express';
import { Server } from 'http';

import * as middlewares from '@/infrastructure';
import { IClock, IConfig, IContainer, IHttpServer, ILogger, ServerInfo } from '@/interfaces';
import { getErrorMessage, LogContextClass, LogContextMethod } from '@/shared';
import { ServiceMap } from '@/container';

/**
 * HttpServer
 *
 * Lightweight wrapper around an Express Application that manages server lifecycle,
 * middleware registration and runtime server metadata.
 *
 * Responsibilities:
 * - Constructs and configures an Express application with security, CORS, request-id,
 *   logging and body-parsing middlewares.
 * - Mounts application routes resolved from the provided dependency container.
 * - Registers a centralized error handler for HTTP errors and unhandled routes.
 * - Controls the HTTP server lifecycle (start/stop) and exposes runtime information.
 *
 * Behavior:
 * - start(): Asynchronously starts listening on the configured port. Resolves when the
 *   underlying Node HTTP server begins listening; rejects if the server emits an 'error'
 *   event during startup. On successful start, the server's startTime is recorded using
 *   the injected Clock implementation and an informational log is emitted.
 * - stop(): Asynchronously stops the running server. If no server is running, the method
 *   logs a warning and returns immediately. If the underlying server close operation
 *   produces an error, the returned Promise rejects with that error; otherwise it
 *   resolves after clearing runtime state and logging shutdown information.
 *
 * Concurrency & Safety:
 * - start() and stop() return Promises to allow callers to sequence lifecycle operations.
 * - start() installs an 'error' listener on the created Server to surface startup failures.
 * - isRunning() inspects the internal Server instance and its listening state to determine
 *   whether the server is currently serving requests.
 *
 * Dependencies (resolved from the constructor container):
 * - Config: provides runtime configuration such as the listening port.
 * - Clock: used to obtain accurate start time for server metadata.
 * - Logger: used for structured logging throughout lifecycle and error handling.
 * - Uuid, plus various middleware factories, are used during application setup.
 *
 * Side effects:
 * - Binds to a network port when started.
 * - Mutates internal server state (server reference and startTime) on start/stop.
 *
 * Notes:
 * - The class disables the 'x-powered-by' header and sets 'trust proxy' on the app.
 * - The class uses a request-id middleware and a logger middleware to enrich logs with
 *   contextual request information.
 * - The start and stop methods are instrumented with a logging context decorator
 *   (LogContextMethod) to ensure consistent contextual logging.
 *
 * Example:
 * - Construct with an IoC container that resolves required services, then call start()
 *   to begin serving and stop() to gracefully shut down.
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
   * Initializes the HTTP server instance using the provided dependency injection container.
   *
   * Resolves required services (Config, Clock, Logger) from the container, creates an Express application,
   * registers global middlewares, mounts application routes using `createAppRoutes(container)`, and installs
   * the centralized error handler.
   *
   * @param container - The dependency injection container that implements IContainer<ServiceMap> and
   *                    provides concrete implementations for the required services.
   */

  constructor(private readonly container: IContainer<ServiceMap>) {
    this.config = this.container.resolve('Config');
    this.clock = this.container.resolve('Clock');
    this.logger = this.container.resolve('Logger');
    this.app = express();
    this.setupMiddlewares();
    this.app.use(middlewares.createAppRoutes(this.container));
    this.setupErrorHandler();
  }

  /**
   * Starts the HTTP server and returns a promise that resolves when the server begins listening.
   *
   * Side effects:
   * - Calls `this.app.listen(this.config.port)` to start the server.
   * - Stores the server instance on `this.server`.
   * - Sets `this.startTime` to `this.clock.now()`.
   * - Logs a success message when listening.
   * - Attaches an 'error' event handler that logs the error and rejects the returned promise if the server fails to start.
   *
   * Behavior:
   * - The returned Promise resolves once the server is successfully listening.
   * - The returned Promise rejects if the server emits an 'error' event during startup.
   * - Synchronous exceptions thrown while attempting to start the server are logged.
   *
   * @returns Promise<void> that resolves when the HTTP server is listening and rejects on startup errors.
   *
   * @example
   * await httpServer.start();
   */

  @LogContextMethod()
  public start(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.server = this.app.listen(this.config.port, () => {
          this.startTime = this.clock.now();

          this.logger.info('Http Server started successfully');
          resolve();
        });

        this.server.on('error', error => {
          this.logger.error('Http Server failed to start', {
            error: getErrorMessage(error),
            port: this.config.port,
          });

          reject(error);
        });
      } catch (error) {
        this.logger.error('Failed to start Http Server', { error: getErrorMessage(error) });
      }
    });
  }

  /**
   * Stops the HTTP server if it is running.
   *
   * If no server is running, a warning is logged and a resolved Promise is returned.
   * If a server is running, attempts to close it and returns a Promise that:
   * - resolves when the server has been stopped successfully, or
   * - rejects if an error occurs while closing the server.
   *
   * Side effects:
   * - Logs informational, warning, and error messages via this.logger.
   * - On successful stop, sets this.server and this.startTime to null.
   *
   * This method is safe to call multiple times (idempotent) — subsequent calls when
   * no server is present will immediately resolve.
   *
   * @returns Promise<void> that resolves when the server has been stopped or immediately if no server was running.
   * @throws Will reject the returned Promise with the error provided by the server's close callback if closing fails.
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
          this.logger.error('Error stopping Http Server', { error: getErrorMessage(error) });
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
   * Returns the underlying Express Application instance used by this HTTP server.
   *
   * This allows callers to register middleware, inspect or modify routes, or
   * integrate the app with testing utilities (for example, SuperTest) without
   * starting the network listener.
   *
   * The returned Application is the same instance managed internally by this class.
   *
   * @returns The Express Application instance.
   */

  public getApp(): Application {
    return this.app;
  }

  public isRunning(): boolean {
    return this.server !== null && this.server.listening;
  }

  /**
   * Returns information about the HTTP server as a snapshot of its current runtime state.
   *
   * The returned ServerInfo contains:
   * - port: the configured listening port for the server
   * - isRunning: a boolean indicating whether the server is currently running
   * - startTime: the server start time (included only when available)
   *
   * @returns {ServerInfo} An object describing the server's port, running state, and,
   * when set, the time the server was started.
   */

  public getServerInfo(): ServerInfo {
    return {
      port: this.config.port,
      isRunning: this.isRunning(),
      ...(this.startTime && { startTime: this.startTime }),
    };
  }

  /**
   * Configure and attach application-level Express middlewares.
   *
   * This method mutates `this.app` to:
   *  - enable 'trust proxy' so client IPs can be correctly derived behind proxies,
   *  - disable the 'X-Powered-By' header to avoid revealing framework details,
   *  - attach security-related headers via createSecurityMiddleware(),
   *  - configure Cross-Origin Resource Sharing using createCORSMiddleware(this.config),
   *  - assign a per-request identifier using the UUID provider from the DI container
   *    (container.resolve('Uuid')),
   *  - install a request logger that uses this.logger and this.clock, and
   *  - register JSON and URL-encoded body parsers with a 10 MB payload limit.
   *
   * The order of middleware registration is deliberate: security and CORS are applied early,
   * request IDs and logging are available for all subsequent middleware and handlers, and
   * body parsers run after those to ensure logged requests include identifiers and security context.
   *
   * Side effects: depends on `this.container`, `this.config`, `this.logger`, and `this.clock`,
   * and modifies `this.app`.
   *
   * @private
   * @returns void
   */

  private setupMiddlewares(): void {
    this.app.set('trust proxy', true);
    this.app.disable('x-powered-by');
    this.app.use(middlewares.createSecurityMiddleware());
    this.app.use(middlewares.createCORSMiddleware(this.config));
    this.app.use(middlewares.createRequestIdMiddleware(this.container.resolve('Uuid')));
    this.app.use(middlewares.createLoggerMiddleware(this.logger, this.clock));
    this.app.use(express.json({ limit: '10mb' }));
    this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  }

  /**
   * Attaches the application's centralized error-handling middleware to the HTTP server.
   *
   * This method registers the middleware returned by `middlewares.createErrorMiddleware`
   * onto the Express application instance so that uncaught errors and rejected promises
   * from request handlers are consistently logged and converted into HTTP error responses
   * according to the application's configuration.
   *
   * @private
   * @returns void
   */

  private setupErrorHandler(): void {
    this.app.use(middlewares.createErrorMiddleware(this.logger, this.config));
  }
}
