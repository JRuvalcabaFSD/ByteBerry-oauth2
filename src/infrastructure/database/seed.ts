/* eslint-disable no-console */
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { hash } from 'bcrypt';
import { randomBytes } from 'crypto';

/**
 * Seed script for ByteBerry OAuth2 Service.
 *
 * Creates initial test data for development and testing environments.
 * This script is idempotent - it can be run multiple times safely.
 *
 * Security considerations:
 * - Passwords are hashed using bcrypt with salt rounds
 * - Client secrets are generated randomly if not provided via environment
 * - Never use these credentials in production
 * - All sensitive data should come from environment variables in production
 *
 * @example
 * // Development
 * pnpm db:seed
 *
 * // With custom credentials
 * SEED_USER_PASSWORD=mypassword SEED_CLIENT_SECRET=mysecret pnpm db:seed
 */

// =============================================================================
// Database Connection (same pattern as DataBaseConfig)
// =============================================================================

function createPrismaClient(): { prisma: PrismaClient; pool: Pool } {
	const connectionString = process.env.DATABASE_URL;

	if (!connectionString) {
		throw new Error('DATABASE_URL environment variable is required');
	}

	const pool = new Pool({
		connectionString,
		min: 2,
		max: 10,
	});

	const adapter = new PrismaPg(pool);
	const prisma = new PrismaClient({ adapter });

	return { prisma, pool };
}

const { prisma, pool } = createPrismaClient();

// =============================================================================
// Configuration from Environment (with secure defaults for development)
// =============================================================================

const BCRYPT_SALT_ROUNDS = 12;

const config = {
	user: {
		email: process.env.SEED_USER_EMAIL || 'test@byteberry.local',
		username: process.env.SEED_USER_USERNAME || 'testuser',
		password: process.env.SEED_USER_PASSWORD || 'Test123!@#',
	},
	client: {
		clientId: process.env.SEED_CLIENT_ID || 'byteberry-dev-client',
		clientName: process.env.SEED_CLIENT_NAME || 'ByteBerry Development Client',
		clientSecret: process.env.SEED_CLIENT_SECRET || null,
		redirectUris: (process.env.SEED_REDIRECT_URIS || 'http://localhost:5173/callback,http://localhost:4003/callback').split(','),
		grantTypes: ['authorization_code', 'refresh_token'],
		isPublic: process.env.SEED_CLIENT_IS_PUBLIC !== 'false',
	},
};

// =============================================================================
// Seed Functions
// =============================================================================

/**
 * Creates or updates the test user.
 * Uses upsert to make the script idempotent.
 */
async function seedUser(): Promise<string> {
	const passwordHash = await hash(config.user.password, BCRYPT_SALT_ROUNDS);

	const user = await prisma.user.upsert({
		where: { email: config.user.email },
		update: {
			username: config.user.username,
			password: passwordHash,
		},
		create: {
			email: config.user.email,
			username: config.user.username,
			password: passwordHash,
		},
	});

	console.log(`✅ User seeded: ${user.email} (ID: ${user.id})`);
	return user.id;
}

/**
 * Creates or updates the test OAuth client.
 * Generates a random client secret if not provided and client is confidential.
 */
async function seedOAuthClient(): Promise<string> {
	let clientSecret: string | null = null;

	if (!config.client.isPublic) {
		clientSecret = config.client.clientSecret || randomBytes(32).toString('hex');
	}

	const client = await prisma.oAuthClient.upsert({
		where: { clientId: config.client.clientId },
		update: {
			clientName: config.client.clientName,
			clientSecret,
			redirectUris: config.client.redirectUris,
			grantTypes: config.client.grantTypes,
			isPublic: config.client.isPublic,
		},
		create: {
			clientId: config.client.clientId,
			clientName: config.client.clientName,
			clientSecret,
			redirectUris: config.client.redirectUris,
			grantTypes: config.client.grantTypes,
			isPublic: config.client.isPublic,
		},
	});

	console.log(`✅ OAuth Client seeded: ${client.clientName}`);
	console.log(`   Client ID: ${client.clientId}`);
	console.log(`   Is Public: ${client.isPublic}`);
	console.log(`   Redirect URIs: ${client.redirectUris.join(', ')}`);
	console.log(`   Grant Types: ${client.grantTypes.join(', ')}`);

	if (!config.client.isPublic && clientSecret && !config.client.clientSecret) {
		console.log(`   ⚠️  Generated Client Secret: ${clientSecret}`);
		console.log(`   ⚠️  Save this secret - it won't be shown again!`);
	}

	return client.id;
}

/**
 * Cleans up expired auth codes (maintenance task).
 */
async function cleanupExpiredAuthCodes(): Promise<void> {
	const result = await prisma.authCode.deleteMany({
		where: {
			expiresAt: { lt: new Date() },
		},
	});

	if (result.count > 0) {
		console.log(`🧹 Cleaned up ${result.count} expired auth codes`);
	}
}

// =============================================================================
// Main Execution
// =============================================================================

async function main(): Promise<void> {
	console.log('🌱 Starting ByteBerry OAuth2 seed...\n');
	console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
	console.log('─'.repeat(50));

	// Warn if running in production
	if (process.env.NODE_ENV === 'production') {
		console.warn('\n⚠️  WARNING: Running seed in production environment!');
		console.warn('   Make sure you know what you are doing.\n');

		if (!process.env.SEED_CONFIRM_PRODUCTION) {
			console.error('❌ Set SEED_CONFIRM_PRODUCTION=true to run in production');
			process.exit(1);
		}
	}

	try {
		await seedUser();
		await seedOAuthClient();
		await cleanupExpiredAuthCodes();

		console.log('\n' + '─'.repeat(50));
		console.log('✅ Seed completed successfully!\n');

		// Print test credentials for development
		if (process.env.NODE_ENV !== 'production') {
			console.log('📋 Test Credentials:');
			console.log(`   Email: ${config.user.email}`);
			console.log(`   Password: ${config.user.password}`);
			console.log(`   Client ID: ${config.client.clientId}`);
			console.log(`   Redirect URI: ${config.client.redirectUris[0]}`);
		}
	} catch (error) {
		console.error('❌ Seed failed:', error);
		throw error;
	}
}

main()
	.catch((e) => {
		console.error(e);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
		await pool.end();
	});
