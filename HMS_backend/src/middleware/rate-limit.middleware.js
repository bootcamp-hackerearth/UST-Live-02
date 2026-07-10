const ApiError = require("../utils/ApiError");

const createRateLimitMiddleware = ({
  windowMs = 15 * 60 * 1000,
  maxRequests = 300,
} = {}) => {
  const buckets = new Map();

  const cleanup = () => {
    const now = Date.now();

    for (const [key, bucket] of buckets.entries()) {
      if (bucket.resetAt <= now) {
        buckets.delete(key);
      }
    }
  };

  return (req, res, next) => {
    cleanup();

    const key = req.ip || req.socket?.remoteAddress || "unknown";
    const now = Date.now();
    const current = buckets.get(key);

    if (!current || current.resetAt <= now) {
      buckets.set(key, {
        count: 1,
        resetAt: now + windowMs,
      });

      return next();
    }

    current.count += 1;

    if (current.count > maxRequests) {
      return next(
        new ApiError(429, "Too many requests", "RATE_LIMIT_EXCEEDED", {
          retryAfterSeconds: Math.ceil((current.resetAt - now) / 1000),
        }),
      );
    }

    return next();
  };
};

module.exports = createRateLimitMiddleware;
