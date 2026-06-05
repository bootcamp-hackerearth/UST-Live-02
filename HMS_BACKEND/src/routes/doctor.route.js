const express = require('express');

const router = express.Router();
const permissions=require('../utils/permissions')
const doctorController = require('../controller/doctor.controller');
const authMiddleware = require('../middleware/authMiddleware');
const authRoles = require('../middleware/authRoles');
const validate = require('../middleware/validate')
const { validateCreateDoctor } = require('../validation/doctor.validation')
router.post(
    '/create',
    authMiddleware,
    authRoles(permissions.ADD_DOCTOR),
    validateCreateDoctor,
    validate,
    doctorController.createDoctor
);

module.exports = router;