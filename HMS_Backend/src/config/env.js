const logger = require("../utils/logger");

const requiredEnvVars = [
  "MONGO_URI",
  "JWT_SECRET",
  "JWT_REFRESH_SECRET",
  "JWT_ACCESS_EXPIRES_IN",
  "JWT_REFRESH_EXPIRES_IN",
];

const validateEnv = () => {
  const missing = requiredEnvVars.filter((key) => !process.env[key]);
  const weakSecrets = ["JWT_SECRET", "JWT_REFRESH_SECRET"].filter(
    (key) => process.env[key] && process.env[key].length < 32,
  );
  const isProduction = process.env.NODE_ENV === "production";

  if (missing.length || weakSecrets.length) {
    const details = {
      missing,
      weakSecrets,
    };

    if (isProduction) {
      throw new Error(
        `Invalid environment configuration: ${JSON.stringify(details)}`,
      );
    }

    logger.warn("Environment configuration should be tightened", details);
  }

  if (
    process.env.TOKEN_BLACKLIST_ENABLED === "true" &&
    process.env.REDIS_REQUIRED === "true" &&
    !process.env.REDIS_URL
  ) {
    const message =
      "REDIS_URL is required when TOKEN_BLACKLIST_ENABLED is enabled and REDIS_REQUIRED is true";

    if (isProduction) {
      throw new Error(message);
    }

    logger.warn(message);
  }
};

module.exports = {
  validateEnv,
};
