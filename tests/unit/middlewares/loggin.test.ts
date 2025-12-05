/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request, Response, NextFunction } from 'express';

import type { IClock, ILogger } from '@interfaces';
import { createLoggingMiddleware } from '@infrastructure';

describe('LoggingMiddleware', () => {
	let mockLogger: ILogger;
	let mockClock: IClock;
	let mockRequest: Partial<Request>;
	let mockResponse: Partial<Response>;
	let nextFunction: NextFunction;

	beforeEach(() => {
		mockLogger = {
			info: vi.fn(),
			error: vi.fn(),
			warn: vi.fn(),
			debug: vi.fn(),
			child: vi.fn().mockReturnValue({
				info: vi.fn(),
				warn: vi.fn(),
				error: vi.fn(),
				debug: vi.fn(),
			}),
		} as any;

		mockClock = {
			timestamp: vi.fn().mockReturnValue(1000),
			now: vi.fn(),
			isoString: vi.fn(),
		};

		mockRequest = {
			method: 'GET',
			url: '/test',
			originalUrl: '/test',
			headers: {
				'user-agent': 'test-agent',
			},
			ip: '127.0.0.1',
			requestId: 'test-request-id',
		};

		mockResponse = {
			statusCode: 200,
			get: vi.fn().mockReturnValue('100'),
			end: vi.fn(),
		};

		nextFunction = vi.fn();
	});

	describe('When logging is disabled (loggerRequests = true)', () => {
		it('should return no-op middleware', () => {
			const middleware = createLoggingMiddleware(mockLogger, mockClock, true);

			middleware(mockRequest as Request, mockResponse as Response, nextFunction);

			expect(mockLogger.child).not.toHaveBeenCalled();
			expect(mockLogger.info).not.toHaveBeenCalled();
			expect(nextFunction).toHaveBeenCalledOnce();
		});
	});

	describe('When logging is enabled (loggerRequests = false)', () => {
		it('should attach child logger to request', () => {
			const middleware = createLoggingMiddleware(mockLogger, mockClock, false);

			middleware(mockRequest as Request, mockResponse as Response, nextFunction);

			expect(mockLogger.child).toHaveBeenCalledWith({
				requestId: 'test-request-id',
				method: 'GET',
				url: '/test',
				userAgent: 'test-agent',
				ip: '127.0.0.1',
			});
			expect(mockRequest.logger).toBeDefined();
		});

		it('should log incoming request', () => {
			const childLogger = {
				info: vi.fn(),
				warn: vi.fn(),
			};
			mockLogger.child = vi.fn().mockReturnValue(childLogger);

			const middleware = createLoggingMiddleware(mockLogger, mockClock, false);
			middleware(mockRequest as Request, mockResponse as Response, nextFunction);

			expect(childLogger.info).toHaveBeenCalledWith('Incoming request', {
				method: 'GET',
				url: '/test',
				userAgent: 'test-agent',
				ip: '127.0.0.1',
			});
		});

		it('should set startTime on request', () => {
			const middleware = createLoggingMiddleware(mockLogger, mockClock, false);

			middleware(mockRequest as Request, mockResponse as Response, nextFunction);

			expect(mockRequest.starTime).toBe(1000);
		});

		it('should call next() after setup', () => {
			const middleware = createLoggingMiddleware(mockLogger, mockClock, false);

			middleware(mockRequest as Request, mockResponse as Response, nextFunction);

			expect(nextFunction).toHaveBeenCalledOnce();
		});

		it('should throw error if requestId is missing', () => {
			mockRequest.requestId = undefined;

			const middleware = createLoggingMiddleware(mockLogger, mockClock, false);
			middleware(mockRequest as Request, mockResponse as Response, nextFunction);

			expect(nextFunction).toHaveBeenCalledWith(
				expect.objectContaining({
					message: 'Request ID middleware must be applied before logging middleware',
				})
			);
		});
	});

	describe('Response Logging', () => {
		it('should log successful request completion', () => {
			mockClock.timestamp = vi
				.fn()
				.mockReturnValueOnce(1000) // Start time
				.mockReturnValueOnce(1500); // End time

			const childLogger = {
				info: vi.fn(),
				warn: vi.fn(),
			};
			mockLogger.child = vi.fn().mockReturnValue(childLogger);

			mockResponse.statusCode = 200;

			const middleware = createLoggingMiddleware(mockLogger, mockClock, false);
			middleware(mockRequest as Request, mockResponse as Response, nextFunction);

			// Call the intercepted end function
			const originalEnd = mockResponse.end as any;
			const interceptedEnd = (mockResponse as any).end;
			interceptedEnd.call(mockResponse);

			expect(childLogger.info).toHaveBeenCalledWith('Request completed', {
				method: 'GET',
				url: '/test',
				statusCode: 200,
				duration: 500,
				contentLength: '100',
			});
		});

		it('should log warning for error status codes', () => {
			mockClock.timestamp = vi.fn().mockReturnValueOnce(1000).mockReturnValueOnce(1500);

			const childLogger = {
				info: vi.fn(),
				warn: vi.fn(),
			};
			mockLogger.child = vi.fn().mockReturnValue(childLogger);

			mockResponse.statusCode = 404;

			const middleware = createLoggingMiddleware(mockLogger, mockClock, false);
			middleware(mockRequest as Request, mockResponse as Response, nextFunction);

			const interceptedEnd = (mockResponse as any).end;
			interceptedEnd.call(mockResponse);

			expect(childLogger.warn).toHaveBeenCalledWith('Request completed with error', {
				method: 'GET',
				url: '/test',
				statusCode: 404,
				duration: 500,
				contentLength: '100',
			});
		});

		it('should calculate correct duration', () => {
			mockClock.timestamp = vi.fn().mockReturnValueOnce(1000).mockReturnValueOnce(2500);

			const childLogger = {
				info: vi.fn(),
				warn: vi.fn(),
			};
			mockLogger.child = vi.fn().mockReturnValue(childLogger);

			const middleware = createLoggingMiddleware(mockLogger, mockClock, false);
			middleware(mockRequest as Request, mockResponse as Response, nextFunction);

			const interceptedEnd = (mockResponse as any).end;
			interceptedEnd.call(mockResponse);

			expect(childLogger.info).toHaveBeenCalledWith('Request completed', expect.objectContaining({ duration: 1500 }));
		});
	});

	describe('IP Address Handling', () => {
		it('should fallback to socket.remoteAddress if ip is undefined', () => {
			const mockRequestSinIp = {
				...mockRequest,
				ip: undefined,
				socket: { remoteAddress: '192.168.1.1' } as any,
			} as any;

			const middleware = createLoggingMiddleware(mockLogger, mockClock, false);
			middleware(mockRequestSinIp as Request, mockResponse as Response, nextFunction);

			expect(mockLogger.child).toHaveBeenCalledWith(expect.objectContaining({ ip: '192.168.1.1' }));
		});

		it('should use "unknown" if both ip and socket.remoteAddress are undefined', () => {
			const mockRequestSinIp = {
				...mockRequest,
				ip: undefined,
				socket: undefined,
			} as any;

			const middleware = createLoggingMiddleware(mockLogger, mockClock, false);
			middleware(mockRequestSinIp as Request, mockResponse as Response, nextFunction);

			expect(mockLogger.child).toHaveBeenCalledWith(expect.objectContaining({ ip: 'unknown' }));
		});
	});
});
