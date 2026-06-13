const express = require('express');

const router = express.Router();
const authValidator = require('../validation/auth.validation')

const validate = require('../middleware/validate');
const authMiddleware = require('../middleware/authMiddleware')

const authController=require('../controller/authController');



router.post('/login',
    authValidator.validateLogin,
    validate,
    authController.login)

router.post('/patientLogin',
    authValidator.validateLogin,
    validate,
    authController.patientLogin)

    console.log("authMiddleware type:", typeof authMiddleware);
console.log("changePassword type:", typeof authController.changePassword);


router.post('/change-password',
    authMiddleware,
    authController.changePassword
)

router.get('/verify-email/:token',
     authController.verifyEmail);

module.exports = router;