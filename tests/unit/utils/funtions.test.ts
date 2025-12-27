import { getErrMsg, getErrStack, getUTCTimestamp } from '@shared';

describe('Shared Utils Functions', () => {
	describe('getErrMsg', () => {
		it('should extract message from Error instance', () => {
			const error = new Error('Test error message');
			expect(getErrMsg(error)).toBe('Test error message');
		});

		it('should return "unknown error" for non-Error values', () => {
			expect(getErrMsg('string error')).toBe('unknown error');
			expect(getErrMsg(123)).toBe('unknown error');
			expect(getErrMsg(null)).toBe('unknown error');
		});
	});

	describe('getErrStack', () => {
		it('should extract stack trace from Error instance', () => {
			const error = new Error('Test error');
			const stack = getErrStack(error);
			expect(stack).toBeDefined();
			expect(typeof stack).toBe('string');
		});

		it('should return undefined for non-Error values', () => {
			expect(getErrStack('not an error')).toBeUndefined();
			expect(getErrStack(null)).toBeUndefined();
		});
	});

	describe('getUTCTimestamp', () => {
		it('should return UTC timestamp in correct format', () => {
			const timestamp = getUTCTimestamp();
			expect(timestamp).toMatch(/^\d{2}:\d{2}:\d{2}\.\d{3} UTC$/);
		});
	});
});
