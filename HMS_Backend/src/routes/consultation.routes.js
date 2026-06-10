const express = require("express");

const authMiddleware = require("../middleware/auth.middleware");
const validateMiddleware = require("../middleware/validate.middleware");

const {
  loginValidation,
  createPasswordValidation,
  forgotPasswordValidation,
  resetPasswordValidation,
  registerValidation,
} = require("../validations/auth.validation");

const {
  login,
  createPassword,
  getCurrentUser,
  forgotPassword,
  resetPassword,
  register,
} = require("../controllers/auth.controller");

const router = express.Router();

// Login user
router.post(
  "/login",
  loginValidation,
  validateMiddleware,
  login
);

// Create password for first login
router.post(
  "/create-password",
  createPasswordValidation,
  validateMiddleware,
  createPassword
);

// Get current user profile
router.get(
  "/me",
  authMiddleware,
  getCurrentUser
);

// Register a new employee
router.post(
  "/register",
  registerValidation,
  validateMiddleware,
  register
);

// Get security question for password reset
router.post(
  "/forgot-password",
  forgotPasswordValidation,
  validateMiddleware,
  forgotPassword
);

// Reset password
router.post(
  "/reset-password",
  resetPasswordValidation,
  validateMiddleware,
  resetPassword
);

module.exports = router;