const { validationResult } = require('express-validator');
/**
 * Validates the request body against the defined rules
 * @param {Object} req - The request object
 * @param {Object} res - The response object
 * @param {Function} next - The next middleware function
 * @returns {Function} The next middleware function or a JSON error response
 */
const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).json({ 
      errors: errors.array() 
    });
  }
  
  next();
};

module.exports = validate;