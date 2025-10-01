import { Application } from 'express';

export type ServerInfo = {
  port: number;
  isRunning: boolean;
  startTime?: Date;
};

/**
 * Interface for HTTP server implementations.
 *
 * Defines the contract for HTTP server lifecycle management and introspection.
 * Implementations should handle server startup, shutdown, and provide access
 * to the underlying application instance and server information.
 */
export interface IHttpServer {
  /**
   * Starts the HTTP server.
   *
   * @return {*}  {Promise<void>} A promise that resolves when the server has started.
   * @memberof IHttpServer
   */

  start(): Promise<void>;

  /**
   * Stops the HTTP server.
   *
   * @return {*}  {Promise<void>} A promise that resolves when the server has stopped.
   * @memberof IHttpServer
   */

  stop(): Promise<void>;

  /**
   * Retrieves the underlying application instance.
   *
   * @return {*}  {Promise<void>} A promise that resolves with the application instance.
   * @memberof IHttpServer
   */

  getApp(): Application;

  /**
   * Checks if the HTTP server is currently running.
   *
   * @return {*}  {boolean} True if the server is running, false otherwise.
   * @memberof IHttpServer
   */

  isRunning(): boolean;

  /**
   * Retrieves information about the HTTP server.
   *
   * @return {*}  {ServerInfo} An object containing server information such as port and status.
   * @memberof IHttpServer
   */

  getServerInfo(): ServerInfo;
}
