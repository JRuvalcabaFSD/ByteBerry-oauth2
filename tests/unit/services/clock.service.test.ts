import { ClockService } from '@infrastructure';

describe('ClockService', () => {
	let clockService: ClockService;

	beforeEach(() => {
		clockService = new ClockService();
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	describe('now', () => {
		it('should return current Date object', () => {
			const fixedDate = new Date('2025-01-15T14:30:45.123Z');
			vi.setSystemTime(fixedDate);

			const result = clockService.now();

			expect(result).toBeInstanceOf(Date);
			expect(result.getTime()).toBe(fixedDate.getTime());
		});

		it('should return different dates on consecutive calls', () => {
			vi.setSystemTime(new Date('2025-01-15T14:30:00.000Z'));
			const first = clockService.now();

			vi.setSystemTime(new Date('2025-01-15T14:31:00.000Z'));
			const second = clockService.now();

			expect(second.getTime()).toBeGreaterThan(first.getTime());
		});
	});

	describe('timestamp', () => {
		it('should return current timestamp in milliseconds', () => {
			const fixedDate = new Date('2025-01-15T14:30:45.123Z');
			vi.setSystemTime(fixedDate);

			const result = clockService.timestamp();

			expect(result).toBe(fixedDate.getTime());
			expect(typeof result).toBe('number');
		});

		it('should return Unix epoch timestamp', () => {
			vi.setSystemTime(new Date('1970-01-01T00:00:00.000Z'));

			const result = clockService.timestamp();

			expect(result).toBe(0);
		});
	});

	describe('isoString', () => {
		it('should return ISO 8601 formatted string', () => {
			const fixedDate = new Date('2025-01-15T14:30:45.123Z');
			vi.setSystemTime(fixedDate);

			const result = clockService.isoString();

			expect(result).toBe('2025-01-15T14:30:45.123Z');
			expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
		});

		it('should include timezone indicator (Z)', () => {
			const result = clockService.isoString();

			expect(result).toMatch(/Z$/);
		});
	});
});
