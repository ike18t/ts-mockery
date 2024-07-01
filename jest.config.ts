import type { Config } from 'jest';

export default async (): Promise<Config> => ({
  collectCoverage: true,
  coveragePathIgnorePatterns: ['<rootDir>/lib/spy-adapters/jasmine-adapter.ts'],
  roots: ['<rootDir>/lib'],
  transform: {
    '^.+\\.ts$': 'ts-jest'
  },
  restoreMocks: true,
  testRegex: '(.*\\.spec)\\.ts$',
  setupFiles: ['./jest-setup.ts'],
  moduleFileExtensions: ['ts', 'js']
});
