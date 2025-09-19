import { Application } from 'express';

/**
 * Interface for the implementation of an HTTP server
 * @export
 * @interface IHttpServer
 */
export interface IHttpServer {
  start(): Promise<void>;
  stop(): Promise<void>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getApp(): Application;
  isRunning(): boolean;
}
