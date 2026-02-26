/** @type {import('jest').Config.InitialOptions} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/tools/test-setup.js'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/../$1/src',
  },
  collectCoverageFrom: [
    '../**/*.{ts,tsx}',
    '!../**/dist/**',
    '!../**/node_modules/**',
    '!../**/coverage/**'
  ],
  coverageDirectory: 'reports/coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  coverageThresholds: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  },
  testMatch: [
    '**/__tests__/**/*.test.(ts|tsx)',
    '**/*.test.(ts|tsx)'
  ],
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
    '/coverage/'
  ],
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest'
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  testTimeout: 10000,
  verbose: true,
  collectCoverageOnlyFrom: [
    '../**/*.{ts,tsx}',
    '!../**/node_modules/**',
    '!../**/dist/**'
  ],
  reporters: [
    'default',
    [
      'jest-junit',
      {
        outputDirectory: 'reports',
        outputName: 'junit.xml'
      }
    ]
  ],
  setupFiles: ['<rootDir>/tools/test-setup.js']
};
