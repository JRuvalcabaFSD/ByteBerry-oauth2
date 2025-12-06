import { bootstrap } from '@bootstrap';
import type { IContainer, IHttpServer } from '@interfaces';
import type { GracefulShutdown } from '@infrastructure';

/**
 * Test server helper for integration tests
 * Manages application lifecycle in test environment
 */
export class TestServer {
	private container?: IContainer;
	private server?: IHttpServer;
	private shutdown?: GracefulShutdown;
	private baseUrl: string;
	private assignedPort?: number;

	constructor(private port: number = 0) {
		// Port 0 means assign random available port
		this.baseUrl = `http://localhost:${port}`;
	}

	/**
	 * Start the test server with full bootstrap
	 */
	async start(): Promise<void> {
		// Set test environment variables
		process.env.NODE_ENV = 'test';
		process.env.PORT = String(this.port);
		process.env.LOG_LEVEL = 'error';
		process.env.LOG_REQUESTS = 'false';

		// Bootstrap the application with real dependencies
		const result = await bootstrap();

		this.container = result.container;
		this.shutdown = result.shutdown;
		this.server = this.container.resolve('HttpServer');

		// Get the actual port if it was randomly assigned
		const serverInfo = this.server.getServeInfo();
		this.assignedPort = serverInfo.port;
		this.baseUrl = `http://localhost:${this.assignedPort}`;
	}

	/**
	 * Stop the test server and clean up resources
	 */
	async stop(): Promise<void> {
		if (this.shutdown) {
			await this.shutdown.shutdown();
		}
	}

	/**
	 * Get full URL for a given path
	 */
	getUrl(path: string = ''): string {
		if (!path.startsWith('/')) {
			path = `/${path}`;
		}
		return `${this.baseUrl}${path}`;
	}

	/**
	 * Get the HTTP server instance
	 */
	getServer(): IHttpServer {
		if (!this.server) {
			throw new Error('Server not started. Call start() first.');
		}
		return this.server;
	}

	/**
	 * Get the DI container
	 */
	getContainer(): IContainer {
		if (!this.container) {
			throw new Error('Server not started. Call start() first.');
		}
		return this.container;
	}

	/**
	 * Get the assigned port (useful when using random port)
	 */
	getPort(): number {
		if (!this.assignedPort) {
			throw new Error('Server not started. Call start() first.');
		}
		return this.assignedPort;
	}

	/**
	 * Check if server is running
	 */
	isRunning(): boolean {
		return this.server?.isRunning() ?? false;
	}
}
