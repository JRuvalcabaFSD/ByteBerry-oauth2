import type { Config } from 'jest';

const config: Config = {
  // Preset for TypeScript
  preset: 'ts-jest',

  // Test environment
  testEnvironment: 'node',

  // Automatically clear mock calls, instances, contexts and results before every test
  clearMocks: true,

  // Indicates whether the coverage information should be collected while executing the test
  collectCoverage: true,

  // An array of glob patterns indicating a set of files for which coverage information should be collected
  collectCoverageFrom: [
    'src/**/*.{ts,js}',
    '!src/**/*.d.ts',
    '!src/**/*.test.{ts,js}',
    '!src/**/*.spec.{ts,js}',
    '!src/**/index.{ts,js}',
    '!src/**/*.interface.{ts,js}',
    '!src/**/app.{ts,js}',
  ],

  // The directory where Jest should output its coverage files
  coverageDirectory: 'coverage',

  // Indicates which provider should be used to instrument code for coverage
  coverageProvider: 'v8',

  // A list of reporter names that Jest uses when writing coverage reports
  coverageReporters: ['json', 'lcov', 'text', 'clover', 'html'],

  // An object that configures minimum threshold enforcement for coverage results
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },

  // The root directory that Jest should scan for tests and modules within
  rootDir: '.',

  // A list of paths to directories that Jest should use to search for files in
  roots: ['<rootDir>/src', '<rootDir>/tests'],

  // The glob patterns Jest uses to detect test files
  testMatch: ['**/tests/**/*.{ts,js}'],

  // A map from regular expressions to paths to transformers
  transform: {
    '^.+\\.ts$': [
      'ts-jest',
      {
        tsconfig: 'tsconfig.json', // Uses main config for Jest
      },
    ],
  },

  // Module file extensions
  moduleFileExtensions: ['ts', 'js', 'json'],

  // Module name mapping for path aliases
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@application$': '<rootDir>/src/application/index.ts',
    '^@config$': '<rootDir>/src/config/index.ts',
    '^@container$': '<rootDir>/src/container/index.ts',
    '^@domain$': '<rootDir>/src/domain/index.ts',
    '^@infrastructure$': '<rootDir>/src/infrastructure/index.ts',
    '^@interfaces$': '<rootDir>/src/interfaces/index.ts',
    '^@presentation$': '<rootDir>/src/presentation/index.ts',
    '^@shared$': '<rootDir>/src/shared/index.ts',
  },

  // Setup files after environment
  setupFilesAfterEnv: [],

  // Verbose output
  verbose: true,

  // Watch plugins for better development experience
  watchPlugins: ['jest-watch-typeahead/filename', 'jest-watch-typeahead/testname'],
};

export default config;
