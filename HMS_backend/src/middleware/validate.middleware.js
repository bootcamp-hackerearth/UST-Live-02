const { validationResult } = require("express-validator");
const ERR = require("../utils/errors");

const validateMiddleware = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
const error = ERR.validationFailed();
    error.errors = errors.array();
    return next(error);
  }

  next();
};

module.exports = validateMiddleware;