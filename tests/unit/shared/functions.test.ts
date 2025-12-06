import { getErrMsg, getErrStack, getUTCTimestamp } from '@shared';

describe('Utility Functions', () => {
	describe('getErrMsg', () => {
		it('should return error message from Error instance', () => {
			const error = new Error('Test error message');
			expect(getErrMsg(error)).toBe('Test error message');
		});

		it('should return "unknown error" for non-Error values', () => {
			expect(getErrMsg('string error')).toBe('unknown error');
			expect(getErrMsg(123)).toBe('unknown error');
			expect(getErrMsg(null)).toBe('unknown error');
			expect(getErrMsg(undefined)).toBe('unknown error');
		});
	});

	describe('getErrStack', () => {
		it('should return stack trace from Error instance', () => {
			const error = new Error('Test error');
			const stack = getErrStack(error);

			expect(stack).toBeDefined();
			expect(typeof stack).toBe('string');
			expect(stack).toContain('Error: Test error');
		});

		it('should return undefined for non-Error values', () => {
			expect(getErrStack('string error')).toBeUndefined();
			expect(getErrStack(123)).toBeUndefined();
			expect(getErrStack(null)).toBeUndefined();
		});
	});

	describe('getUTCTimestamp', () => {
		beforeEach(() => {
			// Mock Date to return a fixed time
			vi.useFakeTimers();
		});

		afterEach(() => {
			vi.useRealTimers();
		});

		it('should return timestamp in correct format', () => {
			// Set a fixed date: 2025-01-15 14:30:45.123 UTC
			vi.setSystemTime(new Date('2025-01-15T14:30:45.123Z'));

			const timestamp = getUTCTimestamp();

			expect(timestamp).toBe('14:30:45.123 UTC');
		});

		it('should pad single digits with zeros', () => {
			// Set time with single digits: 2025-01-15 09:05:03.007 UTC
			vi.setSystemTime(new Date('2025-01-15T09:05:03.007Z'));

			const timestamp = getUTCTimestamp();

			expect(timestamp).toBe('09:05:03.007 UTC');
		});

		it('should handle midnight correctly', () => {
			vi.setSystemTime(new Date('2025-01-15T00:00:00.000Z'));

			const timestamp = getUTCTimestamp();

			expect(timestamp).toBe('00:00:00.000 UTC');
		});

		it('should handle milliseconds correctly', () => {
			vi.setSystemTime(new Date('2025-01-15T12:30:45.999Z'));

			const timestamp = getUTCTimestamp();

			expect(timestamp).toBe('12:30:45.999 UTC');
		});
	});
});
