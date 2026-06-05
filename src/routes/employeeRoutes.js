const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const validate = require("../middleware/validate");
const auth = require("../middleware/authMiddleware");
const allowedRoles = require("../middleware/roleMiddleware");
const { signupValidation, loginValidation } = require("../middleware/employeeValidations");
const { signupEmployee, login, getProfile, resetPassword } = require("../controllers/employeeController");


router.post("/signup-employee", auth, allowedRoles("TECHNICIAN","ADMIN"), signupValidation, validate, signupEmployee);
router.post("/login", loginValidation, validate, login);
router.post("/reset-password", auth,loginValidation, resetPassword);
router.get("/profile", auth, getProfile);

module.exports = router;