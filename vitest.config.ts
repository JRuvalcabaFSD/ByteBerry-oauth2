import { defineConfig } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
	test: {
		globals: true,
		environment: 'node',
		include: ['tests/**/*.test.ts'],
		coverage: {
			provider: 'v8',
			enabled: true,
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
				'src/main.ts', // si tienes un entrypoint
				'src/index.ts',
				'tests/**',
			],
			reporter: ['text', 'html', 'clover', 'json', 'lcov'],
		},
	},
	plugins: [tsconfigPaths()],
});
