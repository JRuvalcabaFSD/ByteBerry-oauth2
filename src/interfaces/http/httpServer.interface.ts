import { Application } from 'express';

/**
 * Runtime information describing an HTTP server instance.
 *
 * Provides the port the server listens on, whether it is currently running,
 * and an optional timestamp for when the server was started.
 *
 * @property port - The TCP port number the server is bound to.
 * @property isRunning - True if the server is currently running and accepting requests.
 * @property startTime - Optional Date representing when the server was started (if known).
 *
 * @remarks
 * Use this type for status reporting, health checks, and administrative endpoints.
 *
 * @example
 * const info: ServerInfo = { port: 8080, isRunning: true, startTime: new Date() };
 */

export type ServerInfo = {
  port: number;
  isRunning: boolean;
  startTime?: Date;
};

/**
 * Represents an HTTP server managed by the application.
 *
 * Provides lifecycle control (start/stop), access to the underlying HTTP application
 * instance for middleware and route registration, and runtime metadata about the
 * listening server.
 *
 * @remarks
 * - start(): Initializes and begins listening for incoming connections. Implementations
 *   should resolve the returned promise once the server is ready to accept requests.
 * - stop(): Gracefully stops the server and releases resources. Implementations should
 *   resolve once shutdown is complete.
 * - getApp(): Returns the underlying Application instance (for example, an Express or
 *   Koa app) so callers can register middleware or inspect routes.
 * - isRunning(): Returns true when the server is currently accepting connections.
 * - getServerInfo(): Returns metadata about the server (such as host, port, and protocol)
 *   appropriate for the concrete implementation.
 *
 * @example
 * const server: IHttpServer = createHttpServer();
 * await server.start();
 * const app = server.getApp();
 * console.log(server.getServerInfo());
 * await server.stop();
 *
 * @public
 */

export interface IHttpServer {
  /**
   * Starts the HTTP server, initializing all necessary resources and beginning to listen for incoming requests.
   *
   * @return {*}  {Promise<void>} A promise that resolves when the server has successfully started.
   * @memberof IHttpServer
   */

  start(): Promise<void>;

  /**
   * Stops the HTTP server, gracefully shutting down all active connections and releasing resources.
   *
   * @return {*}  {Promise<void>} A promise that resolves when the server has successfully stopped.
   * @memberof IHttpServer
   */

  stop(): Promise<void>;

  /**
   * Returns the underlying HTTP application instance.
   *
   * @return {*}  {Application} The HTTP application instance (e.g., Express app).
   * @memberof IHttpServer
   */

  getApp(): Application;

  /**
   * Returns whether the HTTP server is currently running.
   *
   * @return {*}  {boolean} 	True if the server is running; otherwise, false.
   * @memberof IHttpServer
   */

  isRunning(): boolean;

  /**
   * Returns metadata about the server (such as host, port, and protocol)
   * appropriate for the concrete implementation.
   *
   * @return {*}  {ServerInfo}
   * @memberof IHttpServer
   */

  getServerInfo(): ServerInfo;
}
