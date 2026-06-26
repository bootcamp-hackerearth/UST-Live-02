const errorHandler = (error, req, res, next) => {
  let statusCode = error.statusCode || 500;
  let message = error.isOperational ? error.message : "Internal server error";

  if (error.code === "LIMIT_FILE_SIZE") {
    statusCode = 400;
    message = "Document file must be 10MB or smaller";
  }

  if (error.code === 11000) {
    statusCode = 409;
    const field = Object.keys(error.keyPattern || error.keyValue || {})[0];
    message = field
      ? `${field} already exists`
      : "Duplicate value already exists";
  }

  if (Array.isArray(error.errors) && error.errors.length > 0) {
    const firstError = error.errors[0];
    const fieldName = firstError.path || firstError.param;

    message = fieldName
      ? `${fieldName}: ${firstError.msg}`
      : firstError.msg || message;
  }

  const response = {
    success: false,
    message,
  };

  if (error.errorCode) {
    response.errorCode = error.errorCode;
  }

  if (error.errors) {
    response.errors = error.errors;
  }

  if (process.env.NODE_ENV !== "production") {
    console.error("ERROR:", error);
  }

  return res.status(statusCode).json(response);
};

module.exports = errorHandler;
