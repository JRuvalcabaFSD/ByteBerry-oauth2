import { ClientIdVO } from '@domain';
import { ValueObjectError } from '@domain';

describe('ClientIdVO', () => {
	it('should create valid ClientIdVO', () => {
		const clientId = ClientIdVO.create('valid-client-id-123');

		expect(clientId.getValue()).toBe('valid-client-id-123');
	});

	it('should throw error for empty client ID', () => {
		expect(() => ClientIdVO.create('')).toThrow(ValueObjectError);
		expect(() => ClientIdVO.create('   ')).toThrow(ValueObjectError);
	});

	it('should throw error for client ID too short', () => {
		expect(() => ClientIdVO.create('short')).toThrow(ValueObjectError);
	});

	it('should throw error for client ID too long', () => {
		const longId = 'a'.repeat(129);
		expect(() => ClientIdVO.create(longId)).toThrow(ValueObjectError);
	});

	it('should compare two ClientIdVO for equality', () => {
		const clientId1 = ClientIdVO.create('same-client-id');
		const clientId2 = ClientIdVO.create('same-client-id');
		const clientId3 = ClientIdVO.create('different-client-id');

		expect(clientId1.equals(clientId2)).toBe(true);
		expect(clientId1.equals(clientId3)).toBe(false);
	});
});
