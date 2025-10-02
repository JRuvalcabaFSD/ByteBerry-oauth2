import { ClockService, createClockService } from '@/infrastructure';
import { IClock } from '@/interfaces';

describe('ClockService', () => {
  let clockService: IClock;

  beforeEach(() => {
    clockService = new ClockService();
  });

  describe('now', () => {
    it('should_ReturnDateInstance_When_Called', () => {
      // When
      const result = clockService.now();

      // Then
      expect(result).toBeInstanceOf(Date);
    });

    it('should_ReturnCurrentTime_When_Called', () => {
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
    it('should_ReturnNumber_When_Called', () => {
      // When
      const result = clockService.timestamp();

      // Then
      expect(typeof result).toBe('number');
    });

    it('should_ReturnMillisecondsSinceEpoch_When_Called', () => {
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
    it('should_ReturnISOString_When_Called', () => {
      // When
      const result = clockService.isoString();

      // Then
      expect(typeof result).toBe('string');
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    });

    it('should_BeValidISO8601Format_When_Called', () => {
      // When
      const result = clockService.isoString();
      const parsed = new Date(result);

      // Then
      expect(parsed.toISOString()).toBe(result);
    });
  });

  describe('createClockService', () => {
    it('should_ReturnClockServiceInstance_When_Called', () => {
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
