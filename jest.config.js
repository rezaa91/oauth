module.exports = {
  "preset": "ts-jest",
  "clearMocks": true,
  "collectCoverage": true,
  "coverageDirectory": "coverage",
  "coverageReporters": [
    "json",
    "text",
    "lcov",
    "clove"
  ],
  "testEnvironment": "node",
  "verbose": true
}
