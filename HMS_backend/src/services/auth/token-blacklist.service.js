const { getRedisClient, isBlacklistEnabled } = require("../../config/redis");
const logger = require("../../utils/logger");

const BLACKLIST_PREFIX = "blacklist:access";

const getBlacklistKey = (jti) => `${BLACKLIST_PREFIX}:${jti}`;

const getRemainingTtlSeconds = (exp) => {
  if (!exp) {
    return 0;
  }

  return Math.max(exp - Math.floor(Date.now() / 1000), 0);
};

const blacklistAccessToken = async (decodedToken) => {
  if (!isBlacklistEnabled() || !decodedToken?.jti) {
    return;
  }

  const redis = getRedisClient();
  const ttlSeconds = getRemainingTtlSeconds(decodedToken.exp);

  if (!redis?.isOpen || ttlSeconds <= 0) {
    return;
  }

  await redis.set(getBlacklistKey(decodedToken.jti), "revoked", {
    EX: ttlSeconds,
  });
};

const isAccessTokenBlacklisted = async (decodedToken) => {
  if (!isBlacklistEnabled() || !decodedToken?.jti) {
    return false;
  }

  const redis = getRedisClient();

  if (!redis?.isOpen) {
    return false;
  }

  try {
    const value = await redis.get(getBlacklistKey(decodedToken.jti));

    return Boolean(value);
  } catch (error) {
    logger.warn("Token blacklist check failed", { error });

    if (process.env.REDIS_REQUIRED === "true") {
      throw error;
    }

    return false;
  }
};

module.exports = {
  blacklistAccessToken,
  isAccessTokenBlacklisted,
};
