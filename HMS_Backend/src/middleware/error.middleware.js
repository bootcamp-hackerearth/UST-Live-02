const ApiError = require("../utils/ApiError");

const messageStatusMap = [
  {
    statusCode: 404,
    errorCode: "NOT_FOUND",
    matches: ["not found"],
  },
  {
    statusCode: 409,
    errorCode: "CONFLICT",
    matches: [
      "already exists",
      "already registered",
      "already booked",
      "already has",
      "already exists with",
    ],
  },
  {
    statusCode: 403,
    errorCode: "FORBIDDEN",
    matches: ["unauthorized", "access denied", "only super admin"],
  },
  {
    statusCode: 422,
    errorCode: "UNPROCESSABLE_ENTITY",
    matches: ["past date", "past dates", "cannot select past"],
  },
  {
    statusCode: 400,
    errorCode: "BAD_REQUEST",
    matches: [
      "required",
      "invalid",
      "cannot",
      "not available",
      "maximum",
      "only pending",
    ],
  },
];

const buildErrorPayload = (statusCode, message, errorCode, details) => ({
  success: false,
  message,
  errorCode,
  ...(details ? { details } : {}),
});

const getDuplicateField = (error) => Object.keys(error.keyPattern || {})[0];

const normalizeError = (error) => {
  if (error instanceof ApiError) {
    return {
      statusCode: error.statusCode,
      message: error.message,
      errorCode: error.errorCode,
      details: error.details,
    };
  }

  if (error?.name === "ValidationError") {
    return {
      statusCode: 400,
      message: error.message,
      errorCode: "VALIDATION_ERROR",
    };
  }

  if (error?.name === "CastError") {
    return {
      statusCode: 400,
      message: `Invalid ${error.path || "identifier"}`,
      errorCode: "INVALID_ID",
    };
  }

  if (error?.code === 11000) {
    const field = getDuplicateField(error);

    return {
      statusCode: 409,
      message: field ? `${field} already exists` : "Duplicate value",
      errorCode: "DUPLICATE_VALUE",
    };
  }

  if (error?.name === "JsonWebTokenError" || error?.name === "TokenExpiredError") {
    return {
      statusCode: 401,
      message: "Invalid or expired token",
      errorCode: "INVALID_TOKEN",
    };
  }

  if (error?.name === "MulterError") {
    return {
      statusCode: 400,
      message: error.message,
      errorCode: "UPLOAD_ERROR",
    };
  }

  const message = error?.message || "Internal Server Error";
  const mappedError = messageStatusMap.find(({ matches }) =>
    matches.some((text) => message.toLowerCase().includes(text)),
  );

  if (mappedError) {
    return {
      statusCode: mappedError.statusCode,
      message,
      errorCode: mappedError.errorCode,
    };
  }

  return {
    statusCode: 500,
    message,
    errorCode: "INTERNAL_SERVER_ERROR",
  };
};

const errorMiddleware = (error, req, res, next) => {
  console.error(error);

  const normalizedError = normalizeError(error);

  return res
    .status(normalizedError.statusCode)
    .json(
      buildErrorPayload(
        normalizedError.statusCode,
        normalizedError.message,
        normalizedError.errorCode,
        normalizedError.details,
      ),
    );
};

module.exports = errorMiddleware;
