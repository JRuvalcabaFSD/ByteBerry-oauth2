import { IClock } from '@/interfaces';
import { ClockService } from '@/infrastructure';
describe('ClockService', () => {
  let clockService: IClock;

  beforeEach(() => {
    clockService = new ClockService();
  });

  describe('now', () => {
    it('should return current date', () => {
      const result = clockService.now();

      expect(result).toBeInstanceOf(Date);
      expect(Date.now() - result.getTime()).toBeLessThan(100);
    });
    it('should return different dates on subsequent calls', async () => {
      const date1 = clockService.now();
      await new Promise(res => setTimeout(res, 10));
      const date2 = clockService.now();

      expect(date2.getTime()).toBeGreaterThan(date1.getTime());
    });
  });
  describe('timestamp', () => {
    it('should return current timestamp as number', async () => {
      const result = clockService.timestamp();

      expect(typeof result).toBe('number');
      expect(Date.now() - result).toBeLessThan(100);
    });
    it('should return increasing timestamps', async () => {
      const timestamp1 = clockService.timestamp();
      await new Promise(res => setTimeout(res, 10));
      const timestamp2 = clockService.timestamp();

      expect(timestamp2).toBeGreaterThan(timestamp1);
    });
  });
});
