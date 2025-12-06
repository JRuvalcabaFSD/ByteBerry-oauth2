import { defineConfig } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
	test: {
		globals: true,
		environment: 'node',

		// Incluir tests unitarios e integración
		include: ['tests/unit/**/*.test.ts', 'tests/integration/**/*.integration.test.ts'],

		// Timeouts más largos para tests de integración
		testTimeout: 10000,
		hookTimeout: 10000,

		// Cobertura - deshabilitada por defecto para desarrollo
		coverage: {
			provider: 'v8',
			enabled: false, // Cambiado a false para que no se ejecute por defecto
			thresholds: {
				lines: 80,
				functions: 80,
				branches: 80,
				statements: 80,
			},
			include: ['src/**/*.{ts,tsx,js,jsx}'],
			exclude: [
				'**/*.d.ts',
				'**/*.config.{ts,js}',
				'src/app.ts', // Entry point
				'tests/**',
				'**/*.test.ts',
				'**/*.integration.test.ts',
			],
			reporter: ['text', 'html', 'clover', 'json', 'lcov'],
		},
	},
	plugins: [tsconfigPaths()],
});
