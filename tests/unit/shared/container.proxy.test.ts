/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ILogger } from '@interfaces';
import { containerWithLoggerContext } from '@shared';

describe('containerWithLoggerContext', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('Proxy Behavior', () => {
		it('should create proxy that intercepts resolve method', () => {
			const mockLogger: ILogger = {
				info: vi.fn(),
				error: vi.fn(),
				warn: vi.fn(),
				debug: vi.fn(),
				log: vi.fn(),
				child: vi.fn(),
			};

			const mockContainer = {
				resolve: vi.fn((token: string) => {
					if (token === 'Logger') return mockLogger;
					return { value: 'other-service' };
				}),
				otherMethod: vi.fn(),
			} as any;

			const proxied = containerWithLoggerContext(mockContainer, 'TestContext');

			expect(proxied).toBeDefined();
		});

		it('should wrap logger when resolving "Logger" token', () => {
			const mockLogger: ILogger = {
				info: vi.fn(),
				error: vi.fn(),
				warn: vi.fn(),
				debug: vi.fn(),
				log: vi.fn(),
				child: vi.fn(),
			};

			const mockContainer = {
				resolve: vi.fn(() => mockLogger),
			} as any;

			const proxied = containerWithLoggerContext(mockContainer, 'MyService');
			const result = proxied.resolve('Logger');

			// Verificar que se llama al resolve del container
			expect(mockContainer.resolve).toHaveBeenCalledWith('Logger');
			// Verificar que el resultado es un logger (tiene los métodos de ILogger)
			expect(result).toHaveProperty('info');
			expect(result).toHaveProperty('error');
			expect(result).toHaveProperty('warn');
			expect(result).toHaveProperty('debug');
			// El logger devuelto debe ser diferente al original (está wrapeado)
			expect(result).not.toBe(mockLogger);
		});

		it('should not wrap non-logger tokens', () => {
			const mockService = { name: 'config' };
			const mockContainer = {
				resolve: vi.fn(() => mockService),
			} as any;

			const proxied = containerWithLoggerContext(mockContainer, 'Context');
			const result = proxied.resolve('Config');

			expect(mockContainer.resolve).toHaveBeenCalledWith('Config');
			// Para tokens que no son 'Logger', debe devolver el servicio sin cambios
			expect(result).toBe(mockService);
		});

		it('should forward non-resolve property access', () => {
			const mockContainer = {
				resolve: vi.fn(),
				isRegistered: vi.fn(() => true),
				customProperty: 'value',
			} as any;

			const proxied = containerWithLoggerContext(mockContainer, 'Context');

			expect(proxied.isRegistered).toBe(mockContainer.isRegistered);
			expect(proxied.customProperty).toBe('value');
		});

		it('should preserve resolve method signature', () => {
			const mockContainer = {
				resolve: vi.fn((token: string, ...rest: unknown[]) => ({ token, rest })),
			} as any;

			const proxied = containerWithLoggerContext(mockContainer, 'Context');
			const _result = proxied.resolve('Service', 'arg1', 'arg2');

			expect(mockContainer.resolve).toHaveBeenCalledWith('Service', 'arg1', 'arg2');
		});
	});

	describe('Context Application', () => {
		it('should apply different contexts to different proxies', () => {
			const mockLogger: ILogger = {
				info: vi.fn(),
				error: vi.fn(),
				warn: vi.fn(),
				debug: vi.fn(),
				log: vi.fn(),
				child: vi.fn(),
			};

			const mockContainer = {
				resolve: vi.fn(() => mockLogger),
			} as any;

			const proxy1 = containerWithLoggerContext(mockContainer, 'Service1');
			const proxy2 = containerWithLoggerContext(mockContainer, 'Service2');

			const logger1 = proxy1.resolve('Logger');
			const logger2 = proxy2.resolve('Logger');

			// Ambos deben haber invocado el resolve del container
			expect(mockContainer.resolve).toHaveBeenCalledTimes(2);
			// Los loggers devueltos deben ser proxies diferentes
			expect(logger1).not.toBe(logger2);
			expect(logger1).not.toBe(mockLogger);
			expect(logger2).not.toBe(mockLogger);

			// Verificar que los proxies aplican su contexto correctamente
			// cuando se llama a un método de logging
			logger1.info('test message');
			logger2.info('test message');

			// El mockLogger.info debería haber sido llamado con el prefijo de contexto
			expect(mockLogger.info).toHaveBeenCalledTimes(2);
			// Verificar que el primer argumento incluye el contexto
			const calls = (mockLogger.info as any).mock.calls;
			expect(calls[0][0]).toContain('[Service1]');
			expect(calls[1][0]).toContain('[Service2]');
		});
	});
});
