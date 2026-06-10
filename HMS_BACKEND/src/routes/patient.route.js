const express = require('express');
const router = express.Router();

const authMiddleware = require('../middleware/authMiddleware');
const authRoles = require('../middleware/authRoles');
const permissions = require('../utils/permissions');
const patientController=require('../controller/patient.controller');
const {validateCreatePatient}=require('../validation/patient.validation')


router.post('/create',
    authMiddleware,
    authRoles(permissions.ADD_PATIENT),
    validateCreatePatient,
    patientController.createPatient
);

router.get('/list',
    authMiddleware,
    authRoles(permissions.VIEW_PATIENT),
     patientController.getAllPatients);

module.exports = router;