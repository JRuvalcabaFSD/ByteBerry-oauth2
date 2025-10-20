/**
 * Unit tests for ClockService
 *
 * @description Tests the clock service implementation that provides
 * current time utilities including Date objects, timestamps, and
 * formatted date strings.
 *
 * @author JRuvalcabaFSD
 * @since 1.0.0
 */

import { ClockService, createClockService } from '@/infrastructure';
import { IClock } from '@/interfaces';

describe('ClockService', () => {
  let clockService: ClockService;

  beforeEach(() => {
    clockService = new ClockService();
  });

  describe('Interface Compliance', () => {
    it('should implement i clock when service created', () => {
      // Act & Assert
      expect(clockService).toBeInstanceOf(ClockService);

      // Verify interface methods exist
      expect(typeof clockService.now).toBe('function');
      expect(typeof clockService.timestamp).toBe('function');
      expect(typeof clockService.isoString).toBe('function');
    });

    it('should be assignable to i clock when service created', () => {
      // Act
      const clock: IClock = clockService;

      // Assert
      expect(clock).toBeDefined();
      expect(clock.now).toBeDefined();
      expect(clock.timestamp).toBeDefined();
      expect(clock.isoString).toBeDefined();
    });
  });
  describe('now() method', () => {
    it('should return date object when now called', () => {
      // Act
      const result = clockService.now();

      // Assert
      expect(result).toBeInstanceOf(Date);
    });

    it('should return current time when now called', () => {
      // Arrange
      const beforeCall = Date.now();

      // Act
      const result = clockService.now();

      // Arrange (continued)
      const afterCall = Date.now();

      // Assert
      const resultTime = result.getTime();
      expect(resultTime).toBeGreaterThanOrEqual(beforeCall);
      expect(resultTime).toBeLessThanOrEqual(afterCall);
    });

    it('should return different instances when called multiple times', () => {
      // Act
      const date1 = clockService.now();
      const date2 = clockService.now();

      // Assert
      expect(date1).not.toBe(date2); // Different object references
      expect(date1).toBeInstanceOf(Date);
      expect(date2).toBeInstanceOf(Date);
    });

    it('should return progressive time when called with delay', async () => {
      // Act
      const time1 = clockService.now();
      await new Promise(resolve => setTimeout(resolve, 10)); // 10ms delay
      const time2 = clockService.now();

      // Assert
      expect(time2.getTime()).toBeGreaterThan(time1.getTime());
    });

    it('should allow mutation without affecting service when date mutated', () => {
      // Act
      const originalDate = clockService.now();
      const originalTime = originalDate.getTime();

      // Mutate the returned date
      originalDate.setFullYear(2000);

      // Get a new date
      const newDate = clockService.now();

      // Assert
      expect(originalDate.getFullYear()).toBe(2000); // Mutation worked
      expect(newDate.getFullYear()).not.toBe(2000); // Service unaffected
      expect(newDate.getTime()).toBeGreaterThanOrEqual(originalTime);
    });
  });

  describe('timestamp() method', () => {
    it('should return number when timestamp called', () => {
      // Act
      const result = clockService.timestamp();

      // Assert
      expect(typeof result).toBe('number');
    });

    it('should return current timestamp when timestamp called', () => {
      // Arrange
      const beforeCall = Date.now();

      // Act
      const result = clockService.timestamp();

      // Arrange (continued)
      const afterCall = Date.now();

      // Assert
      expect(result).toBeGreaterThanOrEqual(beforeCall);
      expect(result).toBeLessThanOrEqual(afterCall);
    });

    it('should return epoch milliseconds when timestamp called', () => {
      // Act
      const timestamp = clockService.timestamp();

      // Assert
      expect(timestamp).toBeGreaterThan(0);
      expect(timestamp).toBeGreaterThan(1000000000000); // After year 2001
      expect(Number.isInteger(timestamp)).toBe(true);
    });

    it('should return increasing values when called multiple times', async () => {
      // Act
      const timestamp1 = clockService.timestamp();
      await new Promise(resolve => setTimeout(resolve, 5)); // Small delay
      const timestamp2 = clockService.timestamp();

      // Assert
      expect(timestamp2).toBeGreaterThan(timestamp1);
    });

    it('should match date now when called simultaneously', () => {
      // Arrange
      // Mock Date.now to return a fixed value
      const fixedTimestamp = 1640995200000; // 2022 01 01T00:00:00.000Z
      const originalDateNow = Date.now;
      Date.now = jest.fn(() => fixedTimestamp);

      try {
        // Act
        const result = clockService.timestamp();

        // Assert
        expect(result).toBe(fixedTimestamp);
        expect(Date.now).toHaveBeenCalled();
      } finally {
        // Cleanup
        Date.now = originalDateNow;
      }
    });

    it('should be consistent with now method when called together', () => {
      // Act
      const dateObj = clockService.now();
      const timestamp = clockService.timestamp();

      // Assert
      // Allow small difference due to execution time
      const timeDifference = Math.abs(dateObj.getTime() - timestamp);
      expect(timeDifference).toBeLessThan(10); // Less than 10ms difference
    });
  });

  describe('isoString() method', () => {
    it('should return string when iso string called', () => {
      // Act
      const result = clockService.isoString();

      // Assert
      expect(typeof result).toBe('string');
    });

    it('should return date string when iso string called', () => {
      // Act
      const result = clockService.isoString();

      // Assert
      // Expect ISO 8601 format: 2025-10-17T12:30:45.123Z
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    });

    it('should match to date string format when iso string called', () => {
      // Arrange
      const fixedDate = new Date('2025-10-17T12:30:45.123Z');
      jest.useFakeTimers();
      jest.setSystemTime(fixedDate);

      try {
        // Act - create service after setting system time
        const localClock = new ClockService();
        const result = localClock.isoString();
        const expected = fixedDate.toISOString();

        // Assert - ISO equality for the mocked fixed date
        expect(result).toBe(expected);
      } finally {
        jest.useRealTimers();
      }
    });

    it('should not return iso format when iso string called', () => {
      // Act
      const result = clockService.isoString();

      // Assert
      // Should be ISO 8601 format
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);

      // Should NOT be toDateString format
      expect(result).not.toMatch(/^[A-Za-z]{3} [A-Za-z]{3} \d{1,2} \d{4}$/);
    });

    it('should return current date string when iso string called', () => {
      // Arrange
      // Act
      const result = clockService.isoString();

      // Assert: the returned ISO should parse to a timestamp close to now
      const parsed = Date.parse(result);
      const now = Date.now();
      expect(Math.abs(parsed - now)).toBeLessThan(1000); // within 1s
    });

    it('should be consistent with current date when called multiple times quickly', () => {
      // Act
      const result1 = clockService.isoString();
      const result2 = clockService.isoString();

      // Assert: times should be close (calls executed quickly)
      const t1 = Date.parse(result1);
      const t2 = Date.parse(result2);
      expect(Math.abs(t1 - t2)).toBeLessThan(50); // within 50ms
    });
  });

  describe('Method Consistency', () => {
    it('should have consistent time when all methods called together', () => {
      // Act
      const dateObj = clockService.now();
      const timestamp = clockService.timestamp();
      const dateString = clockService.isoString();

      // Assert
      // Timestamp should match date object
      const timeDifference = Math.abs(dateObj.getTime() - timestamp);
      expect(timeDifference).toBeLessThan(10);

      // Date string should match date object (ISO) within a small delta
      const parsed = Date.parse(dateString);
      expect(Math.abs(parsed - dateObj.getTime())).toBeLessThan(10);
    });

    it('should reflect same day when called simultaneously', () => {
      // Act
      const now = clockService.now();
      const isoString = clockService.isoString();

      // Assert - ISO timestamp should be within a small delta of now
      expect(Math.abs(now.getTime() - Date.parse(isoString))).toBeLessThan(10);
    });
  });

  describe('Testability and Mocking', () => {
    it('should be mockable when used in tests', () => {
      // Arrange
      const mockClock: IClock = {
        now: jest.fn(() => new Date('2025-01-01T00:00:00.000Z')),
        timestamp: jest.fn(() => 1640995200000),
        isoString: jest.fn(() => '2025-01-01T00:00:00.000Z'),
      };

      // Act
      const now = mockClock.now();
      const timestamp = mockClock.timestamp();
      const isoString = mockClock.isoString();

      // Assert
      expect(now.toISOString()).toBe('2025-01-01T00:00:00.000Z');
      expect(timestamp).toBe(1640995200000);
      expect(isoString).toBe('2025-01-01T00:00:00.000Z');
      expect(mockClock.now).toHaveBeenCalled();
      expect(mockClock.timestamp).toHaveBeenCalled();
      expect(mockClock.isoString).toHaveBeenCalled();
    });

    it('should allow deterministic testing when date mocked', () => {
      const fixedDate = new Date('2025-12-25T15:30:00.000Z');

      // Forzar uso de fake timers "modern" con casteo para evitar error de tipos
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
    it('should_HandleDateConstructorErrors_When_DateIsInvalid', () => {
      // This test ensures the service doesn't break if Date constructor behaves unexpectedly
      // Note: In normal Node.js environments, Date constructor is very robust

      // Act & Assert
      expect(() => clockService.now()).not.toThrow();
      expect(() => clockService.timestamp()).not.toThrow();
      expect(() => clockService.isoString()).not.toThrow();
    });
  });

  describe('Performance', () => {
    it('should_ExecuteQuickly_When_CalledManyTimes', () => {
      // Arrange
      const iterations = 1000;
      const startTime = Date.now();

      // Act
      for (let i = 0; i < iterations; i++) {
        clockService.now();
        clockService.timestamp();
        clockService.isoString();
      }

      const endTime = Date.now();

      // Assert
      const executionTime = endTime - startTime;
      expect(executionTime).toBeLessThan(100); // Should complete in less than 100ms
    });
  });
});

describe('createClockService factory', () => {
  it('should_ReturnClockServiceInstance_When_FactoryCalled', () => {
    // Act
    const clockService = createClockService();

    // Assert
    expect(clockService).toBeInstanceOf(ClockService);
    expect(clockService).toHaveProperty('now');
    expect(clockService).toHaveProperty('timestamp');
    expect(clockService).toHaveProperty('isoString');
  });

  it('should_ReturnNewInstance_When_CalledMultipleTimes', () => {
    // Act
    const service1 = createClockService();
    const service2 = createClockService();

    // Assert
    expect(service1).not.toBe(service2);
    expect(service1).toBeInstanceOf(ClockService);
    expect(service2).toBeInstanceOf(ClockService);
  });

  it('should_ReturnFunctionalService_When_FactoryCalled', () => {
    // Act
    const clockService = createClockService();

    // Assert
    expect(typeof clockService.now()).toBe('object');
    expect(typeof clockService.timestamp()).toBe('number');
    expect(typeof clockService.isoString()).toBe('string');
  });

  it('should_BeUsableInDIContainer_When_FactoryProvided', () => {
    // Arrange
    const mockContainer = {
      registerSingleton: jest.fn(),
    };

    // Act
    mockContainer.registerSingleton('Clock', createClockService);

    // Assert
    expect(mockContainer.registerSingleton).toHaveBeenCalledWith('Clock', createClockService);

    // Verify factory can be called
    const service = createClockService();
    expect(service).toBeInstanceOf(ClockService);
  });
});
