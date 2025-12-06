/* eslint-disable @typescript-eslint/no-explicit-any */
import { WinstonLoggerService } from '@infrastructure';
import type { IConfig, IClock } from '@interfaces';

// Mock de winston con todo definido dentro del factory
vi.mock('winston', () => {
	const mockLog = vi.fn();
	const mockCreateLogger = vi.fn(() => ({
		log: mockLog,
	}));
	const mockFormatReturn = { _type: 'format' };

	return {
		default: {
			createLogger: mockCreateLogger,
			format: {
				combine: vi.fn(() => mockFormatReturn),
				timestamp: vi.fn(() => mockFormatReturn),
				errors: vi.fn(() => mockFormatReturn),
				json: vi.fn(() => mockFormatReturn),
				colorize: vi.fn(() => mockFormatReturn),
				printf: vi.fn(() => mockFormatReturn),
			},
			transports: {
				Console: class Console {
					public opts: any;
					constructor(opts: any) {
						this.opts = opts;
					}
				},
			},
			addColors: vi.fn(),
			config: {
				npm: {
					colors: {
						error: 'red',
						warn: 'yellow',
						info: 'green',
						debug: 'blue',
					},
				},
			},
		},
		// Exportar las funciones mock para que puedan ser accedidas por los tests
		__mocks: {
			mockLog,
			mockCreateLogger,
		},
	};
});

vi.mock('winston-daily-rotate-file', () => ({
	default: class DailyRotateFile {
		public opts: any;
		constructor(opts: any) {
			this.opts = opts;
		}
	},
}));

describe('WinstonLoggerService', () => {
	let logger: WinstonLoggerService;
	let mockConfig: IConfig;
	let mockClock: IClock;
	let mockLog: ReturnType<typeof vi.fn>;
	let mockCreateLogger: ReturnType<typeof vi.fn>;

	beforeEach(async () => {
		// Obtener las funciones mock del módulo winston
		const winston = await import('winston');
		const mocks = (winston as any).__mocks;
		mockLog = mocks.mockLog;
		mockCreateLogger = mocks.mockCreateLogger;

		vi.clearAllMocks();

		mockConfig = {
			serviceName: 'test-service',
			logLevel: 'info',
			isProduction: vi.fn(() => false),
			isDevelopment: vi.fn(() => true),
			isTest: vi.fn(() => false),
		} as unknown as IConfig;

		mockClock = {
			now: vi.fn(() => new Date('2025-01-15T14:30:45.123Z')),
			timestamp: vi.fn(() => 1705328445123),
			isoString: vi.fn(() => '2025-01-15T14:30:45.123Z'),
		};
	});

	describe('Constructor', () => {
		it('should create logger with default context', () => {
			logger = new WinstonLoggerService(mockConfig, mockClock);

			expect(mockCreateLogger).toHaveBeenCalled();
		});

		it('should merge default context with service name', () => {
			logger = new WinstonLoggerService(mockConfig, mockClock, { customKey: 'value' });

			expect(logger).toBeDefined();
		});
	});

	describe('Logging Methods', () => {
		beforeEach(() => {
			logger = new WinstonLoggerService(mockConfig, mockClock);
		});

		it('should log info message', () => {
			logger.info('Test message');

			expect(mockLog).toHaveBeenCalledWith(
				'info',
				expect.objectContaining({
					level: 'info',
					message: 'Test message',
				})
			);
		});

		it('should log error message', () => {
			logger.error('Error occurred');

			expect(mockLog).toHaveBeenCalledWith(
				'error',
				expect.objectContaining({
					level: 'error',
					message: 'Error occurred',
				})
			);
		});

		it('should log warn message', () => {
			logger.warn('Warning message');

			expect(mockLog).toHaveBeenCalledWith(
				'warn',
				expect.objectContaining({
					level: 'warn',
					message: 'Warning message',
				})
			);
		});

		it('should log debug message', () => {
			logger.debug('Debug info');

			expect(mockLog).toHaveBeenCalledWith(
				'debug',
				expect.objectContaining({
					level: 'debug',
					message: 'Debug info',
				})
			);
		});

		it('should include context in log entry', () => {
			logger.info('Test', { userId: '123', action: 'login' });

			expect(mockLog).toHaveBeenCalledWith(
				'info',
				expect.objectContaining({
					message: 'Test',
					context: {
						userId: '123',
						action: 'login',
					},
				})
			);
		});

		it('should include requestId in log entry when provided', () => {
			logger.info('Request received', { requestId: 'abc-123' });

			expect(mockLog).toHaveBeenCalledWith(
				'info',
				expect.objectContaining({
					requestId: 'abc-123',
				})
			);
		});

		it('should not duplicate service property in context', () => {
			logger.info('Test', { service: 'other-service', data: 'value' });

			const call = mockLog.mock.calls[0][1];
			expect(call.service).toBe('other-service');
			expect(call.context).toEqual({ data: 'value' });
		});
	});

	describe('Child Logger', () => {
		beforeEach(() => {
			logger = new WinstonLoggerService(mockConfig, mockClock);
		});

		it('should create child logger with additional context', () => {
			const childLogger = logger.child({ requestId: 'req-123' });

			expect(childLogger).toBeInstanceOf(WinstonLoggerService);
		});

		it('should inherit parent context in child logger', () => {
			const childLogger = logger.child({ feature: 'auth' });
			childLogger.info('Child log');

			expect(mockLog).toHaveBeenCalledWith(
				'info',
				expect.objectContaining({
					message: 'Child log',
				})
			);
		});
	});

	describe('Production Format', () => {
		it('should use JSON format in production', () => {
			mockConfig.isProduction = vi.fn(() => true);
			mockConfig.isDevelopment = vi.fn(() => false);

			logger = new WinstonLoggerService(mockConfig, mockClock);

			expect(mockCreateLogger).toHaveBeenCalled();
		});
	});

	describe('Development Format', () => {
		it('should use colorized format in development', () => {
			mockConfig.isProduction = vi.fn(() => false);
			mockConfig.isDevelopment = vi.fn(() => true);

			logger = new WinstonLoggerService(mockConfig, mockClock);

			expect(mockCreateLogger).toHaveBeenCalled();
		});
	});

	describe('Printf Formatter (Development)', () => {
		let printfFormatter: any;

		beforeEach(async () => {
			mockConfig.isProduction = vi.fn(() => false);
			mockConfig.isDevelopment = vi.fn(() => true);

			logger = new WinstonLoggerService(mockConfig, mockClock);

			// Obtener el printf formatter del formato
			const winston = await import('winston');
			const printfCall = (winston.default.format.printf as any).mock.calls[0];
			printfFormatter = printfCall ? printfCall[0] : null;
		});

		it('should format log with all basic fields', () => {
			if (!printfFormatter) return;

			const info = {
				timestamp: '14:30:45.123',
				level: 'info',
				message: 'Test message',
				service: 'test-service',
				requestId: 'req-12345678-extra',
			};

			const result = printfFormatter(info);

			expect(result).toContain('14:30:45.123');
			expect(result).toContain('[test-service]');
			expect(result).toContain('info');
			expect(result).toContain('[req-1234]'); // Truncated to 8 chars
			expect(result).toContain('Test message');
		});

		it('should handle missing service with "unknown"', () => {
			if (!printfFormatter) return;

			const info = {
				timestamp: '14:30:45.123',
				level: 'info',
				message: 'Test',
			};

			const result = printfFormatter(info);

			expect(result).toContain('[unknown]');
		});

		it('should format requestId only if it is string', () => {
			if (!printfFormatter) return;

			const info = {
				timestamp: '14:30:45.123',
				level: 'info',
				message: 'Test',
				service: 'svc',
				requestId: 123, // Not a string
			};

			const result = printfFormatter(info);

			expect(result).not.toContain('[123]');
		});

		it('should extract stack from context if present', () => {
			if (!printfFormatter) return;

			const info = {
				timestamp: '14:30:45.123',
				level: 'error',
				message: 'Error occurred',
				service: 'svc',
				context: {
					stack: 'Error: Test\n    at line 1',
					userId: '123',
				},
			};

			const result = printfFormatter(info);

			expect(result).toContain('userId');
			expect(result).toContain('Error: Test');
			expect(result).toContain('at line 1');
		});

		it('should include context without stack', () => {
			if (!printfFormatter) return;

			const info = {
				timestamp: '14:30:45.123',
				level: 'info',
				message: 'Test',
				service: 'svc',
				context: {
					userId: '123',
					action: 'login',
				},
			};

			const result = printfFormatter(info);

			expect(result).toContain('"userId": "123"');
			expect(result).toContain('"action": "login"');
		});

		it('should include rest metadata', () => {
			if (!printfFormatter) return;

			const info = {
				timestamp: '14:30:45.123',
				level: 'info',
				message: 'Test',
				service: 'svc',
				customField: 'custom-value',
				anotherField: 42,
			};

			const result = printfFormatter(info);

			expect(result).toContain('"customField": "custom-value"');
			expect(result).toContain('"anotherField": 42');
		});

		it('should format stack with escaped newlines', () => {
			if (!printfFormatter) return;

			const info = {
				timestamp: '14:30:45.123',
				level: 'error',
				message: 'Error',
				service: 'svc',
				stack: 'Error: Test\\n    at function1\\n    at function2',
			};

			const result = printfFormatter(info);

			expect(result).toContain('Error: Test');
			expect(result).toContain('at function1');
			expect(result).toContain('at function2');
			expect(result).not.toContain('\\n');
		});

		it('should format stack without escaped newlines', () => {
			if (!printfFormatter) return;

			const info = {
				timestamp: '14:30:45.123',
				level: 'error',
				message: 'Error',
				service: 'svc',
				stack: 'Error: Test\n    at function1',
			};

			const result = printfFormatter(info);

			expect(result).toContain('Error: Test');
		});
	});
});
