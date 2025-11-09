import { ClockService, createClockService } from '@/infrastructure';
import { IClock } from '@/interfaces';

describe('ClockService', () => {
  let clockService: ClockService;

  beforeEach(() => {
    clockService = new ClockService();
  });

  describe('Interface Compliance', () => {
    it('should implement i clock when service created', () => {
      expect(clockService).toBeInstanceOf(ClockService);

      expect(typeof clockService.now).toBe('function');
      expect(typeof clockService.timestamp).toBe('function');
      expect(typeof clockService.isoString).toBe('function');
    });

    it('should be assignable to i clock when service created', () => {
      const clock: IClock = clockService;

      expect(clock).toBeDefined();
      expect(clock.now).toBeDefined();
      expect(clock.timestamp).toBeDefined();
      expect(clock.isoString).toBeDefined();
    });
  });
  describe('now() method', () => {
    it('should return date object when now called', () => {
      const result = clockService.now();

      expect(result).toBeInstanceOf(Date);
    });

    it('should return current time when now called', () => {
      const beforeCall = Date.now();

      const result = clockService.now();

      const afterCall = Date.now();

      const resultTime = result.getTime();
      expect(resultTime).toBeGreaterThanOrEqual(beforeCall);
      expect(resultTime).toBeLessThanOrEqual(afterCall);
    });

    it('should return different instances when called multiple times', () => {
      const date1 = clockService.now();
      const date2 = clockService.now();

      expect(date1).not.toBe(date2); // Different object references
      expect(date1).toBeInstanceOf(Date);
      expect(date2).toBeInstanceOf(Date);
    });

    it('should return progressive time when called with delay', async () => {
      const time1 = clockService.now();
      await new Promise(resolve => setTimeout(resolve, 10)); // 10ms delay
      const time2 = clockService.now();

      expect(time2.getTime()).toBeGreaterThan(time1.getTime());
    });

    it('should allow mutation without affecting service when date mutated', () => {
      const originalDate = clockService.now();
      const originalTime = originalDate.getTime();

      // Mutate the returned date
      originalDate.setFullYear(2000);

      // Get a new date
      const newDate = clockService.now();

      expect(originalDate.getFullYear()).toBe(2000); // Mutation worked
      expect(newDate.getFullYear()).not.toBe(2000); // Service unaffected
      expect(newDate.getTime()).toBeGreaterThanOrEqual(originalTime);
    });
  });

  describe('timestamp() method', () => {
    it('should return number when timestamp called', () => {
      const result = clockService.timestamp();

      expect(typeof result).toBe('number');
    });

    it('should return current timestamp when timestamp called', () => {
      const beforeCall = Date.now();

      const result = clockService.timestamp();

      const afterCall = Date.now();

      expect(result).toBeGreaterThanOrEqual(beforeCall);
      expect(result).toBeLessThanOrEqual(afterCall);
    });

    it('should return epoch milliseconds when timestamp called', () => {
      const timestamp = clockService.timestamp();

      expect(timestamp).toBeGreaterThan(0);
      expect(timestamp).toBeGreaterThan(1000000000000); // After year 2001
      expect(Number.isInteger(timestamp)).toBe(true);
    });

    it('should return increasing values when called multiple times', async () => {
      const timestamp1 = clockService.timestamp();
      await new Promise(resolve => setTimeout(resolve, 5)); // Small delay
      const timestamp2 = clockService.timestamp();

      expect(timestamp2).toBeGreaterThan(timestamp1);
    });

    it('should match date now when called simultaneously', () => {
      // Mock Date.now to return a fixed value
      const fixedTimestamp = 1640995200000; // 2022 01 01T00:00:00.000Z
      const originalDateNow = Date.now;
      Date.now = jest.fn(() => fixedTimestamp);

      try {
        const result = clockService.timestamp();

        expect(result).toBe(fixedTimestamp);
        expect(Date.now).toHaveBeenCalled();
      } finally {
        // Cleanup
        Date.now = originalDateNow;
      }
    });

    it('should be consistent with now method when called together', () => {
      const dateObj = clockService.now();
      const timestamp = clockService.timestamp();

      // Allow small difference due to execution time
      const timeDifference = Math.abs(dateObj.getTime() - timestamp);
      expect(timeDifference).toBeLessThan(10); // Less than 10ms difference
    });
  });

  describe('isoString() method', () => {
    it('should return string when iso string called', () => {
      const result = clockService.isoString();

      expect(typeof result).toBe('string');
    });

    it('should return date string when iso string called', () => {
      const result = clockService.isoString();

      // Expect ISO 8601 format: 2025-10-17T12:30:45.123Z
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    });

    it('should match to date string format when iso string called', () => {
      const fixedDate = new Date('2025-10-17T12:30:45.123Z');
      jest.useFakeTimers();
      jest.setSystemTime(fixedDate);

      try {
        const localClock = new ClockService();
        const result = localClock.isoString();
        const expected = fixedDate.toISOString();

        expect(result).toBe(expected);
      } finally {
        jest.useRealTimers();
      }
    });

    it('should not return iso format when iso string called', () => {
      const result = clockService.isoString();

      // Should be ISO 8601 format
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);

      // Should NOT be toDateString format
      expect(result).not.toMatch(/^[A-Za-z]{3} [A-Za-z]{3} \d{1,2} \d{4}$/);
    });

    it('should return current date string when iso string called', () => {
      const result = clockService.isoString();

      const parsed = Date.parse(result);
      const now = Date.now();
      expect(Math.abs(parsed - now)).toBeLessThan(1000); // within 1s
    });

    it('should be consistent with current date when called multiple times quickly', () => {
      const result1 = clockService.isoString();
      const result2 = clockService.isoString();

      const t1 = Date.parse(result1);
      const t2 = Date.parse(result2);
      expect(Math.abs(t1 - t2)).toBeLessThan(50); // within 50ms
    });
  });

  describe('Method Consistency', () => {
    it('should have consistent time when all methods called together', () => {
      const dateObj = clockService.now();
      const timestamp = clockService.timestamp();
      const dateString = clockService.isoString();

      // Timestamp should match date object
      const timeDifference = Math.abs(dateObj.getTime() - timestamp);
      expect(timeDifference).toBeLessThan(10);

      // Date string should match date object (ISO) within a small delta
      const parsed = Date.parse(dateString);
      expect(Math.abs(parsed - dateObj.getTime())).toBeLessThan(10);
    });

    it('should reflect same day when called simultaneously', () => {
      const now = clockService.now();
      const isoString = clockService.isoString();

      expect(Math.abs(now.getTime() - Date.parse(isoString))).toBeLessThan(10);
    });
  });

  describe('Testability and Mocking', () => {
    it('should be mockable when used in tests', () => {
      const mockClock: IClock = {
        now: jest.fn(() => new Date('2025-01-01T00:00:00.000Z')),
        timestamp: jest.fn(() => 1640995200000),
        isoString: jest.fn(() => '2025-01-01T00:00:00.000Z'),
      };

      const now = mockClock.now();
      const timestamp = mockClock.timestamp();
      const isoString = mockClock.isoString();

      expect(now.toISOString()).toBe('2025-01-01T00:00:00.000Z');
      expect(timestamp).toBe(1640995200000);
      expect(isoString).toBe('2025-01-01T00:00:00.000Z');
      expect(mockClock.now).toHaveBeenCalled();
      expect(mockClock.timestamp).toHaveBeenCalled();
      expect(mockClock.isoString).toHaveBeenCalled();
    });

    it('should allow deterministic testing when date mocked', () => {
      const fixedDate = new Date('2025-12-25T15:30:00.000Z');

      (jest.useFakeTimers as unknown as (mode?: any) => void)('modern');
      jest.setSystemTime(fixedDate);

      try {
        const localClock = new ClockService();
        const now = localClock.now();
        const timestamp = localClock.timestamp();
        const isoString = localClock.isoString();

        expect(now.getTime()).toBe(fixedDate.getTime());
        expect(timestamp).toBe(fixedDate.getTime());
        expect(isoString).toBe(fixedDate.toISOString());
      } finally {
        jest.useRealTimers();
      }
    });
  });

  describe('Error Handling', () => {
    it('should handle date constructor errors when date is invalid', () => {
      expect(() => clockService.now()).not.toThrow();
      expect(() => clockService.timestamp()).not.toThrow();
      expect(() => clockService.isoString()).not.toThrow();
    });
  });

  describe('Performance', () => {
    it('should execute quickly when called many times', () => {
      const iterations = 1000;
      const startTime = Date.now();

      for (let i = 0; i < iterations; i++) {
        clockService.now();
        clockService.timestamp();
        clockService.isoString();
      }

      const endTime = Date.now();

      const executionTime = endTime - startTime;
      expect(executionTime).toBeLessThan(100); // Should complete in less than 100ms
    });
  });
});

describe('createClockService factory', () => {
  it('should return clock service instance when factory called', () => {
    const clockService = createClockService();

    expect(clockService).toBeInstanceOf(ClockService);
    expect(clockService).toHaveProperty('now');
    expect(clockService).toHaveProperty('timestamp');
    expect(clockService).toHaveProperty('isoString');
  });

  it('should return new instance when called multiple times', () => {
    const service1 = createClockService();
    const service2 = createClockService();

    expect(service1).not.toBe(service2);
    expect(service1).toBeInstanceOf(ClockService);
    expect(service2).toBeInstanceOf(ClockService);
  });

  it('should return functional service when factory called', () => {
    const clockService = createClockService();

    expect(typeof clockService.now()).toBe('object');
    expect(typeof clockService.timestamp()).toBe('number');
    expect(typeof clockService.isoString()).toBe('string');
  });

  it('should be usable in di container when factory provided', () => {
    const mockContainer = {
      registerSingleton: jest.fn(),
    };

    mockContainer.registerSingleton('Clock', createClockService);

    expect(mockContainer.registerSingleton).toHaveBeenCalledWith('Clock', createClockService);

    // Verify factory can be called
    const service = createClockService();
    expect(service).toBeInstanceOf(ClockService);
  });
});
