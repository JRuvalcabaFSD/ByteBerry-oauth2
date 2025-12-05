/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
	createClockService,
	createConfig,
	createWintonLoggerService,
	createUuidService,
	createGracefulShutdown,
	createHttpServer,
	createHealthService,
} from '@container';
import { Config } from '@config';
import type { IContainer } from '@interfaces';

// Mock del módulo Config
vi.mock('@config', () => {
	const MockConfig = vi.fn(function (this: any) {
		this.nodeEnv = 'development';
		this.port = 4000;
		this.logLevel = 'info';
		this.logRequests = true;
		this.version = '1.0.0';
		this.serviceName = 'test-service';
		this.corsOrigins = [];
		this.isDevelopment = () => true;
		this.isProduction = () => false;
		this.isTest = () => false;
		this.getSummary = () => ({});
	});

	return {
		Config: MockConfig,
	};
});

describe('Factories', () => {
	let mockContainer: IContainer;

	beforeEach(() => {
		vi.clearAllMocks();

		mockContainer = {
			resolve: vi.fn((key: string) => {
				if (key === 'Config') return createConfig();
				if (key === 'Clock') return createClockService();
				if (key === 'Logger')
					return {
						info: vi.fn(),
						error: vi.fn(),
						warn: vi.fn(),
						debug: vi.fn(),
						child: vi.fn(),
					};
				if (key === 'Uuid') return createUuidService();
				if (key === 'HealthService')
					return {
						getHealth: vi.fn(),
						getDeepHealth: vi.fn(),
						checkHealth: vi.fn(),
					};
				return null;
			}),
		} as any;
	});

	describe('createConfig', () => {
		it('should create and return a Config instance', () => {
			const config = createConfig();

			expect(config).toBeDefined();
			expect(Config).toHaveBeenCalled();
		});

		it('should return Config with expected properties', () => {
			const config = createConfig();

			expect(config.nodeEnv).toBeDefined();
			expect(config.port).toBeDefined();
			expect(config.logLevel).toBeDefined();
			expect(config.version).toBeDefined();
		});

		it('should return Config with expected methods', () => {
			const config = createConfig();

			expect(typeof config.isDevelopment).toBe('function');
			expect(typeof config.isProduction).toBe('function');
			expect(typeof config.isTest).toBe('function');
			expect(typeof config.getSummary).toBe('function');
		});

		it('should create new Config instance on each call', () => {
			vi.clearAllMocks();

			createConfig();
			createConfig();

			expect(Config).toHaveBeenCalledTimes(2);
		});
	});

	describe('createClockService', () => {
		it('should create and return a ClockService instance', () => {
			const clock = createClockService();

			expect(clock).toBeDefined();
		});

		it('should return ClockService with expected methods', () => {
			const clock = createClockService();

			expect(typeof clock.isoString).toBe('function');
			expect(typeof clock.now).toBe('function');
			expect(typeof clock.timestamp).toBe('function');
		});

		it('should create new Clock instance on each call', () => {
			const clock1 = createClockService();
			const clock2 = createClockService();

			expect(clock1).not.toBe(clock2);
		});

		it('should return functional Clock methods', () => {
			const clock = createClockService();

			expect(clock.now()).toBeInstanceOf(Date);
			expect(typeof clock.timestamp()).toBe('number');
			expect(typeof clock.isoString()).toBe('string');
		});
	});

	describe('createUuidService', () => {
		it('should create and return a UuidService instance', () => {
			const uuid = createUuidService();

			expect(uuid).toBeDefined();
		});

		it('should return UuidService with expected methods', () => {
			const uuid = createUuidService();

			expect(typeof uuid.generate).toBe('function');
			expect(typeof uuid.isValid).toBe('function');
		});

		it('should create new Uuid instance on each call', () => {
			const uuid1 = createUuidService();
			const uuid2 = createUuidService();

			expect(uuid1).not.toBe(uuid2);
		});

		it('should return functional Uuid methods', () => {
			const uuid = createUuidService();

			const generatedUuid = uuid.generate();
			expect(typeof generatedUuid).toBe('string');
			expect(uuid.isValid(generatedUuid)).toBe(true);
		});
	});

	describe('createWintonLoggerService', () => {
		it('should create and return a WinstonLoggerService instance', () => {
			const logger = createWintonLoggerService(mockContainer);

			expect(logger).toBeDefined();
			expect(mockContainer.resolve).toHaveBeenCalledWith('Config');
			expect(mockContainer.resolve).toHaveBeenCalledWith('Clock');
		});

		it('should resolve Config and Clock from container', () => {
			const mockConfig = createConfig();
			const mockClock = createClockService();
			const container = {
				resolve: vi.fn((key: string) => {
					if (key === 'Config') return mockConfig;
					if (key === 'Clock') return mockClock;
					return null;
				}),
			} as any;

			createWintonLoggerService(container);

			expect(container.resolve).toHaveBeenCalledTimes(2);
			expect(container.resolve).toHaveBeenNthCalledWith(1, 'Config');
			expect(container.resolve).toHaveBeenNthCalledWith(2, 'Clock');
		});

		it('should return an object implementing ILogger interface', () => {
			const logger = createWintonLoggerService(mockContainer);

			expect(typeof logger.info).toBe('function');
			expect(typeof logger.error).toBe('function');
			expect(typeof logger.warn).toBe('function');
			expect(typeof logger.debug).toBe('function');
		});

		it('should create new Logger instance on each call', () => {
			const logger1 = createWintonLoggerService(mockContainer);
			const logger2 = createWintonLoggerService(mockContainer);

			expect(logger1).not.toBe(logger2);
		});
	});

	describe('createGracefulShutdown', () => {
		it('should create and return a GracefulShutdown instance', () => {
			const shutdown = createGracefulShutdown(mockContainer);

			expect(shutdown).toBeDefined();
		});

		it('should resolve Logger from container', () => {
			createGracefulShutdown(mockContainer);

			expect(mockContainer.resolve).toHaveBeenCalledWith('Logger');
		});

		it('should return GracefulShutdown with expected methods', () => {
			const shutdown = createGracefulShutdown(mockContainer);

			expect(typeof shutdown.registerCleanup).toBe('function');
			expect(typeof shutdown.shutdown).toBe('function');
		});

		it('should return GracefulShutdown with registerCleanupsCount property', () => {
			const shutdown = createGracefulShutdown(mockContainer);

			expect(shutdown.registerCleanupsCount).toBeDefined();
			expect(typeof shutdown.registerCleanupsCount).toBe('number');
		});

		it('should create new GracefulShutdown instance on each call', () => {
			const shutdown1 = createGracefulShutdown(mockContainer);
			const shutdown2 = createGracefulShutdown(mockContainer);

			expect(shutdown1).not.toBe(shutdown2);
		});
	});

	describe('createHttpServer', () => {
		it('should create and return an HttpServer instance', () => {
			const server = createHttpServer(mockContainer);

			expect(server).toBeDefined();
		});

		it('should pass container to HttpServer constructor', () => {
			const _server = createHttpServer(mockContainer);

			// HttpServer constructor resolves Config, Clock, Logger
			expect(mockContainer.resolve).toHaveBeenCalledWith('Config');
			expect(mockContainer.resolve).toHaveBeenCalledWith('Clock');
			expect(mockContainer.resolve).toHaveBeenCalledWith('Logger');
		});

		it('should return HttpServer with expected methods', () => {
			const server = createHttpServer(mockContainer);

			expect(typeof server.start).toBe('function');
			expect(typeof server.stop).toBe('function');
			expect(typeof server.getApp).toBe('function');
			expect(typeof server.isRunning).toBe('function');
			expect(typeof server.getServeInfo).toBe('function');
		});

		it('should create new HttpServer instance on each call', () => {
			const server1 = createHttpServer(mockContainer);
			const server2 = createHttpServer(mockContainer);

			expect(server1).not.toBe(server2);
		});
	});

	describe('createHealthService', () => {
		it('should create and return a HealthService instance', () => {
			const service = createHealthService(mockContainer);

			expect(service).toBeDefined();
		});

		it('should pass container to HealthService constructor', () => {
			const _service = createHealthService(mockContainer);

			// HealthService constructor resolves Config, Uuid, Clock, Logger
			expect(mockContainer.resolve).toHaveBeenCalledWith('Config');
			expect(mockContainer.resolve).toHaveBeenCalledWith('Uuid');
			expect(mockContainer.resolve).toHaveBeenCalledWith('Clock');
			expect(mockContainer.resolve).toHaveBeenCalledWith('Logger');
		});

		it('should return HealthService with expected methods', () => {
			const service = createHealthService(mockContainer);

			expect(typeof service.getHealth).toBe('function');
			expect(typeof service.getDeepHealth).toBe('function');
			expect(typeof service.checkHealth).toBe('function');
		});

		it('should create new HealthService instance on each call', () => {
			const service1 = createHealthService(mockContainer);
			const service2 = createHealthService(mockContainer);

			expect(service1).not.toBe(service2);
		});
	});

	describe('Factory Pattern Validation', () => {
		it('should create independent instances across factories', () => {
			const config = createConfig();
			const clock = createClockService();
			const uuid = createUuidService();
			const logger = createWintonLoggerService(mockContainer);
			const shutdown = createGracefulShutdown(mockContainer);
			const server = createHttpServer(mockContainer);
			const health = createHealthService(mockContainer);

			expect(config).toBeDefined();
			expect(clock).toBeDefined();
			expect(uuid).toBeDefined();
			expect(logger).toBeDefined();
			expect(shutdown).toBeDefined();
			expect(server).toBeDefined();
			expect(health).toBeDefined();

			// All should be different objects
			expect(config).not.toBe(clock);
			expect(clock).not.toBe(uuid);
			expect(uuid).not.toBe(logger);
		});

		it('should create fresh instances on each factory call', () => {
			const instances1 = {
				config: createConfig(),
				clock: createClockService(),
				uuid: createUuidService(),
			};

			const instances2 = {
				config: createConfig(),
				clock: createClockService(),
				uuid: createUuidService(),
			};

			expect(instances1.config).not.toBe(instances2.config);
			expect(instances1.clock).not.toBe(instances2.clock);
			expect(instances1.uuid).not.toBe(instances2.uuid);
		});
	});
});
