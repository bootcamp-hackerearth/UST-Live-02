const express = require("express");
const router = express.Router();
const { signup, login, getProfile, verifyEmail } = require("../controllers/authcontroller");
const authmiddleware = require("../middleware/authmiddleware");
const validate = require("../middleware/validate");
const { signupValidation, loginValidation } = require("../validation/authValidation");

// AUTH ROUTES

router.post("/signup", signupValidation, validate, signup);

router.post("/login", loginValidation, validate, login);

router.get("/me", authmiddleware, getProfile);

router.get("/verify-email/:token", verifyEmail);

module.exports = router;