/* eslint-disable @typescript-eslint/no-explicit-any */
import { UuidService } from '@infrastructure';

describe('UuidService', () => {
	let uuidService: UuidService;

	beforeEach(() => {
		uuidService = new UuidService();
	});

	describe('generate', () => {
		it('should generate a valid UUID', () => {
			const uuid = uuidService.generate();

			expect(uuid).toBeDefined();
			expect(typeof uuid).toBe('string');
			expect(uuid).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
		});

		it('should generate unique UUIDs', () => {
			const uuid1 = uuidService.generate();
			const uuid2 = uuidService.generate();

			expect(uuid1).not.toBe(uuid2);
		});

		it('should generate version 4 UUID', () => {
			const uuid = uuidService.generate();
			const parts = uuid.split('-');

			// Version 4 has '4' as the first character of the 3rd group
			expect(parts[2][0]).toBe('4');
		});
	});

	describe('isValid', () => {
		it('should return true for valid UUID', () => {
			const validUuid = uuidService.generate();

			expect(uuidService.isValid(validUuid)).toBe(true);
		});

		it('should return true for valid UUID v4 format', () => {
			const validUuid = '123e4567-e89b-42d3-a456-426614174000';

			expect(uuidService.isValid(validUuid)).toBe(true);
		});

		it('should return false for invalid UUID format', () => {
			const invalidUuids = ['invalid-uuid', '123e4567-e89b-12d3-a456', '123e4567e89b12d3a456426614174000', '', 'not-a-uuid-at-all'];

			invalidUuids.forEach((uuid) => {
				expect(uuidService.isValid(uuid)).toBe(false);
			});
		});

		it('should return false for non-string input', () => {
			expect(uuidService.isValid(123 as any)).toBe(false);
			expect(uuidService.isValid(null as any)).toBe(false);
			expect(uuidService.isValid(undefined as any)).toBe(false);
		});

		it('should return false for UUID with wrong version', () => {
			const wrongVersion = '123e4567-e89b-32d3-a456-426614174000'; // version 3 instead of 4

			expect(uuidService.isValid(wrongVersion)).toBe(false);
		});
	});
});
