/* eslint-disable @typescript-eslint/no-explicit-any */
import { Config } from '@config';
import pkg from '../../../package.json' with { type: 'json' };

// Mock de dotenv
vi.mock('dotenv', () => ({
	default: {
		config: vi.fn(),
	},
}));

describe('Config', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		vi.resetModules();
		// Limpiar variables de entorno
		delete process.env.NODE_ENV;
		delete process.env.PORT;
		delete process.env.LOG_LEVEL;
		delete process.env.LOG_REQUESTS;
		// Asegurar DATABASE_URL para todos los tests
		process.env.DATABASE_URL = 'postgresql://user:pass@localhost:5432/db';
	});

	describe('Constructor and Environment Loading', () => {
		it('should load configuration with default values', async () => {
			const { Config } = await import('@config');
			const config = new Config();

			expect(config.nodeEnv).toBe('development');
			expect(config.port).toBe(4000);
			expect(config.logLevel).toBe('info');
			expect(config.logRequests).toBe(true);
			expect(config.version).toBe(pkg.version);
		});

		it('should load configuration with custom environment values', async () => {
			process.env.NODE_ENV = 'production';
			process.env.PORT = '8080';
			process.env.LOG_LEVEL = 'warn';
			process.env.LOG_REQUESTS = 'false';

			const { Config } = await import('@config');
			const config = new Config();

			expect(config.nodeEnv).toBe('production');
			expect(config.port).toBe(8080);
			expect(config.logLevel).toBe('warn');
			expect(config.logRequests).toBe(false);
		});

		it('should throw ConfigError when PORT is invalid', async () => {
			process.env.PORT = 'invalid-port';
			const { Config } = await import('@config');
			const { ConfigError } = await import('@shared');
			expect(() => new Config()).toThrow(ConfigError);
		});

		it('should throw ConfigError when NODE_ENV is invalid', async () => {
			process.env.NODE_ENV = 'invalid-env';
			const { Config } = await import('@config');
			const { ConfigError } = await import('@shared');
			expect(() => new Config()).toThrow(ConfigError);
		});

		it('should throw ConfigError when LOG_LEVEL is debug in production', async () => {
			process.env.NODE_ENV = 'production';
			process.env.LOG_LEVEL = 'debug';
			const { Config } = await import('@config');
			const { ConfigError } = await import('@shared');
			expect(() => new Config()).toThrow(ConfigError);
			expect(() => new Config()).toThrow('Failed to validate environment variables cannot assign logLevel as "debug" in production');
		});

		it('should throw ConfigError when LOG_REQUESTS is true in production', async () => {
			process.env.NODE_ENV = 'production';
			process.env.LOG_REQUESTS = 'true';
			const { Config } = await import('@config');
			const { ConfigError } = await import('@shared');
			expect(() => new Config()).toThrow(ConfigError);
			expect(() => new Config()).toThrow('Failed to validate environment variables cannot show the request logs');
		});
	});

	describe('Environment Check Methods', () => {
		it('should correctly identify development environment', async () => {
			process.env.NODE_ENV = 'development';
			const { Config } = await import('@config');
			const config = new Config();

			expect(config.isDevelopment()).toBe(true);
			expect(config.isProduction()).toBe(false);
			expect(config.isTest()).toBe(false);
		});

		it('should correctly identify production environment', async () => {
			process.env.NODE_ENV = 'production';
			process.env.LOG_LEVEL = 'info';
			process.env.LOG_REQUESTS = 'false';
			const { Config } = await import('@config');
			const config = new Config();

			expect(config.isDevelopment()).toBe(false);
			expect(config.isProduction()).toBe(true);
			expect(config.isTest()).toBe(false);
		});

		it('should correctly identify test environment', async () => {
			process.env.NODE_ENV = 'test';
			const { Config } = await import('@config');
			const config = new Config();

			expect(config.isDevelopment()).toBe(false);
			expect(config.isProduction()).toBe(false);
			expect(config.isTest()).toBe(true);
		});
	});

	describe('getSummary Method', () => {
		it('should return configuration summary', async () => {
			process.env.NODE_ENV = 'development';
			process.env.PORT = '3000';
			process.env.LOG_LEVEL = 'debug';
			process.env.LOG_REQUESTS = 'true';

			const { Config } = await import('@config');
			const config = new Config();
			const summary = config.getSummary();

			expect(summary).toEqual({
				nodeEnv: 'development',
				port: 3000,
				logLevel: 'debug',
				logRequests: true,
			});
		});

		it('should return production configuration summary', async () => {
			process.env.NODE_ENV = 'production';
			process.env.PORT = '8080';
			process.env.LOG_LEVEL = 'warn';
			process.env.LOG_REQUESTS = 'false';

			const { Config } = await import('@config');
			const config = new Config();
			const summary = config.getSummary();

			expect(summary).toEqual({
				nodeEnv: 'production',
				port: 8080,
				logLevel: 'warn',
				logRequests: false,
			});
		});
	});
	describe('normalizeUrls Method (Private)', () => {
		let config: Config;
		let consoleWarnSpy: ReturnType<typeof vi.spyOn>;

		beforeEach(() => {
			config = new Config();
			consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => { });
		});

		it('should normalize single URL with uppercase protocol', () => {
			const normalized = (config as any).normalizeUrls('HTTP://example.com/path');
			expect(normalized).toBe('http://example.com/path');
		});

		it('should normalize single URL with uppercase hostname', () => {
			const normalized = (config as any).normalizeUrls('https://EXAMPLE.COM/path');
			expect(normalized).toBe('https://example.com/path');
		});

		it('should remove trailing slash from pathname', () => {
			const normalized = (config as any).normalizeUrls('https://example.com/path/');
			expect(normalized).toBe('https://example.com/path');
		});

		it('should preserve root path slash', () => {
			const normalized = (config as any).normalizeUrls('https://example.com/');
			expect(normalized).toBe('https://example.com');
		});

		it('should handle URL with mixed case and trailing slash', () => {
			const normalized = (config as any).normalizeUrls('HTTPS://Example.COM/Path/To/Resource/');
			expect(normalized).toBe('https://example.com/Path/To/Resource');
		});

		it('should trim whitespace from URL', () => {
			const normalized = (config as any).normalizeUrls('  https://example.com/path  ');
			expect(normalized).toBe('https://example.com/path');
		});

		it('should normalize array of URLs', () => {
			const urls = ['HTTP://API.Example.com/', 'HTTPS://WWW.TEST.COM/endpoint/', 'https://service.com/api/v1/'];
			const normalized = (config as any).normalizeUrls(urls);

			expect(normalized).toEqual(['http://api.example.com', 'https://www.test.com/endpoint', 'https://service.com/api/v1']);
		});

		it('should handle invalid URL and return original', () => {
			const invalidUrl = 'not-a-valid-url';
			const normalized = (config as any).normalizeUrls(invalidUrl);

			expect(normalized).toBe(invalidUrl);
			expect(consoleWarnSpy).toHaveBeenCalledWith(expect.stringContaining('Invalid URL skipped for normalization'), expect.any(Error));
		});

		it('should handle array with mix of valid and invalid URLs', () => {
			const urls = ['https://valid.com/path', 'invalid-url', 'HTTP://ANOTHER.COM/'];
			const normalized = (config as any).normalizeUrls(urls);

			expect(normalized).toEqual(['https://valid.com/path', 'invalid-url', 'http://another.com']);
			expect(consoleWarnSpy).toHaveBeenCalledTimes(1);
		});

		it('should handle URL with query parameters', () => {
			const normalized = (config as any).normalizeUrls('HTTPS://Example.COM/path?param=value');
			expect(normalized).toBe('https://example.com/path?param=value');
		});

		it('should handle URL with hash fragment', () => {
			const normalized = (config as any).normalizeUrls('HTTPS://Example.COM/path#section');
			expect(normalized).toBe('https://example.com/path#section');
		});
	});
});
