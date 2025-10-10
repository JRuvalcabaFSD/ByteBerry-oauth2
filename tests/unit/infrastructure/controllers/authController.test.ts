import { Request, Response } from 'express';

import { AuthController } from '@/infrastructure/controller/auth.controller';
import { ILogger, IUuid } from '@/interfaces';
import { BadRequestError } from '@/shared/errors/http.errors';
import { GenerateAuthorizationCodeUseCase } from '@/application';

describe('AuthController', () => {
  let authController: AuthController;
  let mockLogger: ILogger;
  let generateCode: GenerateAuthorizationCodeUseCase;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;

  beforeEach(() => {
    mockLogger = {
      info: jest.fn(),
      child: jest.fn(),
      debug: jest.fn(),
      error: jest.fn(),
      log: jest.fn(),
      warn: jest.fn(),
    };

    generateCode = jest.fn();

    authController = new AuthController(mockLogger);

    mockRequest = {
      headers: {
        'x-request-id': 'test-request-id',
      },
      query: {},
      body: {},
    } as unknown as Request;

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      setHeader: jest.fn().mockReturnThis(),
    } as unknown as Response;
  });

  describe('authorize', () => {
    it('should generate authorization code with valid parameters', async () => {
      mockRequest.query = {
        response_type: 'code',
        client_id: 'test-client',
        redirect_uri: 'http://localhost:3000/callback',
        state: 'test-state',
      };

      await authController.authorize(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          code: expect.stringContaining('mock_authorization_code_'),
          state: 'test-state',
        })
      );
      expect(mockLogger.info).toHaveBeenCalledWith('Authorization request received', expect.any(Object));
    });

    it('should accept PKCE parameters', async () => {
      mockRequest.query = {
        response_type: 'code',
        client_id: 'test-client',
        redirect_uri: 'http://localhost:3000/callback',
        code_challenge: 'test-challenge',
        code_challenge_method: 'S256',
      };

      await authController.authorize(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockLogger.info).toHaveBeenCalledWith(
        'Authorization code generated',
        expect.objectContaining({
          hasPkce: true,
        })
      );
    });
    it('should throw BadRequestError when response_type is missing', async () => {
      mockRequest.query = {
        client_id: 'test-client',
        redirect_uri: 'http://localhost:3000/callback',
      };

      await expect(authController.authorize(mockRequest as Request, mockResponse as Response)).rejects.toThrow(BadRequestError);
      await expect(authController.authorize(mockRequest as Request, mockResponse as Response)).rejects.toThrow(
        'Missing required parameter: response_type'
      );
    });
    it('should throw BadRequestError when response_type is not "code"', async () => {
      mockRequest.query = {
        response_type: 'token',
        client_id: 'test-client',
        redirect_uri: 'http://localhost:3000/callback',
      };

      await expect(authController.authorize(mockRequest as Request, mockResponse as Response)).rejects.toThrow(
        'Invalid response_type. Must be "code"'
      );
    });
    it('should throw BadRequestError when client_id is missing', async () => {
      mockRequest.query = {
        response_type: 'code',
        redirect_uri: 'http://localhost:3000/callback',
      };

      await expect(authController.authorize(mockRequest as Request, mockResponse as Response)).rejects.toThrow(
        'Missing required parameter: client_id'
      );
    });
    it('should throw BadRequestError when redirect_uri is missing', async () => {
      mockRequest.query = {
        response_type: 'code',
        client_id: 'test-client',
      };

      await expect(authController.authorize(mockRequest as Request, mockResponse as Response)).rejects.toThrow(
        'Missing required parameter: redirect_uri'
      );
    });
    it('should throw BadRequestError when code_challenge provided without method', async () => {
      mockRequest.query = {
        response_type: 'code',
        client_id: 'test-client',
        redirect_uri: 'http://localhost:3000/callback',
        code_challenge: 'test-challenge',
      };

      await expect(authController.authorize(mockRequest as Request, mockResponse as Response)).rejects.toThrow(
        'code_challenge_method is required when code_challenge is provided'
      );
    });
    it('should throw BadRequestError when code_challenge_method is invalid', async () => {
      mockRequest.query = {
        response_type: 'code',
        client_id: 'test-client',
        redirect_uri: 'http://localhost:3000/callback',
        code_challenge: 'test-challenge',
        code_challenge_method: 'MD5',
      };

      await expect(authController.authorize(mockRequest as Request, mockResponse as Response)).rejects.toThrow(
        'Invalid code_challenge_method. Must be "S256" or "plain"'
      );
    });
    describe('token', () => {
      it('should issue access token with valid parameters', async () => {
        mockRequest.body = {
          grant_type: 'authorization_code',
          code: 'test-auth-code',
          redirect_uri: 'http://localhost:3000/callback',
          client_id: 'test-client',
        };

        await authController.token(mockRequest as Request, mockResponse as Response);

        expect(mockResponse.status).toHaveBeenCalledWith(200);
        expect(mockResponse.json).toHaveBeenCalledWith(
          expect.objectContaining({
            access_token: expect.stringContaining('mock_jwt_token_'),
            token_type: 'Bearer',
            expires_in: 900,
          })
        );
        expect(mockLogger.info).toHaveBeenCalledWith('Token request received', expect.any(Object));
      });
      it('should accept code_verifier parameter', async () => {
        mockRequest.body = {
          grant_type: 'authorization_code',
          code: 'test-auth-code',
          redirect_uri: 'http://localhost:3000/callback',
          client_id: 'test-client',
          code_verifier: 'test-verifier',
        };

        // Act
        await authController.token(mockRequest as Request, mockResponse as Response);

        // Assert
        expect(mockResponse.status).toHaveBeenCalledWith(200);
      });
      it('should throw BadRequestError when grant_type is missing', async () => {
        // Arrange
        mockRequest.body = {
          code: 'test-auth-code',
          redirect_uri: 'http://localhost:3000/callback',
          client_id: 'test-client',
        };

        // Act & Assert
        await expect(authController.token(mockRequest as Request, mockResponse as Response)).rejects.toThrow(
          'Missing required parameter: grant_type'
        );
      });

      it('should throw BadRequestError when grant_type is not "authorization_code"', async () => {
        // Arrange
        mockRequest.body = {
          grant_type: 'refresh_token',
          code: 'test-auth-code',
          redirect_uri: 'http://localhost:3000/callback',
          client_id: 'test-client',
        };

        // Act & Assert
        await expect(authController.token(mockRequest as Request, mockResponse as Response)).rejects.toThrow(
          'Invalid grant_type. Must be "authorization_code"'
        );
      });

      it('should throw BadRequestError when code is missing', async () => {
        // Arrange
        mockRequest.body = {
          grant_type: 'authorization_code',
          redirect_uri: 'http://localhost:3000/callback',
          client_id: 'test-client',
        };

        // Act & Assert
        await expect(authController.token(mockRequest as Request, mockResponse as Response)).rejects.toThrow(
          'Missing required parameter: code'
        );
      });
    });
  });

  describe('jwks()', () => {
    it('should return JWKS with public key', async () => {
      // Act
      await authController.jwks(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.setHeader).toHaveBeenCalledWith('Cache-Control', 'public, max-age=3600');
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          keys: expect.arrayContaining([
            expect.objectContaining({
              kty: 'RSA',
              use: 'sig',
              alg: 'RS256',
              kid: expect.any(String),
              n: expect.any(String),
              e: 'AQAB',
            }),
          ]),
        })
      );
      expect(mockLogger.info).toHaveBeenCalledWith('JWKS request received', expect.any(Object));
    });

    it('should set cache control headers', async () => {
      // Act
      await authController.jwks(mockRequest as Request, mockResponse as Response);

      // Assert
      expect(mockResponse.setHeader).toHaveBeenCalledWith('Cache-Control', 'public, max-age=3600');
    });
  });
});
