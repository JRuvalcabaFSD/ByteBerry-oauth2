/* eslint-disable @typescript-eslint/no-explicit-any */
import type { IContainer, ILogger, IHttpServer } from '@interfaces';
import { AppError, BootstrapError } from '@shared';
import { bootstrap } from '@bootstrap';

vi.mock('@container', () => ({
	bootstrapContainer: vi.fn(),
}));

vi.mock('@infrastructure', () => ({
	configureShutdown: vi.fn(),
}));

vi.mock('@shared', async () => {
	const actual = await vi.importActual('@shared');
	return {
		...actual,
		withLoggerContext: vi.fn((logger) => logger),
	};
});

describe('Bootstrap', () => {
	let mockContainer: IContainer;
	let mockLogger: ILogger;
	let mockHttpServer: IHttpServer;
	let mockShutdown: any;
	let bootstrapContainerMock: any;
	let configureShutdownMock: any;

	beforeEach(async () => {
		mockLogger = {
			info: vi.fn(),
			error: vi.fn(),
			warn: vi.fn(),
			debug: vi.fn(),
		} as any;

		mockHttpServer = {
			start: vi.fn().mockResolvedValue(undefined),
			stop: vi.fn().mockResolvedValue(undefined),
			getApp: vi.fn(),
			isRunning: vi.fn().mockReturnValue(true),
			getServeInfo: vi.fn(),
		};

		mockShutdown = {
			registerCleanup: vi.fn(),
			shutdown: vi.fn(),
		};

		mockContainer = {
			resolve: vi.fn((token: string) => {
				if (token === 'Logger') return mockLogger;
				if (token === 'HttpServer') return mockHttpServer;
				return null;
			}),
		} as any;

		const { bootstrapContainer } = await import('@container');
		const { configureShutdown } = await import('@infrastructure');

		bootstrapContainerMock = bootstrapContainer as any;
		configureShutdownMock = configureShutdown as any;

		bootstrapContainerMock.mockReturnValue(mockContainer);
		configureShutdownMock.mockReturnValue(mockShutdown);
	});

	afterEach(() => {
		vi.clearAllMocks();
	});

	describe('Successful Bootstrap', () => {
		it('should bootstrap container', async () => {
			await bootstrap();

			expect(bootstrapContainerMock).toHaveBeenCalled();
		});

		it('should resolve Logger from container', async () => {
			await bootstrap();

			expect(mockContainer.resolve).toHaveBeenCalledWith('Logger');
		});

		it('should log service starting', async () => {
			await bootstrap();

			expect(mockLogger.info).toHaveBeenCalledWith('Service starting');
		});

		it('should configure shutdown handler', async () => {
			await bootstrap();

			expect(configureShutdownMock).toHaveBeenCalledWith(mockContainer);
		});

		it('should resolve HttpServer from container', async () => {
			await bootstrap();

			expect(mockContainer.resolve).toHaveBeenCalledWith('HttpServer');
		});

		it('should start HTTP server', async () => {
			await bootstrap();

			expect(mockHttpServer.start).toHaveBeenCalled();
		});

		it('should return container and shutdown handler', async () => {
			const result = await bootstrap();

			expect(result).toEqual({
				container: mockContainer,
				shutdown: mockShutdown,
			});
		});
	});

	describe('Error Handling', () => {
		it('should throw BootstrapError when container creation fails', async () => {
			const error = new Error('Container creation failed');
			bootstrapContainerMock.mockImplementation(() => {
				throw error;
			});

			await expect(bootstrap()).rejects.toThrow(BootstrapError);
			await expect(bootstrap()).rejects.toThrow('Service bootstrap failed');
		});

		it('should propagate AppError without wrapping', async () => {
			const appError = new AppError('App error occurred', 'bootstrap');
			bootstrapContainerMock.mockImplementation(() => {
				throw appError;
			});

			await expect(bootstrap()).rejects.toThrow(appError);
			await expect(bootstrap()).rejects.not.toThrow(BootstrapError);
		});

		it('should throw BootstrapError when HTTP server fails to start', async () => {
			mockHttpServer.start = vi.fn().mockRejectedValue(new Error('Port already in use'));

			await expect(bootstrap()).rejects.toThrow(BootstrapError);
			await expect(bootstrap()).rejects.toThrow('Service bootstrap failed');
		});

		it('should include timestamp in BootstrapError context', async () => {
			const error = new Error('Test error');
			bootstrapContainerMock.mockImplementation(() => {
				throw error;
			});

			try {
				await bootstrap();
			} catch (error) {
				if (error instanceof BootstrapError) {
					expect(error.context.timeStamp).toBeDefined();
					expect(typeof error.context.timeStamp).toBe('string');
				}
			}
		});

		it('should throw BootstrapError when shutdown configuration fails', async () => {
			configureShutdownMock.mockImplementation(() => {
				throw new Error('Shutdown config failed');
			});

			await expect(bootstrap()).rejects.toThrow(BootstrapError);
		});
	});

	describe('Bootstrap Sequence', () => {
		it('should execute bootstrap steps in correct order', async () => {
			const executionOrder: string[] = [];

			bootstrapContainerMock.mockImplementation(() => {
				executionOrder.push('container');
				return mockContainer;
			});

			mockContainer.resolve = vi.fn((token: string) => {
				executionOrder.push(`resolve:${token}`);
				if (token === 'Logger') return mockLogger;
				if (token === 'HttpServer') return mockHttpServer;
				return null;
			}) as any;

			configureShutdownMock.mockImplementation((_c: any) => {
				executionOrder.push('shutdown');
				return mockShutdown;
			});

			mockHttpServer.start = vi.fn(async () => {
				executionOrder.push('server-start');
			});

			await bootstrap();

			expect(executionOrder).toEqual(['container', 'resolve:Logger', 'shutdown', 'resolve:HttpServer', 'server-start']);
		});

		it('should not start server if shutdown configuration fails', async () => {
			configureShutdownMock.mockImplementation(() => {
				throw new Error('Shutdown failed');
			});

			await expect(bootstrap()).rejects.toThrow();
			expect(mockHttpServer.start).not.toHaveBeenCalled();
		});
	});

	describe('Logger Context', () => {
		it('should wrap logger with bootstrap context', async () => {
			const { withLoggerContext } = await import('@shared');

			await bootstrap();

			expect(withLoggerContext).toHaveBeenCalledWith(mockLogger, 'bootstrap');
		});
	});
});
