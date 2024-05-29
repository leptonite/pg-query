/** @type {import('jest').Config} */
module.exports = {
   roots: [
      "<rootDir>/src",
   ],
   collectCoverageFrom: [
      "**/*.ts",
      "!**/*.test.ts",
   ],
   testMatch: [
      "**/*.test.ts",
   ],
   transform: {
      '^.+\\.ts$': 'ts-jest',
   },
   testEnvironment: 'node',
}
