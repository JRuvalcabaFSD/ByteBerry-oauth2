import { containerWithLoggerContext, HasResolve } from '@shared';
import { ILogger } from '@interfaces';

describe('Container Proxy Decorator', () => {
	const createMockLogger = (): ILogger => ({
		debug: vi.fn(),
		info: vi.fn(),
		warn: vi.fn(),
		error: vi.fn(),
		log: vi.fn(),
		child: vi.fn().mockReturnThis(),
	});

	describe('containerWithLoggerContext', () => {
		it('should wrap container resolve method', () => {
			const mockLogger = createMockLogger();
			const mockContainer: HasResolve = {
				resolve: vi.fn((token: string) => {
					if (token === 'Logger') return mockLogger;
					return { test: 'value' };
				}) as unknown as <T = any>(token: unknown, ...rest: unknown[]) => T,
			};

			const wrapped = containerWithLoggerContext(mockContainer, 'TestContext');

			expect(wrapped).toBeDefined();
			expect(typeof wrapped.resolve).toBe('function');
		});

		it('should add context to resolved logger', () => {
			const mockLogger = createMockLogger();
			const mockContainer: HasResolve = {
				resolve: vi.fn((token: string) => {
					if (token === 'Logger') return mockLogger;
					return { test: 'value' };
				}) as unknown as <T = any>(token: unknown, ...rest: unknown[]) => T,
			};

			const wrapped = containerWithLoggerContext(mockContainer, 'TestContext');
			const logger = wrapped.resolve('Logger');

			logger.debug('test message');

			expect(mockLogger.debug).toHaveBeenCalledWith(expect.stringContaining('TestContext'));
		});

		it('should pass through non-logger resolutions', () => {
			const mockContainer: HasResolve = {
				resolve: vi.fn(() => ({ test: 'value' })) as unknown as <T = any>(token: unknown, ...rest: unknown[]) => T,
			};

			const wrapped = containerWithLoggerContext(mockContainer, 'TestContext');
			const result = wrapped.resolve('Config');

			expect(result).toEqual({ test: 'value' });
		});
	});
});
