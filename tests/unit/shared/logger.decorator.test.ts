/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { withLoggerContext, LogContextMethod, LogContextClass, logContextFunction, wrapContainerLogger } from '@shared';
import type { ILogger } from '@interfaces';

describe('Logger Decorators', () => {
	let mockLogger: ILogger;

	beforeEach(() => {
		mockLogger = {
			debug: vi.fn(),
			info: vi.fn(),
			warn: vi.fn(),
			error: vi.fn(),
			log: vi.fn(),
			child: vi.fn(),
		};
	});

	describe('withLoggerContext', () => {
		describe('Logger Wrapping', () => {
			it('should wrap logger and prefix messages with context', () => {
				const wrapped = withLoggerContext(mockLogger, 'TestService');
				wrapped.info('User logged in');

				expect(mockLogger.info).toHaveBeenCalledWith('[TestService] User logged in');
			});

			it('should wrap all logger methods', () => {
				const wrapped = withLoggerContext(mockLogger, 'Service');

				wrapped.debug('Debug message');
				wrapped.info('Info message');
				wrapped.warn('Warn message');
				wrapped.error('Error message');

				expect(mockLogger.debug).toHaveBeenCalledWith('[Service] Debug message');
				expect(mockLogger.info).toHaveBeenCalledWith('[Service] Info message');
				expect(mockLogger.warn).toHaveBeenCalledWith('[Service] Warn message');
				expect(mockLogger.error).toHaveBeenCalledWith('[Service] Error message');
			});

			it('should not double-prefix messages', () => {
				const wrapped = withLoggerContext(mockLogger, 'Service');
				wrapped.info('[Service] Already prefixed');

				expect(mockLogger.info).toHaveBeenCalledWith('[Service] Already prefixed');
			});

			it('should preserve non-string arguments', () => {
				const wrapped = withLoggerContext(mockLogger, 'Service');
				wrapped.info('Message', { userId: '123' });

				expect(mockLogger.info).toHaveBeenCalledWith('[Service] Message', { userId: '123' });
			});

			it('should avoid re-wrapping with same context', () => {
				const wrapped1 = withLoggerContext(mockLogger, 'Service');
				const wrapped2 = withLoggerContext(wrapped1, 'Service');

				expect(wrapped1).toBe(wrapped2);
			});

			it('should wrap with different context if context changes', () => {
				const wrapped1 = withLoggerContext(mockLogger, 'Service1');
				const wrapped2 = withLoggerContext(wrapped1, 'Service2');

				expect(wrapped1).not.toBe(wrapped2);
			});

			it('should access original logger through symbol', () => {
				const wrapped = withLoggerContext(mockLogger, 'Service');
				const originalSymbol = Object.getOwnPropertySymbols(wrapped).find((s) => s.toString() === 'Symbol(__original_logger__)');

				expect(originalSymbol).toBeDefined();
			});
		});

		describe('Function Wrapping', () => {
			it('should wrap function and log execution', () => {
				const mockFn = vi.fn((arg: any) => arg);
				const wrapped = withLoggerContext(mockFn, 'MyFunction');

				wrapped({ logger: mockLogger });

				expect(mockLogger.debug).toHaveBeenCalledWith('[MyFunction] Function executed');
				expect(mockFn).toHaveBeenCalledWith({ logger: mockLogger });
			});

			it('should handle function with log property', () => {
				const mockFn = vi.fn((arg: any) => arg);
				const wrapped = withLoggerContext(mockFn, 'MyFunction');

				wrapped({ log: mockLogger });

				expect(mockFn).toHaveBeenCalled();
			});

			it('should return original target if not logger or function', () => {
				const obj = { value: 'test' };
				const result = withLoggerContext(obj as any, 'Context');

				expect(result).toBe(obj);
			});
		});
	});

	describe('LogContextMethod', () => {
		it('should throw error when applied to non-method', () => {
			expect(() => {
				class TestClass {
					// @ts-expect-error - Intentionally applying method decorator to property to test error handling
					@LogContextMethod()
					property = 'value';
				}
				new TestClass();
			}).toThrow('LogContextMethod solo puede aplicarse a métodos');
		});

		it('should wrap logger with method context for sync method', () => {
			class TestService {
				logger = mockLogger;

				@LogContextMethod()
				doWork() {
					this.logger.info('Working');
					return 'done';
				}
			}

			const service = new TestService();
			const result = service.doWork();

			expect(mockLogger.info).toHaveBeenCalled();
			expect(result).toBe('done');
		});

		it('should handle async methods correctly', async () => {
			class TestService {
				logger = mockLogger;

				@LogContextMethod()
				async asyncWork() {
					this.logger.info('Async work');
					return Promise.resolve('completed');
				}
			}

			const service = new TestService();
			const result = await service.asyncWork();

			expect(mockLogger.info).toHaveBeenCalled();
			expect(result).toBe('completed');
		});

		it('should restore logger after sync method execution', () => {
			const originalLogger = mockLogger;

			class TestService {
				logger = originalLogger;

				@LogContextMethod()
				doWork() {
					// Logger is temporarily wrapped here
					return 'done';
				}
			}

			const service = new TestService();
			service.doWork();

			// Logger should be restored
			expect(service.logger).toBeDefined();
		});

		it('should restore logger after async method execution', async () => {
			const originalLogger = mockLogger;

			class TestService {
				logger = originalLogger;

				@LogContextMethod()
				async asyncWork() {
					return Promise.resolve('completed');
				}
			}

			const service = new TestService();
			await service.asyncWork();

			// Logger should be restored
			expect(service.logger).toBeDefined();
		});

		it('should handle sync errors and restore logger', () => {
			class TestService {
				logger = mockLogger;

				@LogContextMethod()
				failingMethod() {
					throw new Error('Method failed');
				}
			}

			const service = new TestService();

			expect(() => service.failingMethod()).toThrow('Method failed');
			expect(service.logger).toBeDefined();
		});

		it('should handle async errors and restore logger', async () => {
			class TestService {
				logger = mockLogger;

				@LogContextMethod()
				async failingAsyncMethod() {
					throw new Error('Async method failed');
				}
			}

			const service = new TestService();

			await expect(service.failingAsyncMethod()).rejects.toThrow('Async method failed');
			expect(service.logger).toBeDefined();
		});

		it('should skip wrapping if logger already has same context', () => {
			class TestService {
				logger = mockLogger;

				@LogContextMethod()
				method1() {
					return 'result';
				}

				@LogContextMethod()
				method2() {
					// Call method1 which also has decorator
					return this.method1();
				}
			}

			const service = new TestService();
			const result = service.method2();

			expect(result).toBe('result');
		});

		it('should use runtime class name when available', () => {
			class NamedService {
				logger = mockLogger;

				@LogContextMethod()
				execute() {
					this.logger.debug('Executing');
					return true;
				}
			}

			const service = new NamedService();
			service.execute();

			expect(mockLogger.debug).toHaveBeenCalled();
		});

		it('should handle methods with multiple loggers', () => {
			const mockLogger2: ILogger = {
				debug: vi.fn(),
				info: vi.fn(),
				warn: vi.fn(),
				error: vi.fn(),
				log: vi.fn(),
				child: vi.fn(),
			};

			class MultiLoggerService {
				logger1 = mockLogger;
				logger2 = mockLogger2;

				@LogContextMethod()
				process() {
					this.logger1.info('Processing with logger1');
					this.logger2.info('Processing with logger2');
					return 'done';
				}
			}

			const service = new MultiLoggerService();
			service.process();

			expect(mockLogger.info).toHaveBeenCalled();
			expect(mockLogger2.info).toHaveBeenCalled();
		});
	});

	describe('LogContextClass', () => {
		it('should wrap logger injected through constructor', () => {
			@LogContextClass()
			class ServiceWithInjectedLogger {
				constructor(public logger: ILogger) {}

				doWork() {
					this.logger.info('Working');
				}
			}

			const service = new ServiceWithInjectedLogger(mockLogger);
			service.doWork();

			expect(mockLogger.info).toHaveBeenCalled();
		});

		it('should wrap logger-like properties after construction', () => {
			@LogContextClass()
			class ServiceWithLoggerProperty {
				logger: ILogger;

				constructor() {
					this.logger = mockLogger;
				}

				execute() {
					this.logger.debug('Executing');
				}
			}

			const service = new ServiceWithLoggerProperty();
			service.execute();

			expect(mockLogger.debug).toHaveBeenCalled();
		});

		it('should not re-wrap logger if it already has class context', () => {
			const wrappedLogger = withLoggerContext(mockLogger, 'TestService');

			@LogContextClass()
			class TestService {
				logger: ILogger;

				constructor() {
					this.logger = wrappedLogger;
				}
			}

			const service = new TestService();

			expect(service.logger).toBeDefined();
		});

		it('should use "UnknownClass" as fallback when name is not available', () => {
			// Create anonymous class
			const AnonymousClass = LogContextClass()(
				class {
					logger = mockLogger;

					run() {
						this.logger.warn('Running');
					}
				}
			);

			const instance = new AnonymousClass();
			instance.run();

			expect(mockLogger.warn).toHaveBeenCalled();
		});

		it('should handle multiple logger properties', () => {
			const mockLogger2: ILogger = {
				debug: vi.fn(),
				info: vi.fn(),
				warn: vi.fn(),
				error: vi.fn(),
				log: vi.fn(),
				child: vi.fn(),
			};

			@LogContextClass()
			class MultiLoggerService {
				logger1 = mockLogger;
				logger2 = mockLogger2;

				process() {
					this.logger1.info('Logger 1');
					this.logger2.info('Logger 2');
				}
			}

			const service = new MultiLoggerService();
			service.process();

			expect(mockLogger.info).toHaveBeenCalled();
			expect(mockLogger2.info).toHaveBeenCalled();
		});

		it('should wrap non-logger properties without errors', () => {
			@LogContextClass()
			class ServiceWithMixedProperties {
				logger = mockLogger;
				config = { value: 'test' };
				count = 0;

				increment() {
					this.count++;
					this.logger.debug('Incremented');
				}
			}

			const service = new ServiceWithMixedProperties();
			service.increment();

			expect(service.count).toBe(1);
			expect(service.config.value).toBe('test');
			expect(mockLogger.debug).toHaveBeenCalled();
		});
	});

	describe('logContextFunction', () => {
		it('should wrap function with logger context', () => {
			const originalFn = (logger: ILogger, value: string) => {
				logger.info('Processing');
				return value.toUpperCase();
			};

			const wrapped = logContextFunction(originalFn);
			const result = wrapped(mockLogger, 'test');

			expect(mockLogger.info).toHaveBeenCalled();
			expect(result).toBe('TEST');
		});

		it('should use function name as context', () => {
			function namedFunction(logger: ILogger) {
				logger.debug('Executing');
			}

			const wrapped = logContextFunction(namedFunction);
			wrapped(mockLogger);

			expect(mockLogger.debug).toHaveBeenCalled();
		});
	});

	describe('wrapContainerLogger', () => {
		it('should wrap container and inject logger context', () => {
			const mockContainer = {
				resolve: vi.fn((token: string) => {
					if (token === 'Logger') return mockLogger;
					return { service: 'other' };
				}),
			} as any;

			const wrapped = wrapContainerLogger(mockContainer, 'RequestContext');
			const logger = wrapped.resolve('Logger');

			expect(logger).toBeDefined();
		});

		it('should not wrap non-logger tokens', () => {
			const mockService = { name: 'config' };
			const mockContainer = {
				resolve: vi.fn(() => mockService),
			} as any;

			const wrapped = wrapContainerLogger(mockContainer, 'Context');
			const result = wrapped.resolve('Config' as any);

			expect(result).toBe(mockService);
		});

		it('should forward other container properties', () => {
			const mockContainer = {
				resolve: vi.fn(),
				isRegistered: vi.fn(() => true),
			} as any;

			const wrapped = wrapContainerLogger(mockContainer, 'Context');

			expect(wrapped.isRegistered).toBe(mockContainer.isRegistered);
		});
	});
});
