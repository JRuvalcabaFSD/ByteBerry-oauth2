import { describe, it, expect } from 'vitest';
import { TokenRequestCommand } from '@application';
import { InvalidRequestError } from '@shared';

describe('TokenRequestCommand', () => {
	describe('fromQuery', () => {
		const validQuery = {
			grant_type: 'authorization_code',
			code: 'abc123',
			redirect_uri: 'https://example.com/callback',
			client_id: 'client123',
			code_verifier: 'verifier456'
		};

		it('should create command from valid query parameters', () => {
			const command = TokenRequestCommand.fromQuery(validQuery);

			expect(command.grant_type).toBe('authorization_code');
			expect(command.code).toBe('abc123');
			expect(command.redirect_uri).toBe('https://example.com/callback');
			expect(command.client_id).toBe('client123');
			expect(command.code_verifier).toBe('verifier456');
		});

		it('should throw InvalidRequestError for empty query', () => {
			expect(() => TokenRequestCommand.fromQuery({}))
				.toThrow(InvalidRequestError);
			expect(() => TokenRequestCommand.fromQuery({}))
				.toThrow('Missing required parameters');
		});

		it('should throw InvalidRequestError for undefined query', () => {
			expect(() => TokenRequestCommand.fromQuery(undefined as any))
				.toThrow(InvalidRequestError);
		});

		it('should throw InvalidRequestError for missing client_id', () => {
			const query = { ...validQuery, client_id: undefined };

			expect(() => TokenRequestCommand.fromQuery(query))
				.toThrow(InvalidRequestError);
			expect(() => TokenRequestCommand.fromQuery(query))
				.toThrow('Client Id is required');
		});

		it('should throw InvalidRequestError for missing code', () => {
			const query = { ...validQuery, code: undefined };

			expect(() => TokenRequestCommand.fromQuery(query))
				.toThrow(InvalidRequestError);
			expect(() => TokenRequestCommand.fromQuery(query))
				.toThrow('code are required (PKCE)');
		});

		it('should throw InvalidRequestError for missing code_verifier', () => {
			const query = { ...validQuery, code_verifier: undefined };

			expect(() => TokenRequestCommand.fromQuery(query))
				.toThrow(InvalidRequestError);
			expect(() => TokenRequestCommand.fromQuery(query))
				.toThrow('code_verifier are required (PKCE)');
		});

		it('should throw InvalidRequestError for invalid grant_type', () => {
			const query = { ...validQuery, grant_type: 'client_credentials' };

			expect(() => TokenRequestCommand.fromQuery(query))
				.toThrow(InvalidRequestError);
			expect(() => TokenRequestCommand.fromQuery(query))
				.toThrow('Only authorization_code grant type is supported');
		});

		it('should handle empty string parameters', () => {
			const query = {
				...validQuery,
				code: ''
			};

			expect(() => TokenRequestCommand.fromQuery(query))
				.toThrow(InvalidRequestError);
		});

		it('should create command with minimal valid parameters', () => {
			const query = {
				grant_type: 'authorization_code',
				code: 'test-code',
				client_id: 'test-client',
				code_verifier: 'test-verifier',
				redirect_uri: 'https://test.com'
			};

			const command = TokenRequestCommand.fromQuery(query);

			expect(command).toBeDefined();
			expect(command.code).toBe('test-code');
			expect(command.client_id).toBe('test-client');
		});
	});
});
