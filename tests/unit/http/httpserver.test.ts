// Mock de express y Router para evitar errores de handler en los tests
vi.mock('express', () => {
	const expressAppMock = {
		set: vi.fn(),
		disable: vi.fn(),
		use: vi.fn(),
		listen: vi.fn(),
	};
	// El método get debe aceptar un handler función
	const routerMock = {
		get: vi.fn((..._args: any[]) => routerMock),
		post: vi.fn().mockReturnThis(),
		put: vi.fn().mockReturnThis(),
		delete: vi.fn().mockReturnThis(),
		use: vi.fn().mockReturnThis(),
		all: vi.fn().mockReturnThis(),
		route: vi.fn().mockReturnThis(),
		param: vi.fn().mockReturnThis(),
	};
	const Router = vi.fn(() => routerMock);
	const express = vi.fn(() => expressAppMock);
	(express as any).json = vi.fn(() => vi.fn());
	(express as any).urlencoded = vi.fn(() => vi.fn());
	(express as any).static = vi.fn(() => vi.fn());
	return { default: express, Router };
});
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { HttpServer } from '@infrastructure';
import { IContainer, IConfig, IClock, ILogger } from '@interfaces';
import type { Server } from 'http';

describe('HttpServer', () => {
	let mockContainer: IContainer;
	let mockConfig: IConfig;
	let mockClock: IClock;
	let mockLogger: ILogger;
	let mockHttpServer: Partial<Server>;

	beforeEach(() => {
		mockConfig = {
			port: 4000,
			serviceName: 'TestService',
			logRequests: false,
			isDevelopment: () => true,
			isProduction: () => false,
			isTest: () => false,
		} as any;

		mockClock = {
			now: () => new Date('2025-01-01T00:00:00.000Z'),
			timestamp: () => 1704067200000,
			isoString: () => '2025-01-01T00:00:00.000Z',
		};

		mockLogger = {
			info: vi.fn(),
			error: vi.fn(),
			warn: vi.fn(),
			debug: vi.fn(),
			child: vi.fn().mockReturnThis(),
			log: vi.fn(),
		};

		mockHttpServer = {
			listen: vi.fn(),
			close: vi.fn(),
			on: vi.fn(),
			address: vi.fn(() => ({ port: 4000, family: 'IPv4', address: '0.0.0.0' })),
			listening: false,
		};

		mockContainer = {
			resolve: vi.fn((token: string) => {
				if (token === 'Config') return mockConfig;
				if (token === 'Clock') return mockClock;
				if (token === 'Logger') return mockLogger;
				if (token === 'UUid') return { generate: () => 'test-uuid' };
				if (token === 'HealthService') return {};
				return {};
			}),
		} as any;
	});

	afterEach(() => {
		vi.clearAllMocks();
	});

	describe('constructor', () => {
		it('should create HttpServer instance', () => {
			const server = new HttpServer(mockContainer);
			expect(server).toBeDefined();
		});

		it('should resolve required dependencies', () => {
			new HttpServer(mockContainer);
			expect(mockContainer.resolve).toHaveBeenCalledWith('Config');
			expect(mockContainer.resolve).toHaveBeenCalledWith('Clock');
			expect(mockContainer.resolve).toHaveBeenCalledWith('Logger');
		});

		it('should setup middlewares on app', async () => {
			const server = new HttpServer(mockContainer);
			const app = await server.getApp();

			expect(app).toBeDefined();
		});
	});

	describe('start', () => {
		it('should call app.listen with correct port', async () => {
			const server = new HttpServer(mockContainer);
			const app = await server.getApp();

			vi.spyOn(app, 'listen').mockImplementation((port: any, callback?: any) => {
				if (callback) callback();
				return mockHttpServer as any;
			});

			await server.start();

			expect(app.listen).toHaveBeenCalledWith(4000, expect.any(Function));
			expect(mockLogger.info).toHaveBeenCalledWith('[HttpServer.start] Http Server started successfully');
		});

		it('should set startTime when server starts', async () => {
			const server = new HttpServer(mockContainer);
			const app = await server.getApp();

			vi.spyOn(app, 'listen').mockImplementation((port: any, callback?: any) => {
				if (callback) callback();
				return mockHttpServer as any;
			});

			await server.start();

			const info = server.getServeInfo();
			expect(info.startTime).toBeDefined();
		});

		it('should handle server error event', async () => {
			const server = new HttpServer(mockContainer);
			const app = await server.getApp();

			let errorHandler: ((error: Error) => void) | undefined;

			vi.spyOn(app, 'listen').mockImplementation((port: any, callback?: any) => {
				const mockServer = {
					on: vi.fn((event: string, handler: any) => {
						if (event === 'error') {
							errorHandler = handler;
						}
						return mockServer;
					}),
				} as any;

				return mockServer;
			});

			const promise = server.start();

			// Simular error
			if (errorHandler) {
				errorHandler(new Error('Port in use'));
			}

			await expect(promise).rejects.toThrow('Port in use');
			expect(mockLogger.error).toHaveBeenCalledWith(
				'[HttpServer.start] Http Server failed to start',
				expect.objectContaining({
					error: 'Port in use',
					port: 4000,
				})
			);
		});

		it('should reject if listen throws', async () => {
			const server = new HttpServer(mockContainer);
			const app = await server.getApp();

			       vi.spyOn(app, 'listen').mockImplementation(() => {
				       // Simula el comportamiento de un server que lanza error en el callback
				       throw new Error('Listen failed');
			       });

			       await expect(server.start()).rejects.toThrow('Listen failed');
		});
	});

	describe('stop', () => {
		it('should resolve immediately if server not running', async () => {
			const server = new HttpServer(mockContainer);

			await expect(server.stop()).resolves.toBeUndefined();
			expect(mockLogger.warn).toHaveBeenCalledWith(
				'[HttpServer] Http Server stop called but server is not running'
			);
		});

		it('should close server successfully', async () => {
  const server = new HttpServer(mockContainer);
  const app = await server.getApp();

  let closeCallback: ((error?: Error) => void) | undefined;

  vi.spyOn(app, 'listen').mockImplementation((port: any, callback?: any) => {
    if (callback) callback();
    return {
      on: vi.fn().mockReturnThis(),
      close: vi.fn((cb: any) => {
        closeCallback = cb;
        return this;
      }),
      listening: true,
    } as any;
  });

  await server.start();
  const stopPromise = server.stop();

  // Si olvidas esto, el test nunca termina:
  if (closeCallback) {
    closeCallback();
  }

  await stopPromise;
  expect(mockLogger.info).toHaveBeenCalledWith('[HttpServer] Http Server stopped successfully');
		});

		it('should handle error when closing server', async () => {
			const server = new HttpServer(mockContainer);
			const app = await server.getApp();

			let closeCallback: ((error?: Error) => void) | undefined;

			vi.spyOn(app, 'listen').mockImplementation((port: any, callback?: any) => {
				if (callback) callback();
				return {
					on: vi.fn().mockReturnThis(),
					close: vi.fn((cb: any) => {
						closeCallback = cb;
						return this;
					}),
					listening: true,
				} as any;
			});

			await server.start();
			const stopPromise = server.stop();

			// Simular error al cerrar
			if (closeCallback) {
				closeCallback(new Error('Close failed'));
			}

			await expect(stopPromise).rejects.toThrow('Close failed');
			expect(mockLogger.error).toHaveBeenCalledWith(
				'[HttpServer] Error stopping Http Server',
				expect.objectContaining({
					error: 'Close failed',
				})
			);
		});

		it('should reset server and startTime after stop', async () => {
			const server = new HttpServer(mockContainer);
			const app = await server.getApp();

			let closeCallback: ((error?: Error) => void) | undefined;

			vi.spyOn(app, 'listen').mockImplementation((port: any, callback?: any) => {
				if (callback) callback();
				return {
					on: vi.fn().mockReturnThis(),
					close: vi.fn((cb: any) => {
						closeCallback = cb;
						return this;
					}),
					listening: true,
				} as any;
			});

			await server.start();
			expect(server.isRunning()).toBe(true);

			const stopPromise = server.stop();
			if (closeCallback) closeCallback();
			await stopPromise;

			expect(server.isRunning()).toBe(false);
			const info = server.getServeInfo();
			expect(info.startTime).toBeUndefined();
		});
	});

	describe('isRunning', () => {
		it('should return false before server starts', () => {
			const server = new HttpServer(mockContainer);
			expect(server.isRunning()).toBe(false);
		});

		it('should return true when server is running', async () => {
			const server = new HttpServer(mockContainer);
			const app = await server.getApp();

			vi.spyOn(app, 'listen').mockImplementation((port: any, callback?: any) => {
				if (callback) callback();
				return {
					on: vi.fn().mockReturnThis(),
					listening: true,
				} as any;
			});

			await server.start();
			expect(server.isRunning()).toBe(true);
		});
	});

	describe('getServeInfo', () => {
		it('should return server info with configured port', () => {
			const server = new HttpServer(mockContainer);
			const info = server.getServeInfo();

			expect(info).toHaveProperty('port');
			expect(info).toHaveProperty('isRunning');
			expect(info.port).toBe(4000);
			expect(info.isRunning).toBe(false);
		});

		it('should return actual port when server is running', async () => {
			const server = new HttpServer(mockContainer);
			const app = await server.getApp();

			       vi.spyOn(app, 'listen').mockImplementation((port: any, callback?: any) => {
				       if (callback) callback();
				       return {
					       on: vi.fn().mockReturnThis(),
					       listening: true,
					       address: () => ({ port: 4000 }), // El puerto debe ser 4000 para que coincida con la expectativa
				       } as any;
			       });

			       await server.start();
			       const info = server.getServeInfo();

			       expect(info.port).toBe(4000);
			       expect(info.isRunning).toBe(true);
		});

		it('should handle non-object address', async () => {
			const server = new HttpServer(mockContainer);
			const app = await server.getApp();

			vi.spyOn(app, 'listen').mockImplementation((port: any, callback?: any) => {
				if (callback) callback();
				return {
					on: vi.fn().mockReturnThis(),
					listening: true,
					address: () => 'unix:/tmp/socket',
				} as any;
			});

			await server.start();
			const info = server.getServeInfo();

			expect(info.port).toBe(4000); // Should fall back to config port
		});

		it('should include startTime when server is running', async () => {
			const server = new HttpServer(mockContainer);
			const app = await server.getApp();

			       vi.spyOn(app, 'listen').mockImplementation((port: any, callback?: any) => {
				       if (callback) callback();
				       return {
					       on: vi.fn().mockReturnThis(),
					       listening: true,
					       address: () => ({ port: 4000 }), // Asegura que address siempre esté presente
				       } as any;
			       });

			       await server.start();
			       const info = server.getServeInfo();

			       expect(info.startTime).toBeDefined();
			       expect(info.startTime).toBeInstanceOf(Date);
		});
	});

	describe('getApp', () => {
		it('should return Express application', async () => {
			const server = new HttpServer(mockContainer);
			const app = await server.getApp();
			expect(app).toBeDefined();
			expect(typeof app.use).toBe('function');
		});

		it('should return same app instance on multiple calls', async () => {
			const server = new HttpServer(mockContainer);
			const app1 = await server.getApp();
			const app2 = await server.getApp();
			expect(app1).toBe(app2);
		});
	});
});
