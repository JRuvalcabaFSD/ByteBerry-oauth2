/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi } from 'vitest';
import { Config } from '@config';
import { createClockService, createConfig, createWintonLoggerService } from '@container';

// Mock del módulo Config
vi.mock('@config', () => {
	const MockConfig = vi.fn(function (this: any) {
		this.nodeEnv = 'development';
		this.port = 4000;
		this.logLevel = 'info';
		this.logRequests = true;
		this.version = '1.0.0';
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
		it('should create new Clock instance on each call', () => {
			const clock = createClockService();

			expect(clock.isoString).toBeDefined();
			expect(clock.now).toBeDefined();
			expect(clock.timestamp).toBeDefined();
		});

		describe('createWintonLoggerService', () => {
			it('should create and return a WinstonLoggerService instance', () => {
				const mockContainer = {
					resolve: vi.fn((key: string) => {
						if (key === 'Config') return createConfig();
						if (key === 'Clock') return createClockService();
						return null;
					}),
				} as any;

				const logger = createWintonLoggerService(mockContainer);

				expect(logger).toBeDefined();
				expect(mockContainer.resolve).toHaveBeenCalledWith('Config');
				expect(mockContainer.resolve).toHaveBeenCalledWith('Clock');
			});

			it('should resolve Config and Clock from container', () => {
				const mockConfig = createConfig();
				const mockClock = createClockService();
				const mockContainer = {
					resolve: vi.fn((key: string) => {
						if (key === 'Config') return mockConfig;
						if (key === 'Clock') return mockClock;
						return null;
					}),
				} as any;

				createWintonLoggerService(mockContainer);

				expect(mockContainer.resolve).toHaveBeenCalledTimes(2);
				expect(mockContainer.resolve).toHaveBeenNthCalledWith(1, 'Config');
				expect(mockContainer.resolve).toHaveBeenNthCalledWith(2, 'Clock');
			});

			it('should return an object implementing ILogger interface', () => {
				const mockContainer = {
					resolve: vi.fn((key: string) => {
						if (key === 'Config') return createConfig();
						if (key === 'Clock') return createClockService();
						return null;
					}),
				} as any;

				const logger = createWintonLoggerService(mockContainer);

				expect(typeof logger.info).toBe('function');
				expect(typeof logger.error).toBe('function');
				expect(typeof logger.warn).toBe('function');
				expect(typeof logger.debug).toBe('function');
			});
		});
	});
});
