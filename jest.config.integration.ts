import type { Config } from 'jest';
import { pathsToModuleNameMapper } from 'ts-jest';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const { compilerOptions } = require('./tsconfig.json');

const config: Config = {
  // Extiende configuración base
  preset: 'ts-jest',
  testEnvironment: 'node',

  // Root y roots
  rootDir: '.',
  roots: ['<rootDir>/tests/integration', '<rootDir>/tests/helpers'],

  // SOLO tests de integración
  testMatch: ['**/tests/integration/**/*.test.ts', '!**/tests/unit/**'],

  // Transform TypeScript
  transform: {
    '^.+\\.ts$': [
      'ts-jest',
      {
        tsconfig: 'tsconfig.json',
      },
    ],
  },

  // Module mappings
  moduleFileExtensions: ['ts', 'js', 'json'],
  moduleNameMapper: {
    ...pathsToModuleNameMapper(compilerOptions?.paths ?? {}, {
      prefix: '<rootDir>/',
    }),
    '^generated/prisma/(.*)$': '<rootDir>/generated/prisma/$1',
  },

  // Setup y teardown globales
  globalSetup: '<rootDir>/tests/setup.integration.ts',
  globalTeardown: '<rootDir>/tests/teardown.integration.ts',

  // Setup por test file
  setupFilesAfterEnv: ['<rootDir>/tests/helpers/jest-setup.integration.ts'],

  // Coverage (opcional para integration tests)
  collectCoverage: false, // Generalmente no medimos coverage en integration tests

  // Timeouts más largos (DB puede ser lenta)
  testTimeout: 30000, // 30 segundos

  // Clear mocks entre tests
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,

  // Verbose output
  verbose: true,

  // Detectar memory leaks
  detectOpenHandles: true,
  forceExit: true,
};

export default config;
