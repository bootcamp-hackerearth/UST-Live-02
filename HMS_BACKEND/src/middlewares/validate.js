const { validationResult } = require("express-validator");

//CATCHES ALL ERRORS RETURNED BY VALIDATORS
function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array() });
  }
  next();
}

module.exports = validate;
