const jwt = require("jsonwebtoken");
const ApiError = require("../utils/ApiError");
const logger = require("../utils/logger");

const authMiddleware = (req, res, next) => {
  try {
    const authorizationHeader = req.headers.authorization;

    if (!authorizationHeader) {
      throw new ApiError(
        401,
        "Authorization token is required",
        "TOKEN_REQUIRED",
      );
    }

    const token = authorizationHeader.startsWith("Bearer ")
      ? authorizationHeader.split(" ")[1]
      : null;

    if (!token) {
      throw new ApiError(
        401,
        "Invalid authorization format",
        "INVALID_TOKEN_FORMAT",
      );
    }

    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decodedToken;

    next();
  } catch (error) {
    logger.warn("Authentication failed", {
      requestId: req.requestId,
      path: req.originalUrl,
      error,
    });

    next(
      error instanceof ApiError
        ? error
        : new ApiError(401, "Invalid or expired token", "INVALID_TOKEN"),
    );
  }
};

module.exports = authMiddleware;
