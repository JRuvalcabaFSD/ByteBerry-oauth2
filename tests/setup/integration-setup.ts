/**
 * Global setup for integration tests
 * Configures environment variables and test conditions
 */

beforeAll(() => {
	// Configure environment for testing
	process.env.NODE_ENV = 'test';
	process.env.LOG_LEVEL = 'error'; // Minimize logging noise in tests
	process.env.LOG_REQUESTS = 'false'; // Disable request logging

	// Use test-specific configuration
	process.env.PORT = '0'; // Use random available port
});

beforeEach(() => {
	// Reset any test-specific state if needed
	// This runs before each test case
});

afterAll(() => {
	// Global cleanup if needed
	// Close any remaining connections, clear timers, etc.
});
