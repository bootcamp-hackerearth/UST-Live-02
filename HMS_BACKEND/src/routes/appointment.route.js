const express = require('express');
const router = express.Router();

const appointmentController = require('../controller/appointment.controller')

const {validateCreateAppointment}=require('../validation/appointment.validation')
const authMiddleware=require('../middleware/authMiddleware')

const authRoles=require('../middleware/authRoles')
const permissions=require('../utils/permissions')

// /api/appointments 

router.post(
    '/create',
    authMiddleware,
    authRoles(permissions.ADD_APPOINTMENT)
    ,
    validateCreateAppointment,
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

module.exports = router;