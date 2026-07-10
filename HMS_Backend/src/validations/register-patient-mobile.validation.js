const { body } = require("express-validator");

const registerPatientMobileValidation = [
  body("firstName")
    .trim()
    .notEmpty()
    .withMessage("First name is required")
    .matches(/^[A-Za-z\s'-]+$/)
    .withMessage("Invalid first name")
    .isLength({ min: 2, max: 50 })
    .withMessage("First name must be between 2 and 50 characters"),
  body("lastName")
    .trim()
    .notEmpty()
    .withMessage("Last name is required")
    .matches(/^[A-Za-z\s'-]+$/)
    .withMessage("Invalid last name")
    .isLength({ min: 2, max: 50 })
    .withMessage("Last name must be between 2 and 50 characters"),
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .normalizeEmail()
    .isEmail()
    .withMessage("Invalid email"),
  body("phone")
    .trim()
    .notEmpty()
    .withMessage("Phone number is required")
    .matches(/^\d{10}$/)
    .withMessage("Phone number must be 10 digits"),
  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 8, max: 20 })
    .withMessage("Password must be between 8 and 20 characters")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/)
    .withMessage(
      "Password must contain uppercase, lowercase, number and special character",
    ),
  body("confirmPassword")
    .notEmpty()
    .withMessage("Confirm password is required")
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error("Passwords do not match");
      }
      return true;
    }),
];

module.exports = {
  registerPatientMobileValidation,
};
