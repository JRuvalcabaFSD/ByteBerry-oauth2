import { OAuthClientEntity } from '@domain';
import { IOAuthClientRepository } from '@interfaces';

const MOCK_CLIENTS = [
	OAuthClientEntity.create({
		id: '6c81a0e4-c1c0-4fe5-8704-8dcd8e43e608',
		clientId: 'postman-123',
		clientSecret: 'super-secret',
		clientName: 'My Awesome App',
		redirectUris: ['http://localhost:5173/callback', 'https://myapp.com/callback'],
		grantTypes: ['authorization_code', 'refresh_token'],
		isPublic: false,
	}),
	OAuthClientEntity.create({
		id: '88c49124-8e8a-4391-8489-ae5576ac8722',
		clientId: 'postman-1234',
		clientSecret: null,
		clientName: 'PKCE Mobile App',
		redirectUris: ['myapp://callback'],
		grantTypes: ['authorization_code'],
		isPublic: true,
	}),
];

export class InMemoryOAuthClientRepository implements IOAuthClientRepository {
	public async findByClientId(clientId: string): Promise<OAuthClientEntity | null> {
		return MOCK_CLIENTS.find((c) => c.clientId === clientId) ?? null;
	}
}
