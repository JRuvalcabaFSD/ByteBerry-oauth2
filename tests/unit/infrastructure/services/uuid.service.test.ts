import { createUuidService, UuidService } from '@/infrastructure';
import { IUuid } from '@/interfaces';

describe('UuidService', () => {
  let uuidService: IUuid;

  beforeEach(() => {
    uuidService = new UuidService();
  });

  describe('generate', () => {
    it('should_ReturnString_When_Called', () => {
      // When
      const result = uuidService.generate();

      // Then
      expect(typeof result).toBe('string');
    });

    it('should_ReturnValidUUIDv4Format_When_Called', () => {
      // When
      const result = uuidService.generate();

      // Then
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      expect(result).toMatch(uuidRegex);
    });

    it('should_GenerateUniqueUUIDs_When_CalledMultipleTimes', () => {
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
    it('should_ReturnTrue_When_ValidUUIDv4Provided', () => {
      // Given
      const validUuid = uuidService.generate();

      // When
      const result = uuidService.isValid(validUuid);

      // Then
      expect(result).toBe(true);
    });

    it('should_ReturnFalse_When_InvalidUUIDProvided', () => {
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

    it('should_ReturnFalse_When_NonStringProvided', () => {
      // When & Then
      expect(uuidService.isValid(null as any)).toBe(false);
      expect(uuidService.isValid(undefined as any)).toBe(false);
      expect(uuidService.isValid(123 as any)).toBe(false);
    });
  });

  describe('createUuidService', () => {
    it('should_ReturnUuidServiceInstance_When_Called', () => {
      // When
      const service = createUuidService();

      // Then
      expect(service).toBeInstanceOf(UuidService);
      expect(service).toHaveProperty('generate');
      expect(service).toHaveProperty('isValid');
    });
  });
});
