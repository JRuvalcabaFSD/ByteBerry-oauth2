import express, { Application } from 'express';
import { Server } from 'http';

import { IClock, IConfig, IContainer, IHttpServer, ILogger, ServerInfo } from '@interfaces';
import * as middlewares from '@infrastructure';
import { AppError, getErrMsg } from '@shared';
import { createAppRouter } from '@presentation';

/**
 * HTTP server implementation that manages Express application lifecycle and middleware configuration.
 *
 * This class provides a complete HTTP server setup with:
 * - Express application initialization and configuration
 * - Server lifecycle management (start/stop)
 * - Standard middleware stack (security, CORS, logging, request parsing)
 * - Error handling
 * - Server status monitoring
 *
 * @remarks
 * The server automatically configures trust proxy, disables x-powered-by header,
 * and sets up a comprehensive middleware stack including security headers, CORS,
 * request ID generation, logging, and JSON/URL-encoded body parsing with a 10mb limit.
 *
 * @example
 * ```typescript
 * const httpServer = new HttpServer(container);
 * await httpServer.start();
 * const serverInfo = httpServer.getServeInfo();
 * // ... use server
 * await httpServer.stop();
 * ```
 */

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
	 * Initializes the Express application, resolves dependencies from the container
	 * (Config, Clock, and Logger), sets up middlewares, and configures the error handler.
	 *
	 * @param container - The dependency injection container used to resolve application dependencies
	 */

	constructor(private readonly container: IContainer) {
		this.app = express();
		this.config = container.resolve('Config');
		this.clock = container.resolve('Clock');
		this.logger = container.resolve('Logger');
		this.startMiddlewares();
		this.app.use(createAppRouter(this.container));
		this.setupErroHandler();
	}

	/**
	 * Starts the HTTP server and begins listening on the configured port.
	 *
	 * This method initializes the server, sets up error handling, and records the start time.
	 * The Promise resolves when the server successfully starts listening, or rejects if an error occurs.
	 *
	 * @returns A Promise that resolves when the server has started successfully, or rejects with an error if the server fails to start.
	 *
	 * @throws {Error} Rejects with an error if the server fails to bind to the configured port or encounters any other startup error.
	 *
	 * @remarks
	 * - Sets the `startTime` property when the server begins listening
	 * - Logs success and error messages using the configured logger
	 * - Attaches an error event listener to handle server startup failures
	 */

	public async start(): Promise<void> {
		return new Promise((resolve, reject) => {
			try {
				this.server = this.app.listen(this.config.port, () => {
					this.startTime = this.clock.now();

					this.logger.info('Http Server started successfully');
					resolve();
				});

				this.server.on('error', (error) => {
					this.logger.error('Http Server failed to start', { error: getErrMsg(error), port: this.config.port });
					reject(error);
				});
			} catch (error) {
				if (error instanceof AppError) throw error;
				this.logger.error('Failed to start Http Server', { error: getErrMsg(error) });
			}
		});
	}

	/**
	 * Stops the HTTP server gracefully.
	 *
	 * @returns A promise that resolves when the server has been successfully stopped,
	 * or rejects if an error occurs during the shutdown process.
	 *
	 * @remarks
	 * - If the server is not running, logs a warning and returns a resolved promise immediately.
	 * - Closes all active connections and releases the port.
	 * - Resets the server instance and start time to null upon successful shutdown.
	 * - Logs appropriate messages for successful shutdown or errors.
	 */

	public async stop(): Promise<void> {
		if (!this.server) {
			this.logger.warn('Http Server stop called but server is not running');
			return Promise.resolve();
		}

		return new Promise((resolve, reject) => {
			this.server?.close((error) => {
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
	 * Retrieves the Express application instance.
	 *
	 * @returns A promise that resolves to the Express Application object.
	 */

	public async getApp(): Promise<Application> {
		return this.app;
	}

	/**
	 * Checks whether the HTTP server is currently running and listening for connections.
	 *
	 * @returns {boolean} `true` if the server is initialized and actively listening, `false` otherwise.
	 */

	public isRunning(): boolean {
		return this.server !== null && this.server.listening;
	}

	/**
	 * Retrieves the current server information including port, running status, and start time.
	 *
	 * @returns {ServerInfo} An object containing:
	 *   - `port`: The port number the server is configured to run on
	 *   - `isRunning`: Boolean indicating whether the server is currently running
	 *   - `startTime`: (Optional) The timestamp when the server was started, included only if available
	 */

	public getServeInfo(): ServerInfo {
		// Get the actual port if server is running and port was dynamically assigned
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

	/**
	 * Configures and applies middleware to the Express application.
	 *
	 * This method sets up the following middleware in order:
	 * - Trust proxy settings for handling requests behind a proxy
	 * - Disables the X-Powered-By header for security
	 * - Security middleware for common security headers and protections
	 * - CORS middleware with configuration-based settings
	 * - Request ID middleware for tracking requests using a UUID generator
	 * - Logging middleware for request/response logging with clock-based timestamps
	 * - JSON body parser with a 10MB limit
	 * - URL-encoded body parser with extended mode and a 10MB limit
	 *
	 * @private
	 * @returns {void}
	 */

	private startMiddlewares(): void {
		this.app.set('trust proxy', true);
		this.app.disable('x-powered-by');
		this.app.use(middlewares.createSecurityMiddleware());
		this.app.use(middlewares.createCORSMiddleware(this.config));
		this.app.use(middlewares.createRequestIdMiddleware(this.container.resolve('Uuid')));
		this.app.use(middlewares.createLoggingMiddleware(this.logger, this.clock, this.config.logRequests));
		this.app.use(express.json({ limit: '10mb' }));
		this.app.use(express.urlencoded({ extended: true, limit: '10mb' }));
	}

	/**
	 * Sets up the error handling middleware for the Express application.
	 *
	 * This method configures a global error handler that will catch and process
	 * any errors thrown during request processing. The error middleware is created
	 * using the application's logger and configuration settings.
	 *
	 * @remarks
	 * This should be called after all other middleware and routes are registered,
	 * as Express error handlers need to be defined last in the middleware chain.
	 *
	 * @private
	 */

	private setupErroHandler(): void {
		this.app.use(middlewares.createErrorMiddleware(this.logger, this.config));
	}
}
