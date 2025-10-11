import { ClockService, createClockService } from '@/infrastructure';
import { IClock } from '@/interfaces';

describe('ClockService', () => {
  let clockService: IClock;

  beforeEach(() => {
    clockService = new ClockService();
  });

  describe('now', () => {
    it('should return date instance when called', () => {
      // When
      const result = clockService.now();

      // Then
      expect(result).toBeInstanceOf(Date);
    });

    it('should return current time when called', () => {
      // Given
      const before = Date.now();

      // When
      const result = clockService.now();
      const after = Date.now();

      // Then
      expect(result.getTime()).toBeGreaterThanOrEqual(before);
      expect(result.getTime()).toBeLessThanOrEqual(after);
    });
  });

  describe('timestamp', () => {
    it('should return number when called', () => {
      // When
      const result = clockService.timestamp();

      // Then
      expect(typeof result).toBe('number');
    });

    it('should return milliseconds since epoch when called', () => {
      // Given
      const before = Date.now();

      // When
      const result = clockService.timestamp();
      const after = Date.now();

      // Then
      expect(result).toBeGreaterThanOrEqual(before);
      expect(result).toBeLessThanOrEqual(after);
    });
  });

  describe('isoString', () => {
    it('should return iso string when called', () => {
      // When
      const result = clockService.isoString();

      // Then
      expect(typeof result).toBe('string');
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    });

    it('should be valid iso8601 format when called', () => {
      // When
      const result = clockService.isoString();
      const parsed = new Date(result);

      // Then
      expect(parsed.toISOString()).toBe(result);
    });
  });

  describe('createClockService', () => {
    it('should return clock service instance when called', () => {
      // When
      const service = createClockService();

      // Then
      expect(service).toBeInstanceOf(ClockService);
      expect(service).toHaveProperty('now');
      expect(service).toHaveProperty('timestamp');
      expect(service).toHaveProperty('isoString');
    });
  });
});
