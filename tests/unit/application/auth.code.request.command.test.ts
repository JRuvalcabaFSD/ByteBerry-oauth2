import { describe, it, expect } from 'vitest';
import { AuthCodeRequestCommand } from '@application';
import { InvalidRequestError } from '@shared';

describe('AuthCodeRequestCommand', () => {
	describe('fromQuery', () => {
		const validQuery = {
			response_type: 'code',
			client_id: 'test-client-id',
			redirect_uri: 'https://example.com/callback',
			code_challenge: 'E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM',
			code_challenge_method: 'S256',
			scope: 'read write',
			state: 'xyz'
		};

		it('should create command from valid query parameters', () => {
			const command = AuthCodeRequestCommand.fromQuery(validQuery);

			expect(command.client_id).toBe('test-client-id');
			expect(command.response_type).toBe('code');
			expect(command.redirect_uri).toBe('https://example.com/callback');
			expect(command.code_challenge).toBe('E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM');
			expect(command.code_challenge_method).toBe('S256');
			expect(command.scope).toBe('read write');
			expect(command.state).toBe('xyz');
		});

		it('should create command with plain code challenge method', () => {
			const query = {
				...validQuery,
				code_challenge_method: 'plain' as 'plain'
			};

			const command = AuthCodeRequestCommand.fromQuery(query);

			expect(command.code_challenge_method).toBe('plain');
		});

		it('should handle missing optional parameters', () => {
			const query = {
				response_type: 'code',
				client_id: 'test-client-id',
				redirect_uri: 'https://example.com/callback',
				code_challenge: 'E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM',
				code_challenge_method: 'S256'
			};

			const command = AuthCodeRequestCommand.fromQuery(query);

			expect(command.scope).toBeUndefined();
			expect(command.state).toBeUndefined();
		});

		it('should trim scope parameter', () => {
			const query = {
				...validQuery,
				scope: '  read write  '
			};

			const command = AuthCodeRequestCommand.fromQuery(query);

			expect(command.scope).toBe('read write');
		});

		it('should handle empty scope as undefined', () => {
			const query = {
				...validQuery,
				scope: '   '
			};

			const command = AuthCodeRequestCommand.fromQuery(query);

			expect(command.scope).toBeUndefined();
		});

		it('should throw InvalidRequestError for empty query', () => {
			expect(() => AuthCodeRequestCommand.fromQuery({}))
				.toThrow(InvalidRequestError);
			expect(() => AuthCodeRequestCommand.fromQuery({}))
				.toThrow('Missing required parameters');
		});

		it('should throw InvalidRequestError for undefined query', () => {
			expect(() => AuthCodeRequestCommand.fromQuery(undefined as any))
				.toThrow(InvalidRequestError);
		});

		it('should throw InvalidRequestError for invalid response_type', () => {
			const query = { ...validQuery, response_type: 'token' };

			expect(() => AuthCodeRequestCommand.fromQuery(query))
				.toThrow(InvalidRequestError);
			expect(() => AuthCodeRequestCommand.fromQuery(query))
				.toThrow('Only response_type=code is supported');
		});

		it('should throw InvalidRequestError for missing client_id', () => {
			const query = { ...validQuery, client_id: undefined };

			expect(() => AuthCodeRequestCommand.fromQuery(query))
				.toThrow(InvalidRequestError);
			expect(() => AuthCodeRequestCommand.fromQuery(query))
				.toThrow('Client Id is required');
		});

		it('should throw InvalidRequestError for missing redirect_uri', () => {
			const query = { ...validQuery, redirect_uri: undefined };

			expect(() => AuthCodeRequestCommand.fromQuery(query))
				.toThrow(InvalidRequestError);
			expect(() => AuthCodeRequestCommand.fromQuery(query))
				.toThrow('redirect_uri are required (PKCE)');
		});

		it('should throw InvalidRequestError for missing code_challenge', () => {
			const query = { ...validQuery, code_challenge: undefined };

			expect(() => AuthCodeRequestCommand.fromQuery(query))
				.toThrow(InvalidRequestError);
			expect(() => AuthCodeRequestCommand.fromQuery(query))
				.toThrow('code_challenge and code_challenge_method are required (PKCE)');
		});

		it('should throw InvalidRequestError for missing code_challenge_method', () => {
			const query = { ...validQuery, code_challenge_method: undefined };

			expect(() => AuthCodeRequestCommand.fromQuery(query))
				.toThrow(InvalidRequestError);
			expect(() => AuthCodeRequestCommand.fromQuery(query))
				.toThrow('code_challenge and code_challenge_method are required (PKCE)');
		});

		it('should handle state as string properly', () => {
			const query = {
				...validQuery,
				state: 'my-state-123'
			};

			const command = AuthCodeRequestCommand.fromQuery(query);

			expect(command.state).toBe('my-state-123');
		});

		it('should handle non-string state as undefined', () => {
			const query = {
				...validQuery,
				state: 123 as any
			};

			const command = AuthCodeRequestCommand.fromQuery(query);

			expect(command.state).toBeUndefined();
		});
	});
});