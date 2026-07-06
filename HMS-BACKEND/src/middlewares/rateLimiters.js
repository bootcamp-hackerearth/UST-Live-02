const rateLimit = require("express-rate-limit");
const AppError = require("../utils/AppError");
const STATUS = require("../constants/statusCodes");
const MESSAGES = require("../constants/messages");

// Creates a rate limiter with standardized error responses
const buildLimiter = ({ windowMs, limit, message }) => {
    // Skip rate limiting in test environment
    if (process.env.NODE_ENV === "test") {
        return (req, res, next) => next();
    }

    if (!Number.isInteger(windowMs) || windowMs <= 0) {
        throw new Error(
            "Rate limiter configuration error: windowMs must be a positive integer"
        );
    }

    if (!Number.isInteger(limit) || limit <= 0) {
        throw new Error(
            "Rate limiter configuration error: limit must be a positive integer"
        );
    }

    return rateLimit({
        windowMs,
        limit,
        standardHeaders: true,
        legacyHeaders: false,
        handler: (req, res, next) =>
            next(new AppError(STATUS.TOO_MANY_REQUESTS, message))
    });
};

const loginLimiter = buildLimiter({
    windowMs: 15 * 60 * 1000,
    limit: process.env.NODE_ENV === "test" ? 1000 : 10,
    message: MESSAGES.AUTH.TOO_MANY_ATTEMPTS
});

const passwordResetLimiter = buildLimiter({
    windowMs: 15 * 60 * 1000,
    limit: process.env.NODE_ENV === "test" ? 1000 : 5,
    message: MESSAGES.AUTH.TOO_MANY_REQUESTS
});

module.exports = { loginLimiter, passwordResetLimiter };
