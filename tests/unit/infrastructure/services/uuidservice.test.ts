/**
 * Unit tests for UuidService
 *
 * @description Tests the UUID service implementation that provides
 * RFC 4122 version 4 UUID generation and validation utilities.
 *
 * @author JRuvalcabaFSD
 * @since 1.0.0
 */

import { createUuidService, UuidService } from '@/infrastructure';
import { IUuid } from '@/interfaces';
import { randomUUID } from 'crypto';

// Mock crypto module
jest.mock('crypto', () => ({
  randomUUID: jest.fn(),
}));

describe('UuidService', () => {
  let uuidService: UuidService;
  let mockRandomUUID: jest.MockedFunction<typeof randomUUID>;

  beforeEach(() => {
    uuidService = new UuidService();
    mockRandomUUID = randomUUID as jest.MockedFunction<typeof randomUUID>;
    jest.clearAllMocks();
  });

  describe('Interface Compliance', () => {
    it('should implement i uuid when service created', () => {
      // Act & Assert
      expect(uuidService).toBeInstanceOf(UuidService);

      // Verify interface methods exist
      expect(typeof uuidService.generate).toBe('function');
      expect(typeof uuidService.isValid).toBe('function');
    });

    it('should be assignable to i uuid when service created', () => {
      // Act
      const uuid: IUuid = uuidService;

      // Assert
      expect(uuid).toBeDefined();
      expect(uuid.generate).toBeDefined();
      expect(uuid.isValid).toBeDefined();
    });
  });

  describe('generate() method', () => {
    it('should call crypto random uuid when generate called', () => {
      // Arrange
      const expectedUuid = '6f1e2d3c-4b5a-4f6e-9a0b-123456789abc';
      mockRandomUUID.mockReturnValue(expectedUuid);

      // Act
      const result = uuidService.generate();

      // Assert
      expect(mockRandomUUID).toHaveBeenCalledTimes(1);
      expect(mockRandomUUID).toHaveBeenCalledWith();
      expect(result).toBe(expectedUuid);
    });

    it('should return string when generate called', () => {
      // Arrange
      // Use a valid UUID-like string so it matches the template literal type
      mockRandomUUID.mockReturnValue('6f1e2d3c-4b5a-4f6e-9a0b-123456789abc');

      // Act
      const result = uuidService.generate();

      // Assert
      expect(typeof result).toBe('string');
    });

    it('should return uuid format when generate called', () => {
      // Arrange
      const validUuid = '550e8400-e29b-41d4-a716-446655440000';
      mockRandomUUID.mockReturnValue(validUuid);

      // Act
      const result = uuidService.generate();

      // Assert
      expect(result).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
    });

    it('should return different values when called multiple times', () => {
      // Arrange
      const uuid1 = '6f1e2d3c-4b5a-4f6e-9a0b-123456789abc';
      const uuid2 = '7a2b3c4d-5e6f-4a7b-8c9d-0e1f2a3b4c5d';
      mockRandomUUID.mockReturnValueOnce(uuid1).mockReturnValueOnce(uuid2);

      // Act
      const result1 = uuidService.generate();
      const result2 = uuidService.generate();

      // Assert
      expect(result1).toBe(uuid1);
      expect(result2).toBe(uuid2);
      expect(result1).not.toBe(result2);
      expect(mockRandomUUID).toHaveBeenCalledTimes(2);
    });

    it('should delegate to node crypto when generate called', () => {
      // Arrange
      const expectedUuid = 'f47ac10b-58cc-4372-a567-0e02b2c3d479';
      mockRandomUUID.mockReturnValue(expectedUuid);

      // Act
      const result = uuidService.generate();

      // Assert
      expect(result).toBe(expectedUuid);
      expect(mockRandomUUID).toHaveBeenCalledWith();
    });

    it('should handle crypto errors when random uuid throws', () => {
      // Arrange
      const error = new Error('Crypto not available');
      mockRandomUUID.mockImplementation(() => {
        throw error;
      });

      // Act & Assert
      expect(() => uuidService.generate()).toThrow('Crypto not available');
    });
  });

  describe('isValid() method', () => {
    describe('Valid UUIDs', () => {
      it('should return true when valid v4 uuid provided', () => {
        // Arrange
        const validUuids = [
          '6f1e2d3c-4b5a-4f6e-9a0b-123456789abc',
          '550e8400-e29b-41d4-a716-446655440000',
          'f47ac10b-58cc-4372-a567-0e02b2c3d479',
          '6ba7b810-9dad-41d1-80b4-00c04fd430c8', // ahora v4 (versión = 4)
        ];

        // Act & Assert
        validUuids.forEach(uuid => {
          expect(uuidService.isValid(uuid)).toBe(true);
        });
      });

      it('should return true when uppercase uuid provided', () => {
        // Arrange
        const uppercaseUuid = '6F1E2D3C-4B5A-4F6E-9A0B-123456789ABC';

        // Act
        const result = uuidService.isValid(uppercaseUuid);

        // Assert
        expect(result).toBe(true);
      });

      it('should return true when mixed case uuid provided', () => {
        // Arrange
        const mixedCaseUuid = '6f1E2d3C-4B5a-4F6e-9A0b-123456789AbC';

        // Act
        const result = uuidService.isValid(mixedCaseUuid);

        // Assert
        expect(result).toBe(true);
      });

      it('should return true when version4 with variant8 provided', () => {
        // Arrange - Version 4 (4th char of 3rd group), Variant 8 (1st char of 4th group)
        const uuid = '550e8400-e29b-41d4-8716-446655440000';

        // Act
        const result = uuidService.isValid(uuid);

        // Assert
        expect(result).toBe(true);
      });

      it('should return true when version4 with variant9 provided', () => {
        // Arrange - Version 4, Variant 9
        const uuid = '550e8400-e29b-41d4-9716-446655440000';

        // Act
        const result = uuidService.isValid(uuid);

        // Assert
        expect(result).toBe(true);
      });

      it('should return true when version4 with variant a provided', () => {
        // Arrange - Version 4, Variant A
        const uuid = '550e8400-e29b-41d4-a716-446655440000';

        // Act
        const result = uuidService.isValid(uuid);

        // Assert
        expect(result).toBe(true);
      });

      it('should return true when version4 with variant b provided', () => {
        // Arrange - Version 4, Variant B
        const uuid = '550e8400-e29b-41d4-b716-446655440000';

        // Act
        const result = uuidService.isValid(uuid);

        // Assert
        expect(result).toBe(true);
      });
    });

    describe('Invalid UUIDs', () => {
      it('should return false when non string provided', () => {
        // Arrange
        const nonStringValues = [null, undefined, 123, true, {}, [], Symbol('uuid')];

        // Act & Assert
        nonStringValues.forEach(value => {
          expect(uuidService.isValid(value as any)).toBe(false);
        });
      });

      it('should return false when empty string provided', () => {
        // Act
        const result = uuidService.isValid('');

        // Assert
        expect(result).toBe(false);
      });

      it('should return false when invalid format provided', () => {
        // Arrange
        const invalidFormats = [
          'not-a-uuid',
          '550e8400e29b41d4a716446655440000', // Missing hyphens
          '550e8400-e29b-41d4-a716-446655440000-extra', // Too long
          '550e8400-e29b-41d4-a716-44665544000', // Too short
          '550e8400-e29b-41d4-a716', // Incomplete
          'g50e8400-e29b-41d4-a716-446655440000', // Invalid hex character
        ];

        // Act & Assert
        invalidFormats.forEach(invalidUuid => {
          expect(uuidService.isValid(invalidUuid)).toBe(false);
        });
      });

      it('should return false when wrong version provided', () => {
        // Arrange - Wrong version (not 4)
        const wrongVersionUuids = [
          '550e8400-e29b-11d1-a716-446655440000', // Version 1
          '550e8400-e29b-21d1-a716-446655440000', // Version 2
          '550e8400-e29b-31d1-a716-446655440000', // Version 3
          '550e8400-e29b-51d1-a716-446655440000', // Version 5
        ];

        // Act & Assert
        wrongVersionUuids.forEach(uuid => {
          expect(uuidService.isValid(uuid)).toBe(false);
        });
      });

      it('should return false when wrong variant provided', () => {
        // Arrange - Wrong variant (not 8, 9, a, b)
        const wrongVariantUuids = [
          '550e8400-e29b-41d4-0716-446655440000', // Variant 0
          '550e8400-e29b-41d4-1716-446655440000', // Variant 1
          '550e8400-e29b-41d4-c716-446655440000', // Variant c
          '550e8400-e29b-41d4-f716-446655440000', // Variant f
        ];

        // Act & Assert
        wrongVariantUuids.forEach(uuid => {
          expect(uuidService.isValid(uuid)).toBe(false);
        });
      });

      it('should return false when incorrect segment length provided', () => {
        // Arrange
        const incorrectLengthUuids = [
          '550e840-e29b-41d4-a716-446655440000', // First segment too short
          '550e84000-e29b-41d4-a716-446655440000', // First segment too long
          '550e8400-e29-41d4-a716-446655440000', // Second segment too short
          '550e8400-e29bb-41d4-a716-446655440000', // Second segment too long
          '550e8400-e29b-41d-a716-446655440000', // Third segment too short
          '550e8400-e29b-41d44-a716-446655440000', // Third segment too long
          '550e8400-e29b-41d4-a71-446655440000', // Fourth segment too short
          '550e8400-e29b-41d4-a7166-446655440000', // Fourth segment too long
          '550e8400-e29b-41d4-a716-44665544000', // Fifth segment too short
          '550e8400-e29b-41d4-a716-4466554400000', // Fifth segment too long
        ];

        // Act & Assert
        incorrectLengthUuids.forEach(uuid => {
          expect(uuidService.isValid(uuid)).toBe(false);
        });
      });

      it('should return false when special characters provided', () => {
        // Arrange
        const specialCharUuids = [
          '550e8400-e29b-41d4-a716-44665544000@', // Special character at end
          '550e8400-e29b-41d4-a716-44665544000 ', // Space at end
          ' 550e8400-e29b-41d4-a716-446655440000', // Space at beginning
          '550e8400-e29b-41d4-a716-44665544000\n', // Newline
          '550e8400-e29b-41d4-a716-44665544000\t', // Tab
        ];

        // Act & Assert
        specialCharUuids.forEach(uuid => {
          expect(uuidService.isValid(uuid)).toBe(false);
        });
      });
    });

    describe('Edge Cases', () => {
      it('should return false when null provided', () => {
        // Act
        const result = uuidService.isValid(null as any);

        // Assert
        expect(result).toBe(false);
      });

      it('should return false when undefined provided', () => {
        // Act
        const result = uuidService.isValid(undefined as any);

        // Assert
        expect(result).toBe(false);
      });

      it('should handle long strings when very long string provided', () => {
        // Arrange
        const longString = 'a'.repeat(1000);

        // Act
        const result = uuidService.isValid(longString);

        // Assert
        expect(result).toBe(false);
      });

      it('should_HandleUnicodeCharacters_When_UnicodeProvided', () => {
        // Arrange
        const unicodeUuid = '550e8400-e29b-41d4-a716-44665544000🙂';

        // Act
        const result = uuidService.isValid(unicodeUuid);

        // Assert
        expect(result).toBe(false);
      });
    });
  });

  describe('Static UUID_REGEX', () => {
    it('should have correct pattern when accessing regex', () => {
      // Act
      const regex = (UuidService as any).UUID_REGEX;

      // Assert
      expect(regex).toBeInstanceOf(RegExp);
      expect(regex.flags).toContain('i'); // Case-insensitive
    });

    it('should match valid uui ds when regex tested', () => {
      // Arrange
      const regex = (UuidService as any).UUID_REGEX;
      const validUuid = '6f1e2d3c-4b5a-4f6e-9a0b-123456789abc';

      // Act
      const result = regex.test(validUuid);

      // Assert
      expect(result).toBe(true);
    });

    it('should reject invalid uui ds when regex tested', () => {
      // Arrange
      const regex = (UuidService as any).UUID_REGEX;
      const invalidUuid = 'not-a-uuid';

      // Act
      const result = regex.test(invalidUuid);

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('Integration with generate()', () => {
    it('should generate valid uui ds when generate and validate together', () => {
      // Arrange
      const validUuid: `${string}-${string}-${string}-${string}-${string}` = '6f1e2d3c-4b5a-4f6e-9a0b-123456789abc';
      mockRandomUUID.mockReturnValue(validUuid);

      // Act
      const generated = uuidService.generate();
      const isValid = uuidService.isValid(generated);

      // Assert
      expect(isValid).toBe(true);
    });

    it('should validate generated uui ds when called multiple times', () => {
      // Arrange
      const validUuids: Array<`${string}-${string}-${string}-${string}-${string}`> = [
        '6f1e2d3c-4b5a-4f6e-9a0b-123456789abc',
        '550e8400-e29b-41d4-a716-446655440000',
        'f47ac10b-58cc-4372-a567-0e02b2c3d479',
      ];

      validUuids.forEach(uuid => mockRandomUUID.mockReturnValueOnce(uuid));

      // Act & Assert
      validUuids.forEach(() => {
        const generated = uuidService.generate();
        expect(uuidService.isValid(generated)).toBe(true);
      });
    });
  });

  describe('Performance', () => {
    it('should generate quickly when called many times', () => {
      // Arrange
      mockRandomUUID.mockReturnValue('6f1e2d3c-4b5a-4f6e-9a0b-123456789abc' as `${string}-${string}-${string}-${string}-${string}`);
      const iterations = 1000;
      const startTime = Date.now();

      // Act
      for (let i = 0; i < iterations; i++) {
        uuidService.generate();
      }

      const endTime = Date.now();

      // Assert
      const executionTime = endTime - startTime;
      expect(executionTime).toBeLessThan(100); // Should complete quickly
      expect(mockRandomUUID).toHaveBeenCalledTimes(iterations);
    });

    it('should validate quickly when called many times', () => {
      // Arrange
      const uuid = '6f1e2d3c-4b5a-4f6e-9a0b-123456789abc';
      const iterations = 1000;
      const startTime = Date.now();

      // Act
      for (let i = 0; i < iterations; i++) {
        uuidService.isValid(uuid);
      }

      const endTime = Date.now();

      // Assert
      const executionTime = endTime - startTime;
      expect(executionTime).toBeLessThan(50); // Validation should be very fast
    });
  });

  describe('Testability and Mocking', () => {
    it('should be mockable when used in tests', () => {
      // Arrange
      const mockUuid: IUuid = {
        generate: jest.fn(() => 'mock-uuid'),
        isValid: jest.fn(() => true),
      };

      // Act
      const generated = mockUuid.generate();
      const isValid = mockUuid.isValid('test-uuid');

      // Assert
      expect(generated).toBe('mock-uuid');
      expect(isValid).toBe(true);
      expect(mockUuid.generate).toHaveBeenCalled();
      expect(mockUuid.isValid).toHaveBeenCalledWith('test-uuid');
    });

    it('should allow predictable testing when crypto mocked', () => {
      // Arrange
      const predictableUuid = 'test-uuid-123-456-789';
      mockRandomUUID.mockReturnValue(predictableUuid);

      // Act
      const result = uuidService.generate();

      // Assert
      expect(result).toBe(predictableUuid);
      expect(mockRandomUUID).toHaveBeenCalledTimes(1);
    });
  });
});

describe('createUuidService factory', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return uuid service instance when factory called', () => {
    // Act
    const uuidService = createUuidService();

    // Assert
    expect(uuidService).toBeInstanceOf(UuidService);
    expect(uuidService).toHaveProperty('generate');
    expect(uuidService).toHaveProperty('isValid');
  });

  it('should return new instance when called multiple times', () => {
    // Act
    const service1 = createUuidService();
    const service2 = createUuidService();

    // Assert
    expect(service1).not.toBe(service2);
    expect(service1).toBeInstanceOf(UuidService);
    expect(service2).toBeInstanceOf(UuidService);
  });

  it('should return functional service when factory called', () => {
    // Arrange
    const mockUuid = '6f1e2d3c-4b5a-4f6e-9a0b-123456789abc';
    (randomUUID as jest.MockedFunction<typeof randomUUID>).mockReturnValue(mockUuid);

    // Act
    const uuidService = createUuidService();

    // Assert
    expect(typeof uuidService.generate()).toBe('string');
    expect(typeof uuidService.isValid('test')).toBe('boolean');
  });

  it('should be usable in di container when factory provided', () => {
    // Arrange
    const mockContainer = {
      registerSingleton: jest.fn(),
    };

    // Act
    mockContainer.registerSingleton('Uuid', createUuidService);

    // Assert
    expect(mockContainer.registerSingleton).toHaveBeenCalledWith('Uuid', createUuidService);

    // Verify factory can be called
    const service = createUuidService();
    expect(service).toBeInstanceOf(UuidService);
  });

  it('should produce different instances when factory used in container', () => {
    // Arrange
    const factory = createUuidService;

    // Act
    const service1 = factory();
    const service2 = factory();

    // Assert
    expect(service1).not.toBe(service2);
    expect(service1).toBeInstanceOf(UuidService);
    expect(service2).toBeInstanceOf(UuidService);
  });
});
export const uuidV4Regex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isValid(uuid: string): boolean {
  if (typeof uuid !== 'string') return false;
  return uuidV4Regex.test(uuid);
}
