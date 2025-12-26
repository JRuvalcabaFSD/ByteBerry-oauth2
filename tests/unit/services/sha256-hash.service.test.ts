import { NodeHashService } from '@infrastructure';

describe('NodeHashService', () => {
	let service: NodeHashService;

	beforeEach(() => {
		service = new NodeHashService();
	});

	it('should verify matching SHA256 hash', () => {
		const value = 'test-value';
		const hash = 'WxQG__yd5VN-s1qEXJlSHyb7oOdy1YtC4J9CIbngQ64'; // SHA256 of 'test-value' in base64url

		const result = service.verifySha256(value, hash);

		expect(result).toBe(true);
	});

	it('should return false for non-matching hash', () => {
		const value = 'test-value';
		const wrongHash = 'wrongHashValue123456789012345678901234';

		const result = service.verifySha256(value, wrongHash);

		expect(result).toBe(false);
	});

	it('should handle empty string', () => {
		const value = '';
		const hash = '47DEQpj8HBSa-_TImW-5JCeuQeRkm5NMpJWZG3hSuFU'; // SHA256 of empty string in base64url

		const result = service.verifySha256(value, hash);

		expect(result).toBe(true);
	});

	it('should be case sensitive', () => {
		const value1 = 'Test';
		const value2 = 'test';
		const hash1 = 'Uy6qvZV0iA2_drm4zACDLCCm7BE9aCKZVQ16bg80XiU'; // SHA256 de 'Test' en base64url

		const result1 = service.verifySha256(value1, hash1);
		const result2 = service.verifySha256(value2, hash1);

		expect(result1).not.toBe(result2);
	});
});
