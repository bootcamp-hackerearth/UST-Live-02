const {
  body,
} = require("express-validator");

const passwordValidation = body(
  "newPassword"
)
  .notEmpty()
  .withMessage(
    "New password is required"
  )
  .isLength({
    min: 8,
    max: 64,
  })
  .withMessage(
    "Password must be between 8 and 64 characters"
  )
  .matches(/[A-Z]/)
  .withMessage(
    "Password must contain at least one uppercase letter"
  )
  .matches(/[a-z]/)
  .withMessage(
    "Password must contain at least one lowercase letter"
  )
  .matches(/[0-9]/)
  .withMessage(
    "Password must contain at least one number"
  )
  .matches(/[^A-Za-z0-9]/)
  .withMessage(
    "Password must contain at least one special character"
  );

const validateLogin = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Enter an email")
    .isEmail()
    .withMessage(
      "Enter a valid email"
    ),

  body("password")
    .notEmpty()
    .withMessage(
      "Password is required"
    ),
];

const validateChangePassword = [
  body("oldPassword")
    .notEmpty()
    .withMessage(
      "Old password is required"
    ),

  passwordValidation,
];

const validateFirstLoginPasswordChange = [
  passwordValidation,

  body("confirmPassword")
    .notEmpty()
    .withMessage(
      "Confirm password is required"
    )
    .custom((value, { req }) => {
      if (
        value !== req.body.newPassword
      ) {
        throw new Error(
          "Passwords do not match"
        );
      }

      return true;
    }),
];

module.exports = {
  validateLogin,
  validateChangePassword,
  validateFirstLoginPasswordChange,
};