
const express = require('express');

const router = express.Router();

const doctorController=require('../controller/doctor.controller')
const authMiddleware=require('../middleware/authMiddleware')
const authRoles=require('../middleware/authRoles')
const permissions=require('../utils/permissions')
const validate=require('../middleware/validate')
const doctorValidator=require('../validation/doctor.validation')


router.post(
    '/create',
    authMiddleware,
    authRoles(permissions.ADD_DOCTOR),
    doctorValidator.validateCreateDoctor,
    validate,
    doctorController.createDoctorByAdmin
);

router.get(
    '/list',
    authMiddleware,
    authRoles(permissions.VIEW_DOCTOR),
    doctorController.getAllDoctors
);


router.put(
    "/update/:doctorId",
    authMiddleware,
    authRoles(permissions.UPDATE_DOCTOR),
    doctorController.updateDoctor
);
module.exports=router;