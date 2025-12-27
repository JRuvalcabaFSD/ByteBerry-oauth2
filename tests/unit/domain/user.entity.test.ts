import { UserEntity } from '@domain';

describe('UserEntity', () => {
	const validUserProps = {
		id: 'user-123',
		email: 'test@example.com',
		username: 'testuser',
		passwordHash: 'hashed-password',
		fullName: 'Test User',
		roles: ['user'],
		isActive: true,
		emailVerified: false,
		createdAt: new Date('2024-01-01'),
		updatedAt: new Date('2024-01-01'),
	};

	it('should create a valid UserEntity', () => {
		const user = UserEntity.create(validUserProps);

		expect(user.id).toBe(validUserProps.id);
		expect(user.email).toBe('test@example.com');
		expect(user.username).toBe(validUserProps.username);
		expect(user.roles).toEqual(['user']);
		expect(user.isActive).toBe(true);
	});

	it('should check if user has specific role', () => {
		const user = UserEntity.create({ ...validUserProps, roles: ['user', 'admin'] });

		expect(user.hasRole('admin')).toBe(true);
		expect(user.hasRole('superadmin')).toBe(false);
	});

	it('should check if user can login', () => {
		const activeUser = UserEntity.create(validUserProps);
		const inactiveUser = UserEntity.create({ ...validUserProps, isActive: false });

		expect(activeUser.canLogin()).toBe(true);
		expect(inactiveUser.canLogin()).toBe(false);
	});

	it('should return public user without password', () => {
		const user = UserEntity.create(validUserProps);
		const publicUser = user.toPublic();

		expect(publicUser).not.toHaveProperty('passwordHash');
		expect(publicUser).toHaveProperty('email');
		expect(publicUser).toHaveProperty('username');
	});

	it('should normalize email to lowercase', () => {
		const user = UserEntity.create({ ...validUserProps, email: 'TEST@EXAMPLE.COM' });

		expect(user.email).toBe('test@example.com');
	});
});
