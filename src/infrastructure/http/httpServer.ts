import express, { Application } from 'express';
import { Server } from 'http';

import { IClock, IConfig, IContainer, IHttpServer, ServerInfo } from '@interfaces';
import { AppError } from '@domain';
import { createSecurityMiddleware } from './middlewares/security.middleware.js';
import { createCORSMiddleware } from './middlewares/cors.middleware.js';
import { createRequestIdMiddleware } from './middlewares/requestId.middleware.js';

//TODO documentar
export class HttpServer implements IHttpServer {
	private readonly app: Application;
	private readonly config: IConfig;
	private readonly clock: IClock;
	private server: Server | null = null;
	private startTime: Date | null = null;

	constructor(private readonly container: IContainer) {
		this.app = express();
		this.config = container.resolve('Config');
		this.clock = container.resolve('Clock');
		this.startMiddlewares();
	}

	/**
	 * Starts the HTTP server and begins listening on the configured port.
	 *
	 * @returns A promise that resolves when the server has successfully started.
	 * @throws {AppError} If an application-specific error occurs during startup.
	 *
	 * @remarks
	 * - The server instance is stored in `this.server`.
	 * - The server's start time is recorded using `this.clock.now()`.
	 * - Errors emitted by the server are handled and cause the returned promise to reject.
	 */
	public async start(): Promise<void> {
		return new Promise((resolve, reject) => {
			try {
				this.server = this.app.listen(this.config.port, () => {
					this.startTime = this.clock.now();

					// TODO Logger
					resolve();
				});

				this.server.on('error', (error) => {
					// TODO Logger
					reject(error);
				});
			} catch (error) {
				if (error instanceof AppError) throw error;
				// TODO Logger
			}
		});
	}
	/**
	 * Stops the HTTP server if it is currently running.
	 *
	 * If the server is not running, the method resolves immediately.
	 * Otherwise, it gracefully closes the server and resets internal state.
	 *
	 * @returns {Promise<void>} A promise that resolves when the server has stopped.
	 */
	public async stop(): Promise<void> {
		if (!this.server) {
			// TODO Logger
			return Promise.resolve();
		}

		return new Promise((resolve, reject) => {
			this.server?.close((error) => {
				if (error) {
					// TODO Logger
					reject(error);
				}

				// TODO Logger
				this.server = null;
				this.startTime = null;
				resolve();
			});
		});
	}
	/**
	 * Returns the Express application instance.
	 *
	 * @returns {Promise<Application>} A promise that resolves to the Express app.
	 */
	public async getApp(): Promise<Application> {
		return this.app;
	}
	/**
	 * Checks if the HTTP server instance is currently running and accepting connections.
	 *
	 * @returns {boolean} `true` if the server is initialized and listening for requests; otherwise, `false`.
	 */
	public isRunning(): boolean {
		return this.server !== null && this.server.listening;
	}
	/**
	 * Retrieves information about the current server state, including the port number,
	 * running status, and optionally the server start time.
	 *
	 * If the server is running, the actual port number used by the server is returned.
	 * Otherwise, the configured port is returned.
	 *
	 * @returns {ServerInfo} An object containing the server's port, running status, and optionally the start time.
	 */
	public getServeInfo(): ServerInfo {
		let actualPort = this.config.port;
		if (this.server && this.isRunning()) {
			const address = this.server.address();
			if (address && typeof address === 'object') {
				actualPort = address.port;
			}
		}

		return {
			port: actualPort,
			isRunning: this.isRunning(),
			...(this.startTime && { startTime: this.startTime }),
		};
	}

	//TODO documentar
	private startMiddlewares(): void {
		this.app.set('trust proxy', true);
		this.app.disable('x-powered-by');
		this.app.use(createSecurityMiddleware());
		this.app.use(createCORSMiddleware(this.config));
		this.app.use(createRequestIdMiddleware(this.container.resolve('UUid')));
		// TODO Logger middleware
		this.app.use(express.json({ limit: '10mb' }));
		this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));
	}
}
