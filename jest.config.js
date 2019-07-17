module.exports = {
  roots: ['<rootDir>/src'],
  collectCoverage: true,
  coveragePathIgnorePatterns: [
    '<rootDir>/node_modules/',
    '<rootDir>/src/main.ts',
  ],
  collectCoverageFrom: ['src/**/*.ts'],
  coverageThreshold: {
    global: {
      branches: 100,
      functions: 100,
      lines: 100,
      statements: 100,
    },
  },
  // Enables jsdom canvas
  testEnvironment: 'jest-environment-jsdom-fourteen',
  moduleNameMapper: {
    '^ROOT/(.*)$': '<rootDir>/src/$1',
  },
  transform: {
    '^.+\\.tsx?$': 'ts-jest',
  },
}
