const express = require('express');
const router = express.Router();

const { signupValidation, loginValidation } = require('../validators/authValidator');
const {validate} = require('../middleware/validate')

const {
  register,
  login,
  getProfile,
  verifyEmail,
} = require('../controllers/authController');

const { protect } = require('../middleware/authMiddleware');

router.post('/register', signupValidation, validate, register);
router.post('/login', loginValidation, validate, login);
router.get('/getProfile', protect, getProfile);
router.get("/verify-email/:token", verifyEmail);

module.exports = router;