const rateLimit = require("express-rate-limit");
const ApiError = require("../utils/ApiError");

const createRateLimitMiddleware = ({
  windowMs = 15 * 60 * 1000,
  maxRequests = 300,
} = {}) => {
  return rateLimit({
    windowMs,
    max: maxRequests,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res, next) => {
      next(
        new ApiError(429, "Too many requests", "RATE_LIMIT_EXCEEDED", {
          retryAfterSeconds: Math.ceil(windowMs / 1000),
        }),
      );
    },
  });
};

module.exports = createRateLimitMiddleware;
