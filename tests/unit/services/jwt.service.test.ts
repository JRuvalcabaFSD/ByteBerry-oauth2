import { JwtService } from '@infrastructure';
import type { IConfig, IKeyLoader, ILogger } from '@interfaces';
import { InvalidTokenError } from '@shared';

describe('JwtService', () => {
	let config: IConfig;
	let keyLoader: IKeyLoader;
	let logger: ILogger;
	let service: JwtService;

	const mockPrivateKey = `-----BEGIN PRIVATE KEY-----
MIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDEdFDVZoZyhfb9
Okw6IvdeVnIbHL4/l/QJrayNMA6G/10fRPyzzwnAdg3KFUInkhAtn2055De4La5G
vqxBGp5GVp6r+J6rEgYTWynNyYPCn15bThLxc45HC4npLxwuR6fOI/PvBUH9gW2Q
4nn/i18XKo4NbdvfCpjgTt6rY969ZYu54huDKJ68NtauxN+FPUky8HIg7NP0gEp5
m2YFozbtrx2PuN9rusDxmQyHXX9v8aCKOOYWrSZtka71gMlE9d2cHRT3hTZZ3uS6
h+QIw1ZzIjpJ1xFdy3ZqftB2ncx3m4SuDpDQXrfI+/e29y4Fo54L5IbBMQ3n1S/I
DJuaLlqxAgMBAAECggEALBk9FO4nA3mpbAYEWu+C7jkC862T0jQiqnKDH41YUXrs
tSp3/EffFUYaydBUUYwi2A7nxp1BWbVdX9GI2rNmMH1csFdGjLmmxf0KiQBxdIRw
OpgvveX12+JN8ptp3MSmeSpOZUrdmZGOXf3Mq22mao2Zpg+RUcOv9fgWWUw5kXNf
UadLkS1q9foZb3sRlMjTK66GHqqvBKxqGhoRTRx37KN8iC2D+oOe38yTKEMotFVL
6kFu0kV2eFh3RsqyqBcAUDTtT2xhK6yZLG/HzfQ+FP3+MitEy1E3vWTqUtnOdYid
VJyCNSFZvT9ldXrtDw2/HK2BpTbLyZoiY2wnATLdjQKBgQDvR9xRIRL2yJj1EnkW
yNpX9efr7YIFZ4nlM7AunpGDbtc+0xHs7JyOCwl0EGw/DuQq3fx1P66t+CvZ9ETK
c7XCfL+5zIgvD5ZwdTR7wxJE4Y/N7gGwgtcwTVXddfOjhcdc58Hzcxre7KwimqYF
qyRQvr4VQpjXRjLXnTm3TterZQKBgQDSLmXYBI9IUGJE5O0UNH1trW+UinR5fm3O
JfHW5PGRghlRrSIl8I2gvKQoB/L85Umly9BkgdfCvsXfvLYiVEKk2CB4yKX72hyW
V7YhoWkcuBFE8g3JUxhPy8UOPYDAbcQu2mfDsYFhsUDinLIBfdtA9MqOmE1cNSmP
SlVHfHzLXQKBgCulHeimccEV4eCB2Bhx1nHI5t6/2cGGmz51aSN3xO8GXriU42Yl
2oCGPtkuza/K1Y+EIjJ4xTHyXH1K8ulCpdqtyoLnbce3vicRGduhP0nVItfbG+/I
Tdv/nzPf+erP0gd+NoBjdHlJDjTZpILQLrWTtTRHi31ozolJomdvOCOJAoGBAJbF
OcFv4+iX4SZSoc6wqJkYpMYFW/AbRWFvzr+8k50xmkAA1lIo8S+wooEk0qWfROlt
/xtaGRBWEVOh53VQxE3Dy+dY59h2abNfUANn6iLz10+B42nb9cCoB79jVwyysNx7
R5wVpR4TLNxiUz7GrZU3BGat0jCm4h0r0WjqYArxAoGBAK/q1e5AhuN7ukMyO7jX
jP62TC9DpfzbFdFAv3GnWaPp1tsH8Jz272KSQogCqbIJKWwhDuYeiZL/p/rmOR8w
JHiiUtZok1oDGdFI0C9n1RNfs+mchbRTOJXpgmYNaodekbgcsm7XqMJSxw6A9GFq
C91BjdukJEsWvF8d/u1TC459
-----END PRIVATE KEY-----`;

	const mockPublicKey = `-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAxHRQ1WaGcoX2/TpMOiL3
XlZyGxy+P5f0Ca2sjTAOhv9dH0T8s88JwHYNyhVCJ5IQLZ9tOeQ3uC2uRr6sQRqe
Rlaeq/ieqxIGE1spzcmDwp9eW04S8XOORwuJ6S8cLkenziPz7wVB/YFtkOJ5/4tf
FyqODW3b3wqY4E7eq2PevWWLueIbgyievDbWrsTfhT1JMvByIOzT9IBKeZtmBaM2
7a8dj7jfa7rA8ZkMh11/b/GgijjmFq0mbZGu9YDJRPXdnB0U94U2Wd7kuofkCMNW
cyI6SdcRXct2an7Qdp3Md5uErg6Q0F63yPv3tvcuBaOeC+SGwTEN59UvyAybmi5a
sQIDAQAB
-----END PUBLIC KEY-----`;

	beforeEach(() => {
		config = {
			nodeEnv: 'test',
			port: 4000,
			version: '1.0.0',
			serviceName: 'oauth2',
			logLevel: 'error',
			logRequests: false,
			corsOrigins: [],
			serviceUrl: 'http://localhost:4000',
			authCodeExpiresInMinutes: 5,
			authorizationEndpoint: '/auth',
			jwtIssuer: 'byteberry-oauth2',
			jwtAudience: ['byteberry-api'],
			jwtAccessTokenExpiresIn: 900,
			jwksEndpoint: '/.well-known/jwks.json',
			jwtKeyId: 'key-1',
			pkceMethods: ['S256', 'plain'],
			pkceRequired: true,
			tokenEndpoint: '/token',
			isDevelopment: () => false,
			isProduction: () => false,
			isTest: () => true,
			getSummary: () => ({}),
		};

		keyLoader = {
			getPrivateKey: vi.fn().mockReturnValue(mockPrivateKey),
			getPublicKey: vi.fn().mockReturnValue(mockPublicKey),
			getKeyId: vi.fn().mockReturnValue('key-1'),
		};

		logger = {
			debug: vi.fn(),
			info: vi.fn(),
			warn: vi.fn(),
			error: vi.fn(),
			log: vi.fn(),
			child: vi.fn(),
		};

		service = new JwtService(config, keyLoader, logger);
	});

	it('should generate valid access token', () => {
		const payload = {
			sub: 'user-123',
			email: 'test@example.com',
			username: 'testuser',
			roles: ['user'],
			scope: 'read write',
			client_id: 'client-123',
		};

		const token = service.generateAccessToken(payload);

		expect(token).toBeDefined();
		expect(typeof token).toBe('string');
		expect(token.split('.')).toHaveLength(3); // JWT format: header.payload.signature
	});

	it('should verify valid token successfully', () => {
		const payload = {
			sub: 'user-123',
			email: 'test@example.com',
			username: 'testuser',
			roles: ['user'],
			scope: 'read write',
			client_id: 'client-123',
		};

		const token = service.generateAccessToken(payload);
		const decoded = service.verifyToken(token);

		expect(decoded.sub).toBe('user-123');
		expect(decoded.email).toBe('test@example.com');
		expect(decoded.iss).toBe('byteberry-oauth2');
	});

	it('should throw error for invalid signature', () => {
		const invalidToken = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyLTEyMyJ9.invalid-signature';

		expect(() => service.verifyToken(invalidToken)).toThrow(InvalidTokenError);
	});

	it('should decode token without verification', () => {
		const payload = {
			sub: 'user-123',
			email: 'test@example.com',
			username: 'testuser',
			roles: ['user'],
			scope: 'read write',
			client_id: 'client-123',
		};

		const token = service.generateAccessToken(payload);
		const decoded = service.decodeToken(token);

		expect(decoded).not.toBeNull();
		expect(decoded?.sub).toBe('user-123');
		expect(decoded?.email).toBe('test@example.com');
	});

	it('should validate audience when provided', () => {
		const payload = {
			sub: 'user-123',
			email: 'test@example.com',
			username: 'testuser',
			roles: ['user'],
			scope: 'read write',
			client_id: 'client-123',
		};

		const token = service.generateAccessToken(payload);

		// Should succeed with correct audience
		expect(() => service.verifyToken(token, 'byteberry-api')).not.toThrow();

		// Should fail with wrong audience
		expect(() => service.verifyToken(token, 'wrong-audience')).toThrow(InvalidTokenError);
	});
});
