import { Request, Response, NextFunction } from 'express';

import { createRequestIdMiddleware } from '@infrastructure';
import type { IUuid } from '@interfaces';

describe('RequestIdMiddleware', () => {
	let mockUuid: IUuid;
	let mockRequest: Partial<Request>;
	let mockResponse: Partial<Response>;
	let nextFunction: NextFunction;

	beforeEach(() => {
		mockUuid = {
			generate: vi.fn().mockReturnValue('generated-uuid-1234'),
			isValid: vi.fn(),
		};

		mockRequest = {
			headers: {},
		};

		mockResponse = {
			setHeader: vi.fn(),
		};

		nextFunction = vi.fn();
	});

	describe('Request ID Generation', () => {
		it('should use existing x-request-id header if present', () => {
			mockRequest.headers = { 'x-request-id': 'existing-request-id' };

			const middleware = createRequestIdMiddleware(mockUuid);
			middleware(mockRequest as Request, mockResponse as Response, nextFunction);

			expect(mockRequest.requestId).toBe('existing-request-id');
			expect(mockResponse.setHeader).toHaveBeenCalledWith('X-RequestID', 'existing-request-id');
			expect(mockUuid.generate).not.toHaveBeenCalled();
			expect(nextFunction).toHaveBeenCalled();
		});

		it('should generate new UUID if no x-request-id header', () => {
			const middleware = createRequestIdMiddleware(mockUuid);
			middleware(mockRequest as Request, mockResponse as Response, nextFunction);

			expect(mockUuid.generate).toHaveBeenCalled();
			expect(mockRequest.requestId).toBe('generated-uuid-1234');
			expect(mockResponse.setHeader).toHaveBeenCalledWith('X-RequestID', 'generated-uuid-1234');
			expect(nextFunction).toHaveBeenCalled();
		});

		it('should set X-RequestID response header', () => {
			mockRequest.headers = { 'x-request-id': 'test-id' };

			const middleware = createRequestIdMiddleware(mockUuid);
			middleware(mockRequest as Request, mockResponse as Response, nextFunction);

			expect(mockResponse.setHeader).toHaveBeenCalledWith('X-RequestID', 'test-id');
		});

		it('should call next() after processing', () => {
			const middleware = createRequestIdMiddleware(mockUuid);
			middleware(mockRequest as Request, mockResponse as Response, nextFunction);

			expect(nextFunction).toHaveBeenCalledOnce();
		});
	});

	describe('Header Handling', () => {
		it('should handle empty headers object', () => {
			mockRequest.headers = {};

			const middleware = createRequestIdMiddleware(mockUuid);
			middleware(mockRequest as Request, mockResponse as Response, nextFunction);

			expect(mockUuid.generate).toHaveBeenCalled();
			expect(mockRequest.requestId).toBe('generated-uuid-1234');
		});

		it('should handle case-sensitive header name', () => {
			// Express normalizes headers to lowercase
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			mockRequest.headers = { 'X-Request-ID': 'uppercase-header' } as any;

			const middleware = createRequestIdMiddleware(mockUuid);
			middleware(mockRequest as Request, mockResponse as Response, nextFunction);

			// Should not find it (Express uses lowercase)
			expect(mockUuid.generate).toHaveBeenCalled();
		});
	});
});
