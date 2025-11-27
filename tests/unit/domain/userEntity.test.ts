import { UserEntity } from '@/domain';

describe('UserEntity', () => {
  describe('create()', () => {
    it('should create user with all required fields', () => {
      // Arrange & Act
      const user = UserEntity.create({
        id: 'user-123',
        email: 'test@example.com',
        username: 'testuser',
        passwordHash: 'hashed_password',
      });

      // Assert
      expect(user.id).toBe('user-123');
      expect(user.email).toBe('test@example.com');
      expect(user.username).toBe('testuser');
      expect(user.passwordHash).toBe('hashed_password');
      expect(user.createdAt).toBeInstanceOf(Date);
    });

    it('should create user without optional fields', () => {
      // Arrange & Act
      const user = UserEntity.create({
        id: 'user-123',
        email: 'test@example.com',
      });

      // Assert
      expect(user.id).toBe('user-123');
      expect(user.email).toBe('test@example.com');
      expect(user.username).toBeNull();
      expect(user.passwordHash).toBeNull();
    });

    it('should set default createdAt if not provided', () => {
      // Arrange
      const beforeCreate = new Date();

      // Act
      const user = UserEntity.create({
        id: 'user-123',
        email: 'test@example.com',
      });

      // Assert
      const afterCreate = new Date();
      expect(user.createdAt.getTime()).toBeGreaterThanOrEqual(beforeCreate.getTime());
      expect(user.createdAt.getTime()).toBeLessThanOrEqual(afterCreate.getTime());
    });

    it('should use provided createdAt', () => {
      // Arrange
      const customDate = new Date('2024-01-01');

      // Act
      const user = UserEntity.create({
        id: 'user-123',
        email: 'test@example.com',
        createdAt: customDate,
      });

      // Assert
      expect(user.createdAt).toBe(customDate);
    });
  });

  describe('getPasswordHash()', () => {
    it('should return password hash when set', () => {
      // Arrange
      const user = UserEntity.create({
        id: 'user-123',
        email: 'test@example.com',
        passwordHash: 'hashed_password',
      });

      // Act
      const hash = user.getPasswordHash();

      // Assert
      expect(hash).toBe('hashed_password');
    });

    it('should return null when password not set', () => {
      // Arrange
      const user = UserEntity.create({
        id: 'user-123',
        email: 'test@example.com',
      });

      // Act
      const hash = user.getPasswordHash();

      // Assert
      expect(hash).toBeNull();
    });
  });

  describe('hasPassword()', () => {
    it('should return true when password is set', () => {
      // Arrange
      const user = UserEntity.create({
        id: 'user-123',
        email: 'test@example.com',
        passwordHash: 'hashed_password',
      });

      // Act & Assert
      expect(user.hasPassword()).toBe(true);
    });

    it('should return false when password is not set', () => {
      // Arrange
      const user = UserEntity.create({
        id: 'user-123',
        email: 'test@example.com',
      });

      // Act & Assert
      expect(user.hasPassword()).toBe(false);
    });

    it('should return false when password is null', () => {
      // Arrange
      const user = UserEntity.create({
        id: 'user-123',
        email: 'test@example.com',
        passwordHash: null,
      });

      // Act & Assert
      expect(user.hasPassword()).toBe(false);
    });
  });
});
