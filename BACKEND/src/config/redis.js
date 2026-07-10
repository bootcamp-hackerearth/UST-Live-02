const { createClient } = require("redis");
const logger = require("../utils/logger");

const isBlacklistEnabled = () => process.env.TOKEN_BLACKLIST_ENABLED === "true";

let redisClient = null;
let connectionPromise = null;

const getRedisClient = () => redisClient;

const connectRedis = async () => {
  if (!isBlacklistEnabled()) {
    logger.info("Redis token blacklist disabled");
    return null;
  }

  if (redisClient?.isOpen) {
    return redisClient;
  }

  if (connectionPromise) {
    return connectionPromise;
  }

  redisClient = createClient({
    url: process.env.REDIS_URL || "redis://localhost:6379",
    socket: {
      reconnectStrategy: false,
    },
  });

  let errorLogged = false;
  redisClient.on("error", (error) => {
    if (!errorLogged) {
      logger.warn("Redis client error", { error });
      errorLogged = true;
    }
  });

  connectionPromise = redisClient
    .connect()
    .then(() => {
      logger.info("Redis connected for token blacklist");
      return redisClient;
    })
    .catch((error) => {
      logger.warn("Redis connection failed; token blacklist unavailable", {
        error,
      });

      if (process.env.REDIS_REQUIRED === "true") {
        throw error;
      }

      redisClient = null;
      return null;
    })
    .finally(() => {
      connectionPromise = null;
    });

  return connectionPromise;
};

const disconnectRedis = async () => {
  if (redisClient?.isOpen) {
    await redisClient.quit();
  }
};

module.exports = {
  connectRedis,
  disconnectRedis,
  getRedisClient,
  isBlacklistEnabled,
};
