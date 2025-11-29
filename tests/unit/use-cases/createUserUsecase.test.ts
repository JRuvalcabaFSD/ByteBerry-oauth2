import { CreateUserUseCase } from '@/application';
import { UserEntity } from '@/domain';
import { IUserRepository, ILogger, IUuid } from '@/interfaces';
import { InvalidRequestError } from '@/shared';
import * as bcrypt from 'bcrypt';

// Mock bcrypt
jest.mock('bcrypt');
const mockedBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;

describe('CreateUserUseCase', () => {
  let useCase: CreateUserUseCase;
  let mockRepository: jest.Mocked<IUserRepository>;
  let mockLogger: jest.Mocked<ILogger>;
  let mockUuid: jest.Mocked<IUuid>;

  beforeEach(() => {
    // Mock repository
    mockRepository = {
      register: jest.fn(),
      findByEmail: jest.fn(),
      findById: jest.fn(),
      authenticate: jest.fn(),
    };

    // Mock logger
    mockLogger = {
      debug: jest.fn(),
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
    } as any;

    // Mock uuid
    mockUuid = {
      generate: jest.fn().mockReturnValue('generated-uuid-123'),
    } as unknown as jest.Mocked<IUuid>;

    useCase = new CreateUserUseCase(mockRepository, mockLogger, mockUuid);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('execute()', () => {
    it('should create user with email and password', async () => {
      // Arrange
      const request = {
        email: 'newuser@example.com',
        password: 'securePassword123',
      };

      mockRepository.findByEmail.mockResolvedValue(null);
      mockedBcrypt.hash.mockResolvedValue('hashed_password' as never);

      // Act
      const result = await useCase.execute(request);

      // Assert
      expect(result).toEqual({
        userId: 'generated-uuid-123',
        email: 'newuser@example.com',
        username: null,
        createdAt: expect.any(String),
      });
      expect(mockRepository.findByEmail).toHaveBeenCalledWith('newuser@example.com');
      expect(mockedBcrypt.hash).toHaveBeenCalledWith('securePassword123', 10);
      expect(mockRepository.register).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'generated-uuid-123',
          email: 'newuser@example.com',
          username: null,
        })
      );
      expect(mockLogger.debug).toHaveBeenCalledWith('[CreateUserUseCase.execute] Creating new user', { email: 'newuser@example.com' });
      expect(mockLogger.debug).toHaveBeenCalledWith('[CreateUserUseCase.execute] User created successfully', {
        userId: 'generated-uuid-123',
        email: 'newuser@example.com',
      });
    });

    it('should create user with email, password, and username', async () => {
      // Arrange
      const request = {
        email: 'newuser@example.com',
        password: 'securePassword123',
        username: 'newuser',
      };

      mockRepository.findByEmail.mockResolvedValue(null);
      mockedBcrypt.hash.mockResolvedValue('hashed_password' as never);

      // Act
      const result = await useCase.execute(request);

      // Assert
      expect(result).toEqual({
        userId: 'generated-uuid-123',
        email: 'newuser@example.com',
        username: 'newuser',
        createdAt: expect.any(String),
      });
      expect(mockRepository.register).toHaveBeenCalledWith(
        expect.objectContaining({
          username: 'newuser',
        })
      );
    });

    it('should throw InvalidRequestError when email is missing', async () => {
      // Arrange
      const request = {
        email: '',
        password: 'securePassword123',
      };

      // Act & Assert
      await expect(useCase.execute(request)).rejects.toThrow(InvalidRequestError);
      await expect(useCase.execute(request)).rejects.toThrow('Email and password are required');
      expect(mockRepository.findByEmail).not.toHaveBeenCalled();
      expect(mockRepository.register).not.toHaveBeenCalled();
    });

    it('should throw InvalidRequestError when password is missing', async () => {
      // Arrange
      const request = {
        email: 'newuser@example.com',
        password: '',
      };

      // Act & Assert
      await expect(useCase.execute(request)).rejects.toThrow(InvalidRequestError);
      await expect(useCase.execute(request)).rejects.toThrow('Email and password are required');
      expect(mockRepository.findByEmail).not.toHaveBeenCalled();
      expect(mockRepository.register).not.toHaveBeenCalled();
    });

    it('should throw InvalidRequestError when user already exists', async () => {
      // Arrange
      const request = {
        email: 'existing@example.com',
        password: 'securePassword123',
      };

      const existingUser = UserEntity.create({
        id: 'existing-user-123',
        email: 'existing@example.com',
        passwordHash: 'hashed',
      });

      mockRepository.findByEmail.mockResolvedValue(existingUser);

      // Act & Assert
      await expect(useCase.execute(request)).rejects.toThrow(InvalidRequestError);
      await expect(useCase.execute(request)).rejects.toThrow('User with this email already exists');
      expect(mockRepository.findByEmail).toHaveBeenCalledWith('existing@example.com');
      expect(mockRepository.register).not.toHaveBeenCalled();
    });

    it('should hash password with bcrypt using cost factor 10', async () => {
      // Arrange
      const request = {
        email: 'newuser@example.com',
        password: 'myPassword',
      };

      mockRepository.findByEmail.mockResolvedValue(null);
      mockedBcrypt.hash.mockResolvedValue('hashed_myPassword' as never);

      // Act
      await useCase.execute(request);

      // Assert
      expect(mockedBcrypt.hash).toHaveBeenCalledWith('myPassword', 10);
    });

    it('should return ISO 8601 formatted createdAt timestamp', async () => {
      // Arrange
      const request = {
        email: 'newuser@example.com',
        password: 'securePassword123',
      };

      mockRepository.findByEmail.mockResolvedValue(null);
      mockedBcrypt.hash.mockResolvedValue('hashed_password' as never);

      // Act
      const result = await useCase.execute(request);

      // Assert
      expect(result.createdAt).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
      const parsedDate = new Date(result.createdAt);
      expect(parsedDate).toBeInstanceOf(Date);
      expect(parsedDate.toISOString()).toBe(result.createdAt);
    });

    it('should log error and rethrow when repository throws unexpected error', async () => {
      // Arrange
      const request = {
        email: 'newuser@example.com',
        password: 'securePassword123',
      };

      mockRepository.findByEmail.mockResolvedValue(null);
      mockedBcrypt.hash.mockResolvedValue('hashed_password' as never);

      const unexpectedError = new Error('Database connection failed');
      mockRepository.register.mockRejectedValue(unexpectedError);

      // Act & Assert
      await expect(useCase.execute(request)).rejects.toThrow('Database connection failed');
      expect(mockLogger.error).toHaveBeenCalledWith('[CreateUserUseCase.execute] Unexpected error creating user', {
        error: 'Database connection failed',
        email: 'newuser@example.com',
      });
    });

    it('should not log error when throwing InvalidRequestError', async () => {
      // Arrange
      const request = {
        email: 'existing@example.com',
        password: 'securePassword123',
      };

      const existingUser = UserEntity.create({
        id: 'existing-user-123',
        email: 'existing@example.com',
        passwordHash: 'hashed',
      });

      mockRepository.findByEmail.mockResolvedValue(existingUser);

      // Act & Assert
      await expect(useCase.execute(request)).rejects.toThrow(InvalidRequestError);
      expect(mockLogger.error).not.toHaveBeenCalled();
    });
  });
});
