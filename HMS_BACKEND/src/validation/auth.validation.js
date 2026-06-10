const { body } = require('express-validator');

const validateLogin=[
    body("email").notEmpty().withMessage("Enter an Email").isEmail().withMessage("Enter a Valid email"),
    body("password").notEmpty().withMessage("Password is Required")
]
module.exports = { validateLogin };