import { createUuidService, UuidService } from '@/infrastructure';
import { IUuid } from '@/interfaces';
import { randomUUID } from 'crypto';

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
      expect(uuidService).toBeInstanceOf(UuidService);

      expect(typeof uuidService.generate).toBe('function');
      expect(typeof uuidService.isValid).toBe('function');
    });

    it('should be assignable to i uuid when service created', () => {
      const uuid: IUuid = uuidService;

      expect(uuid).toBeDefined();
      expect(uuid.generate).toBeDefined();
      expect(uuid.isValid).toBeDefined();
    });
  });

  describe('generate() method', () => {
    it('should call crypto random uuid when generate called', () => {
      const expectedUuid = '6f1e2d3c-4b5a-4f6e-9a0b-123456789abc';
      mockRandomUUID.mockReturnValue(expectedUuid);

      const result = uuidService.generate();

      expect(mockRandomUUID).toHaveBeenCalledTimes(1);
      expect(mockRandomUUID).toHaveBeenCalledWith();
      expect(result).toBe(expectedUuid);
    });

    it('should return string when generate called', () => {
      mockRandomUUID.mockReturnValue('6f1e2d3c-4b5a-4f6e-9a0b-123456789abc');

      const result = uuidService.generate();

      expect(typeof result).toBe('string');
    });

    it('should return uuid format when generate called', () => {
      const validUuid = '550e8400-e29b-41d4-a716-446655440000';
      mockRandomUUID.mockReturnValue(validUuid);

      const result = uuidService.generate();

      expect(result).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
    });

    it('should return different values when called multiple times', () => {
      const uuid1 = '6f1e2d3c-4b5a-4f6e-9a0b-123456789abc';
      const uuid2 = '7a2b3c4d-5e6f-4a7b-8c9d-0e1f2a3b4c5d';
      mockRandomUUID.mockReturnValueOnce(uuid1).mockReturnValueOnce(uuid2);

      const result1 = uuidService.generate();
      const result2 = uuidService.generate();

      expect(result1).toBe(uuid1);
      expect(result2).toBe(uuid2);
      expect(result1).not.toBe(result2);
      expect(mockRandomUUID).toHaveBeenCalledTimes(2);
    });

    it('should delegate to node crypto when generate called', () => {
      const expectedUuid = 'f47ac10b-58cc-4372-a567-0e02b2c3d479';
      mockRandomUUID.mockReturnValue(expectedUuid);

      const result = uuidService.generate();

      expect(result).toBe(expectedUuid);
      expect(mockRandomUUID).toHaveBeenCalledWith();
    });

    it('should handle crypto errors when random uuid throws', () => {
      const error = new Error('Crypto not available');
      mockRandomUUID.mockImplementation(() => {
        throw error;
      });

      expect(() => uuidService.generate()).toThrow('Crypto not available');
    });
  });

  describe('isValid() method', () => {
    describe('Valid UUIDs', () => {
      it('should return true when valid v4 uuid provided', () => {
        const validUuids = [
          '6f1e2d3c-4b5a-4f6e-9a0b-123456789abc',
          '550e8400-e29b-41d4-a716-446655440000',
          'f47ac10b-58cc-4372-a567-0e02b2c3d479',
          '6ba7b810-9dad-41d1-80b4-00c04fd430c8',
        ];

        validUuids.forEach(uuid => {
          expect(uuidService.isValid(uuid)).toBe(true);
        });
      });

      it('should return true when uppercase uuid provided', () => {
        const uppercaseUuid = '6F1E2D3C-4B5A-4F6E-9A0B-123456789ABC';

        const result = uuidService.isValid(uppercaseUuid);

        expect(result).toBe(true);
      });

      it('should return true when mixed case uuid provided', () => {
        const mixedCaseUuid = '6f1E2d3C-4B5a-4F6e-9A0b-123456789AbC';

        const result = uuidService.isValid(mixedCaseUuid);

        expect(result).toBe(true);
      });

      it('should return true when version4 with variant8 provided', () => {
        const uuid = '550e8400-e29b-41d4-8716-446655440000';

        const result = uuidService.isValid(uuid);

        expect(result).toBe(true);
      });

      it('should return true when version4 with variant9 provided', () => {
        const uuid = '550e8400-e29b-41d4-9716-446655440000';

        const result = uuidService.isValid(uuid);

        expect(result).toBe(true);
      });

      it('should return true when version4 with variant a provided', () => {
        const uuid = '550e8400-e29b-41d4-a716-446655440000';

        const result = uuidService.isValid(uuid);

        expect(result).toBe(true);
      });

      it('should return true when version4 with variant b provided', () => {
        const uuid = '550e8400-e29b-41d4-b716-446655440000';

        const result = uuidService.isValid(uuid);

        expect(result).toBe(true);
      });
    });

    describe('Invalid UUIDs', () => {
      it('should return false when non string provided', () => {
        const nonStringValues = [null, undefined, 123, true, {}, [], Symbol('uuid')];

        nonStringValues.forEach(value => {
          expect(uuidService.isValid(value as any)).toBe(false);
        });
      });

      it('should return false when empty string provided', () => {
        const result = uuidService.isValid('');

        expect(result).toBe(false);
      });

      it('should return false when invalid format provided', () => {
        const invalidFormats = [
          'not-a-uuid',
          '550e8400e29b41d4a716446655440000',
          '550e8400-e29b-41d4-a716-446655440000-extra',
          '550e8400-e29b-41d4-a716-44665544000',
          '550e8400-e29b-41d4-a716',
          'g50e8400-e29b-41d4-a716-446655440000',
        ];

        invalidFormats.forEach(invalidUuid => {
          expect(uuidService.isValid(invalidUuid)).toBe(false);
        });
      });

      it('should return false when wrong version provided', () => {
        const wrongVersionUuids = [
          '550e8400-e29b-11d1-a716-446655440000',
          '550e8400-e29b-21d1-a716-446655440000',
          '550e8400-e29b-31d1-a716-446655440000',
          '550e8400-e29b-51d1-a716-446655440000',
        ];

        wrongVersionUuids.forEach(uuid => {
          expect(uuidService.isValid(uuid)).toBe(false);
        });
      });

      it('should return false when wrong variant provided', () => {
        const wrongVariantUuids = [
          '550e8400-e29b-41d4-0716-446655440000',
          '550e8400-e29b-41d4-1716-446655440000',
          '550e8400-e29b-41d4-c716-446655440000',
          '550e8400-e29b-41d4-f716-446655440000',
        ];

        wrongVariantUuids.forEach(uuid => {
          expect(uuidService.isValid(uuid)).toBe(false);
        });
      });

      it('should return false when incorrect segment length provided', () => {
        const incorrectLengthUuids = [
          '550e840-e29b-41d4-a716-446655440000',
          '550e84000-e29b-41d4-a716-446655440000',
          '550e8400-e29-41d4-a716-446655440000',
          '550e8400-e29bb-41d4-a716-446655440000',
          '550e8400-e29b-41d-a716-446655440000',
          '550e8400-e29b-41d44-a716-446655440000',
          '550e8400-e29b-41d4-a71-446655440000',
          '550e8400-e29b-41d4-a7166-446655440000',
          '550e8400-e29b-41d4-a716-44665544000',
          '550e8400-e29b-41d4-a716-4466554400000',
        ];

        incorrectLengthUuids.forEach(uuid => {
          expect(uuidService.isValid(uuid)).toBe(false);
        });
      });

      it('should return false when special characters provided', () => {
        const specialCharUuids = [
          '550e8400-e29b-41d4-a716-44665544000@',
          '550e8400-e29b-41d4-a716-44665544000 ',
          ' 550e8400-e29b-41d4-a716-446655440000',
          '550e8400-e29b-41d4-a716-44665544000\n',
          '550e8400-e29b-41d4-a716-44665544000\t',
        ];

        specialCharUuids.forEach(uuid => {
          expect(uuidService.isValid(uuid)).toBe(false);
        });
      });
    });

    describe('Edge Cases', () => {
      it('should return false when null provided', () => {
        const result = uuidService.isValid(null as any);

        expect(result).toBe(false);
      });

      it('should return false when undefined provided', () => {
        const result = uuidService.isValid(undefined as any);

        expect(result).toBe(false);
      });

      it('should handle long strings when very long string provided', () => {
        const longString = 'a'.repeat(1000);

        const result = uuidService.isValid(longString);

        expect(result).toBe(false);
      });

      it('should handle unicode characters when unicode provided', () => {
        const unicodeUuid = '550e8400-e29b-41d4-a716-44665544000🙂';

        const result = uuidService.isValid(unicodeUuid);

        expect(result).toBe(false);
      });
    });
  });

  describe('Static UUID_REGEX', () => {
    it('should have correct pattern when accessing regex', () => {
      const regex = (UuidService as any).UUID_REGEX;

      expect(regex).toBeInstanceOf(RegExp);
      expect(regex.flags).toContain('i');
    });

    it('should match valid uui ds when regex tested', () => {
      const regex = (UuidService as any).UUID_REGEX;
      const validUuid = '6f1e2d3c-4b5a-4f6e-9a0b-123456789abc';

      const result = regex.test(validUuid);

      expect(result).toBe(true);
    });

    it('should reject invalid uui ds when regex tested', () => {
      const regex = (UuidService as any).UUID_REGEX;
      const invalidUuid = 'not-a-uuid';

      const result = regex.test(invalidUuid);

      expect(result).toBe(false);
    });
  });

  describe('Integration with generate()', () => {
    it('should generate valid uui ds when generate and validate together', () => {
      const validUuid: `${string}-${string}-${string}-${string}-${string}` = '6f1e2d3c-4b5a-4f6e-9a0b-123456789abc';
      mockRandomUUID.mockReturnValue(validUuid);

      const generated = uuidService.generate();
      const isValid = uuidService.isValid(generated);

      expect(isValid).toBe(true);
    });

    it('should validate generated uui ds when called multiple times', () => {
      const validUuids: Array<`${string}-${string}-${string}-${string}-${string}`> = [
        '6f1e2d3c-4b5a-4f6e-9a0b-123456789abc',
        '550e8400-e29b-41d4-a716-446655440000',
        'f47ac10b-58cc-4372-a567-0e02b2c3d479',
      ];

      validUuids.forEach(uuid => mockRandomUUID.mockReturnValueOnce(uuid));

      validUuids.forEach(() => {
        const generated = uuidService.generate();
        expect(uuidService.isValid(generated)).toBe(true);
      });
    });
  });

  describe('Performance', () => {
    it('should generate quickly when called many times', () => {
      mockRandomUUID.mockReturnValue('6f1e2d3c-4b5a-4f6e-9a0b-123456789abc' as `${string}-${string}-${string}-${string}-${string}`);
      const iterations = 1000;
      const startTime = Date.now();

      for (let i = 0; i < iterations; i++) {
        uuidService.generate();
      }

      const endTime = Date.now();

      const executionTime = endTime - startTime;
      expect(executionTime).toBeLessThan(100);
      expect(mockRandomUUID).toHaveBeenCalledTimes(iterations);
    });

    it('should validate quickly when called many times', () => {
      const uuid = '6f1e2d3c-4b5a-4f6e-9a0b-123456789abc';
      const iterations = 1000;
      const startTime = Date.now();

      for (let i = 0; i < iterations; i++) {
        uuidService.isValid(uuid);
      }

      const endTime = Date.now();

      const executionTime = endTime - startTime;
      expect(executionTime).toBeLessThan(50);
    });
  });

  describe('Testability and Mocking', () => {
    it('should be mockable when used in tests', () => {
      const mockUuid: IUuid = {
        generate: jest.fn(() => 'mock-uuid'),
        isValid: jest.fn(() => true),
      };

      const generated = mockUuid.generate();
      const isValid = mockUuid.isValid('test-uuid');

      expect(generated).toBe('mock-uuid');
      expect(isValid).toBe(true);
      expect(mockUuid.generate).toHaveBeenCalled();
      expect(mockUuid.isValid).toHaveBeenCalledWith('test-uuid');
    });

    it('should allow predictable testing when crypto mocked', () => {
      const predictableUuid = 'test-uuid-123-456-789';
      mockRandomUUID.mockReturnValue(predictableUuid);

      const result = uuidService.generate();

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
    const uuidService = createUuidService();

    expect(uuidService).toBeInstanceOf(UuidService);
    expect(uuidService).toHaveProperty('generate');
    expect(uuidService).toHaveProperty('isValid');
  });

  it('should return new instance when called multiple times', () => {
    const service1 = createUuidService();
    const service2 = createUuidService();

    expect(service1).not.toBe(service2);
    expect(service1).toBeInstanceOf(UuidService);
    expect(service2).toBeInstanceOf(UuidService);
  });

  it('should return functional service when factory called', () => {
    const mockUuid = '6f1e2d3c-4b5a-4f6e-9a0b-123456789abc';
    (randomUUID as jest.MockedFunction<typeof randomUUID>).mockReturnValue(mockUuid);

    const uuidService = createUuidService();

    expect(typeof uuidService.generate()).toBe('string');
    expect(typeof uuidService.isValid('test')).toBe('boolean');
  });

  it('should be usable in di container when factory provided', () => {
    const mockContainer = {
      registerSingleton: jest.fn(),
    };

    mockContainer.registerSingleton('Uuid', createUuidService);

    expect(mockContainer.registerSingleton).toHaveBeenCalledWith('Uuid', createUuidService);

    const service = createUuidService();
    expect(service).toBeInstanceOf(UuidService);
  });

  it('should produce different instances when factory used in container', () => {
    const factory = createUuidService;

    const service1 = factory();
    const service2 = factory();

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
