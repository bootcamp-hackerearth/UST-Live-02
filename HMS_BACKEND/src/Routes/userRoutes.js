const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const allowRoles = require('../middleware/roleMiddleware');
const validate = require('../middleware/validate');
const { 
  signUp, 
  login, 
  getProfile, 
  resetPassword,
} = require('../controllers/employeeController');
const { 
  loginValidation, 
  adminSignupValidation,
} = require("../middleware/validations");
router.post("/login", loginValidation, validate, login);
router.post("/signup", auth, allowRoles("ADMIN", "OWNER"), adminSignupValidation, validate, signUp);
router.post("/reset-password", auth, loginValidation,resetPassword);
router.get("/profile", auth, getProfile);
module.exports = router;