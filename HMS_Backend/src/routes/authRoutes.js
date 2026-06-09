const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const validateRequest = require("../middlewares/validateRequest");
const authenticateRequest = require("../middlewares/authenticateRequest");
const controller = require("../controllers/authController");
const {
  employeeBaseValidators,
  joiningDateValidator,
} = require("../validators/employeeValidators");
const { emailValidator } = require("../validators/sharedValidators");
const { passwordStrengthValidator } = require("../validators/passwordValidator");

const selfRegisterValidation = [
  ...employeeBaseValidators,
  passwordStrengthValidator("password"),
  joiningDateValidator(),
];

const loginValidation = [
  emailValidator("email"),
  body("password").notEmpty().withMessage("Password is required"),
];

const changePasswordValidation = [
  body("currentPassword").notEmpty().withMessage("Current password is required"),
  passwordStrengthValidator("newPassword"),
  body("confirmPassword").notEmpty().withMessage("Confirm password is required"),
  body("confirmPassword").custom((value, { req }) => {
    if (value !== req.body.newPassword) {
      throw new Error("Passwords do not match");
    }
    return true;
  }),
];

const forgotPasswordValidation = [
  emailValidator("email"),
];

const resetPasswordValidation = [
  body("resetToken").notEmpty().withMessage("Reset token is required"),
  passwordStrengthValidator("newPassword"),
  body("confirmPassword").notEmpty().withMessage("Confirm password is required"),
  body("confirmPassword").custom((value, { req }) => {
    if (value !== req.body.newPassword) {
      throw new Error("Passwords do not match");
    }
    return true;
  }),
];

router.post("/login", loginValidation, validateRequest, controller.login);

router.post(
  "/self-register",
  selfRegisterValidation,
  validateRequest,
  controller.selfRegister,
);

router.put(
  "/change-password",
  authenticateRequest,
  changePasswordValidation,
  validateRequest,
  controller.changePassword,
);

router.post(
  "/forgot-password",
  forgotPasswordValidation,
  validateRequest,
  controller.forgotPassword,
);

router.post(
  "/reset-password",
  resetPasswordValidation,
  validateRequest,
  controller.resetPassword,
);

router.post("/logout", authenticateRequest, controller.logout);

router.get("/me", authenticateRequest, controller.me);

module.exports = router;