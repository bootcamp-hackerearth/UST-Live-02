const express = require('express');
const router = express.Router();
const userController = require('../controller/user.controller')
const validate = require('../middleware/validate')
const authMiddleware = require('../middleware/authMiddleware');
const authValidator = require('../validation/authValidation');
const authRoles = require('../middleware/authRoles');
const permissions = require('../utils/permissions');


router.post('/create',
    authMiddleware,
    authRoles(permissions.ADD_EMPLOYEE),
    authValidator.validateSignUp,
    validate,
    userController.createEmployee);

router.get("/profile",
    authMiddleware,
    userController.getCurrentProfile);



module.exports = router;




