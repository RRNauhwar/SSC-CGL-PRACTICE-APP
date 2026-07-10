import type { Config } from 'jest';

/**
 * Jest is the standard test runner for NestJS (decorator + DI friendly via
 * ts-jest). Vitest is reserved for the frontend and framework-agnostic
 * packages per the approved testing stack. This config runs unit tests
 * (`*.spec.ts`) located next to the code they cover.
 */
const config: Config = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'src',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.ts$': ['ts-jest', { tsconfig: '<rootDir>/../tsconfig.json' }],
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  collectCoverageFrom: ['**/*.ts', '!**/*.module.ts', '!**/main.ts', '!**/*.dto.ts'],
  coverageDirectory: '../coverage',
  testEnvironment: 'node',
  clearMocks: true,
};

export default config;
