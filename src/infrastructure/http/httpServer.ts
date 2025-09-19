/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-explicit-any */
import express from 'express';

import { IEnvConfig, IHttpServer, IUuid } from '@/interfaces';
import { Application } from 'express';
import { createRequestIdMiddleware } from '@/infrastructure/http/middleware/requestId.middleware';
import { securityHeadersMiddleware } from '@/infrastructure/http/middleware/security.middleware';
import { errorHandlerMiddleware } from '@/infrastructure/http/middleware/erroHandler.middleware';

/**
 * HTTP Server implementation using Express.js
 * @export
 * @class HttpServer
 * @implements {IHttpServer}
 */
export class HttpServer implements IHttpServer {
  private readonly app: Application;
  private server: any;
  private readonly config: IEnvConfig;
  private readonly uuid: IUuid;
  private isServerRunning = false;

  /**
   * Creates an instance of HttpServer.
   * @param {IEnvConfig} config
   * @param {IUuid} uuid
   * @memberof HttpServer
   */
  constructor(config: IEnvConfig, uuid: IUuid) {
    this.config = config;
    this.uuid = uuid;
    this.app = express();
    this.setupMiddleware();
  }

  /**
   * Setup Express middleware pipeline
   * @private
   * @memberof HttpServer
   */
  private setupMiddleware(): void {
    this.app.use(createRequestIdMiddleware(this.uuid));
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(securityHeadersMiddleware());
    this.app.use(errorHandlerMiddleware());
  }

  /**
   * Start the HTTP server
   * @return {*}  {Promise<void>}
   * @memberof HttpServer
   */
  public async start(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.server = this.app.listen(this.config.port, () => {
          this.isServerRunning = true;
          console.log(`🚀 HTTP Server started on port ${this.config.port}`);
          console.log(`📝 Environment: ${this.config.nodeEnv}`);
          resolve();
        });

        this.server.on('error', (error: Error) => {
          this.isServerRunning = false;
          reject(error);
        });
      } catch (error) {
        this.isServerRunning = false;
        reject(error);
      }
    });
  }

  /**
   * Stop the HTTP server gracefully
   * @return {*}  {Promise<void>}
   * @memberof HttpServer
   */
  public async stop(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.server || !this.isServerRunning) {
        resolve();
        return;
      }

      this.server.close((error?: Error) => {
        this.isServerRunning = false;
        if (error) {
          reject(error);
        } else {
          console.log('🛑 HTTP Server stopped gracefully');
          resolve();
        }
      });
    });
  }

  /**
   * Get Express application instance
   * @return {*}  {Application}
   * @memberof HttpServer
   */
  public getApp(): Application {
    return this.app;
  }

  /**
   * Check if server is currently running
   * @return {*}  {boolean}
   * @memberof HttpServer
   */
  public isRunning(): boolean {
    return this.isServerRunning;
  }
}
