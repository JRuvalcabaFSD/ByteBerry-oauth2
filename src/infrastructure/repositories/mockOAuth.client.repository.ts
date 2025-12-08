import { OAuthClientEntity } from '@domain';
import { IOAthClientRepository } from '@interfaces';

const MOCK_CLIENTS = [
	OAuthClientEntity.create({
		id: '6c81a0e4-c1c0-4fe5-8704-8dcd8e43e608',
		clientId: 'postman-123',
		clientSecret: 'super-secret',
		clientName: 'My Awesome App',
		redirectUris: ['http://localhost:3000/callback', 'https://myapp.com/callback'],
		grandTypes: ['authorization_code', 'refresh_token'],
		isPublic: false,
	}),
	OAuthClientEntity.create({
		id: '88c49124-8e8a-4391-8489-ae5576ac8722',
		clientId: 'postman-1234',
		clientSecret: null,
		clientName: 'PKCE Mobile App',
		redirectUris: ['myapp://callback'],
		grandTypes: ['authorization_code'],
		isPublic: true,
	}),
];

export class MockOAuthClientRepository implements IOAthClientRepository {
	public async findByClientId(clientId: string): Promise<OAuthClientEntity | null> {
		return MOCK_CLIENTS.find((c) => c.clientId === clientId) ?? null;
	}
}
