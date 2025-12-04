/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi } from 'vitest';
import { Config } from '@config';
import { createConfig } from '@container';

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
	});
});
