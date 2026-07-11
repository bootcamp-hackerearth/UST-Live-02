const express = require("express");

const router = express.Router();
const authValidator = require("../validation/auth.validation");

const validate = require("../middleware/validate");
const authMiddleware = require("../middleware/authMiddleware");

const authController = require("../controller/authController");

router.post(
  "/login",
  authValidator.validateLogin,
  validate,
  authController.login,
);

router.post("/refresh-token", authController.refreshToken);

router.post("/logout", authController.logout);

router.post("/change-password", authMiddleware, authController.changePassword);
router.put(
  "/first-login/change-password",
  authMiddleware,
  authValidator
    .validateFirstLoginPasswordChange,
  validate,
  authController
    .changeFirstLoginPassword
);


router.get("/verify-email/:token", authController.verifyEmail);

router.post(
  "/forgot-password",
  authValidator.validateForgotPassword,
  validate,
  authController.forgotPassword,
);
 
router.post(
  "/reset-password/:token",
  authValidator.validateResetPassword,
  validate,
  authController.resetPassword
);

module.exports = router;
