import { createUuidService, UuidService } from '@/infrastructure';
import { IUuid } from '@/interfaces';

describe('UuidService', () => {
  let uuidService: IUuid;

  beforeEach(() => {
    uuidService = new UuidService();
  });

  describe('generate', () => {
    it('should return string when called', () => {
      // When
      const result = uuidService.generate();

      // Then
      expect(typeof result).toBe('string');
    });

    it('should return valid uui dv4 format when called', () => {
      // When
      const result = uuidService.generate();

      // Then
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      expect(result).toMatch(uuidRegex);
    });

    it('should generate unique uui ds when called multiple times', () => {
      // When
      const uuid1 = uuidService.generate();
      const uuid2 = uuidService.generate();
      const uuid3 = uuidService.generate();

      // Then
      expect(uuid1).not.toBe(uuid2);
      expect(uuid2).not.toBe(uuid3);
      expect(uuid1).not.toBe(uuid3);
    });
  });

  describe('isValid', () => {
    it('should return true when valid uui dv4 provided', () => {
      // Given
      const validUuid = uuidService.generate();

      // When
      const result = uuidService.isValid(validUuid);

      // Then
      expect(result).toBe(true);
    });

    it('should return false when invalid uuid provided', () => {
      // Given
      const invalidUuids = [
        'invalid-uuid',
        '123',
        '',
        '550e8400-e29b-41d4-a716',
        '550e8400-e29b-51d4-a716-446655440000', // v5 instead of v4
      ];

      // When & Then
      invalidUuids.forEach(invalidUuid => {
        expect(uuidService.isValid(invalidUuid)).toBe(false);
      });
    });

    it('should return false when non string provided', () => {
      // When & Then
      expect(uuidService.isValid(null as any)).toBe(false);
      expect(uuidService.isValid(undefined as any)).toBe(false);
      expect(uuidService.isValid(123 as any)).toBe(false);
    });
  });

  describe('createUuidService', () => {
    it('should return uuid service instance when called', () => {
      // When
      const service = createUuidService();

      // Then
      expect(service).toBeInstanceOf(UuidService);
      expect(service).toHaveProperty('generate');
      expect(service).toHaveProperty('isValid');
    });
  });
});
