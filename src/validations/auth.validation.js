const { body } = require("express-validator");
const loginValidation = [
  body("loginId").notEmpty().withMessage("Email/EmpId is required"),
  body("password").notEmpty().withMessage("Password is required"),
];
const createPasswordValidation = [
  body("loginId").notEmpty().withMessage("Login ID is required"),

  body("temporaryPassword")
    .notEmpty()
    .withMessage("Temporary password is required"),

  body("newPassword")
    .notEmpty()
    .withMessage("New password is required")
    .isLength({ min: 8, max: 20 })
    .withMessage("Password must be between 8 and 20 characters")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/)
    .withMessage(
      "Password must contain uppercase, lowercase, number and special character",
    ),
  body("securityQuestion")
    .trim()
    .notEmpty()
    .withMessage("Security question is required"),
  body("securityAnswer")
    .trim()
    .notEmpty()
    .withMessage("Security answer is required")
    .isLength({ min: 2, max: 100 })
    .withMessage("Security answer must be between 2 and 100 characters"),
];
module.exports = { loginValidation, createPasswordValidation };
