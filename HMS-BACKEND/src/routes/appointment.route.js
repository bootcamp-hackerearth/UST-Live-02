const express = require('express');
const router = express.Router();

const appointmentController = require('../controller/appointment.controller')

const {validateCreateAppointment}=require('../validation/appointment.validation')
const authMiddleware=require('../middleware/authMiddleware')
const validate=require('../middleware/validate')

const authRoles=require('../middleware/authRoles')
const permissions=require('../utils/permissions')

router.post(
    '/create',
    authMiddleware,
    authRoles(permissions.ADD_APPOINTMENT)
    ,
    validateCreateAppointment,
    validate,
    appointmentController.createAppointment
);

router.get(
    '/list',
    authMiddleware,
    authRoles(permissions.VIEW_APPOINTMENT),
    appointmentController.getAppointments
);

router.get('/available-slots',
    authMiddleware,
    appointmentController.getAvailableSlots
);

router.get(
  "/my-appointments",
  authMiddleware,
  authRoles(permissions.VIEW_APPOINTMENT),
  appointmentController.getMyAppointments
);

router.put(
    '/cancel/:appointmentId',
    authMiddleware,
    authRoles(permissions.CANCEL_APPOINTMENT),
    appointmentController.cancelAppointment
);

module.exports = router;