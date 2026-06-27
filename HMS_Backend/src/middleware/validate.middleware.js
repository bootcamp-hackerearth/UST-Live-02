const { validationResult } = require("express-validator");

const ApiError = require("../utils/ApiError");

const validateMiddleware = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return next(
      new ApiError(
        400,
        "Validation failed",
        "VALIDATION_ERROR",
        errors.array(),
      ),
    );
  }

  next();
};

module.exports = validateMiddleware;
