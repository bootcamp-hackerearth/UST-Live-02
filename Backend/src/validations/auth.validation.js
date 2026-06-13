const { body } = require("express-validator");

const registerValidation = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Full name is required")
    .matches(/^[A-Za-z ]+$/)
    .withMessage("Name can contain only alphabets and spaces")
    .isLength({ min: 2, max: 100 })
    .withMessage("Name must be between 2 and 100 characters"),

  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Please provide a valid email address"),

  body("phone")
    .notEmpty()
    .withMessage("Phone number is required")
    .matches(/^\d{10}$/)
    .withMessage("Phone number must contain exactly 10 digits"),

  body("gender").notEmpty().withMessage("Gender is required"),

  body("department").trim().notEmpty().withMessage("Department is required"),

  body("designation").trim().notEmpty().withMessage("Designation is required"),

  body("joiningDate")
    .notEmpty()
    .withMessage("Joining date is required")
    .isISO8601()
    .withMessage("Invalid joining date"),

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
        throw new Error("Confirm password does not match password");
      }
      return true;
    }),

  body("securityQuestion")
    .trim()
    .notEmpty()
    .withMessage("Security question is required"),

  body("securityAnswer")
    .trim()
    .notEmpty()
    .withMessage("Security answer is required"),
];

const loginValidation = [
  body("loginId").notEmpty().withMessage("Email/EmpId is required"),

  body("password").notEmpty().withMessage("Password is required"),
];

const createPasswordValidation = [
  body("loginId").trim().notEmpty().withMessage("Login ID is required"),

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

  body("confirmPassword")
    .notEmpty()
    .withMessage("Confirm password is required")
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error("Confirm password does not match new password");
      }
      return true;
    }),

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

// Forgot password validation
const forgotPasswordValidation = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Please provide a valid email address"),
];

// Reset password validation
const resetPasswordValidation = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Please provide a valid email address"),

  // body("securityAnswer")
  //   .trim()
  //   .notEmpty()
  //   .withMessage("Security answer is required")
  //   .isLength({ min: 2, max: 100 })
  //   .withMessage("Security answer must be between 2 and 100 characters"),

  body("newPassword")
    .notEmpty()
    .withMessage("New password is required")
    .isLength({ min: 8, max: 20 })
    .withMessage("Password must be between 8 and 20 characters")
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9])/)
    .withMessage(
      "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
    ),

  body("confirmPassword")
    .notEmpty()
    .withMessage("Confirm password is required")
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error("Confirm password does not match new password");
      }
      return true;
    }),
];

module.exports = {
  loginValidation,
  registerValidation,
  createPasswordValidation,
  forgotPasswordValidation,
  resetPasswordValidation,
};
