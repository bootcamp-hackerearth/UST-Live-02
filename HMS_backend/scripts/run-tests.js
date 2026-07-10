const { spawnSync } = require("node:child_process");

const args = process.argv.slice(2);
const jestBin = require.resolve("jest/bin/jest");

const result = spawnSync(process.execPath, [jestBin, ...args], {
  stdio: "inherit",
  env: {
    ...process.env,
    NODE_ENV: "test",
    JWT_SECRET:
      process.env.JWT_SECRET || "test-jwt-secret-with-at-least-32-chars",
    JWT_REFRESH_SECRET:
      process.env.JWT_REFRESH_SECRET ||
      "test-refresh-secret-with-at-least-32-chars",
    JWT_ACCESS_EXPIRES_IN: process.env.JWT_ACCESS_EXPIRES_IN || "15m",
    JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || "7d",
    TOKEN_BLACKLIST_ENABLED: process.env.TOKEN_BLACKLIST_ENABLED || "false",
  },
});

process.exit(result.status ?? 1);
