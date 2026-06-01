/** @type {import('jest').Config} */
export default {
  preset: "ts-jest/presets/default-esm",
  testEnvironment: "node",
  extensionsToTreatAsEsm: [".ts"],
  moduleNameMapper: {
    "^(\\.{1,2}/.*)\\.js$": "$1",
  },
  transform: {
    "^.+\\.tsx?$": [
      "ts-jest",
      {
        useESM: true,
        tsconfig: "tsconfig.test.json",
      },
    ],
  },
  moduleFileExtensions: ["ts", "js"],
  testMatch: ["**/tests/**/*.test.ts"],
  setupFilesAfterEnv: ["<rootDir>/tests/setup.ts"],
  maxWorkers: 1,
  testTimeout: 30000,
  collectCoverageFrom: [
    "src/controllers/**/*.ts",
    "src/services/**/*.ts",
    "!src/services/emailService.ts",
    "src/middlewares/**/*.ts",
    "src/validations/**/*.ts",
    "src/utils/response.ts",
    "src/utils/errorHandler.ts",
    "src/utils/token.ts",
    "!src/**/*.d.ts",
  ],
  coverageDirectory: "coverage",
  coverageThreshold: {
    global: {
      branches: 45,
      functions: 75,
      lines: 75,
      statements: 75,
    },
    "./src/services/": {
      branches: 60,
      functions: 90,
      lines: 90,
      statements: 90,
    },
    "./src/controllers/": {
      branches: 50,
      functions: 95,
      lines: 95,
      statements: 95,
    },
  },
  verbose: true,
};
