import { defineConfig, mergeConfig } from 'vitest/config';
import baseConfig from './vitest.config';

export default mergeConfig(
	baseConfig,
	defineConfig({
		test: {
			include: ['tests/integration/**/*.integration.test.ts'],
			setupFiles: ['./tests/setup/integration-setup.ts'],
		},
	})
);
