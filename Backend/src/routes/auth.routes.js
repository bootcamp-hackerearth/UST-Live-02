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
  signupPatient,
} = require("../controllers/auth.controller");

const router = express.Router();

// Authenticate user and generate token
router.post("/login", loginValidation, validateMiddleware, login);

// Create password for first-time login
router.post(
  "/create-password",
  createPasswordValidation,
  validateMiddleware,
  createPassword,
);

router.post("/signupPatient", signupPatient);

// Get currently logged-in user
router.get("/me", authMiddleware, getCurrentUser);

// Self-registration for employees
router.post("/register", registerValidation, validateMiddleware, register);

// Get security question for password recovery
router.post(
  "/forgot-password",
  forgotPasswordValidation,
  validateMiddleware,
  forgotPassword,
);

// Reset password using security answer
router.post(
  "/reset-password",
  resetPasswordValidation,
  validateMiddleware,
  resetPassword,
);

module.exports = router;
