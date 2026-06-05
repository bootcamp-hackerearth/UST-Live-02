const express = require("express");
const router = express.Router();
const { signupValidation } = require("../middlewares/auth.validation");
const { validate } = require("../middlewares/validator.middleware");
const { signup } = require("../controllers/user.controller");
const authorize = require("../middlewares/authorize.middleware");

router.post(
  "/signup",
  signupValidation,
  validate,
  authorize("CREATE_USER"),
  signup,
);

module.exports = router;
