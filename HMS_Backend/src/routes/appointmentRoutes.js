const express = require("express");
const router = express.Router();
const validateRequest = require("../middlewares/validateRequest");
const authenticateRequest = require("../middlewares/authenticateRequest");
const requireDesignation = require("../middlewares/requireDesignation");
const controller = require("../controllers/appointmentController");
const {
    createAppointmentValidation,
    bookedSlotsValidation,
    appointmentIdValidation,
    cancelAppointmentValidation
} = require("../validators/appointmentValidators");

router.use(authenticateRequest);

const RECEPTION_LEVEL = requireDesignation(
    "OWNER",
    "ADMIN",
    "RECEPTIONIST"
);

const DOCTOR_LEVEL = requireDesignation("DOCTOR");

const VIEW_LEVEL = requireDesignation(
    "OWNER",
    "ADMIN",
    "RECEPTIONIST",
    "DOCTOR"
);

router.post(
    "/create-appointment",
    RECEPTION_LEVEL,
    createAppointmentValidation,
    validateRequest,
    controller.createAppointment
);

router.get(
    "/my",
    DOCTOR_LEVEL,
    controller.getMyAppointments
);

router.get(
    "/booked-slots",
    RECEPTION_LEVEL,
    bookedSlotsValidation,
    validateRequest,
    controller.getBookedSlots
);

router.get(
    "/",
    VIEW_LEVEL,
    controller.getAppointments
);

router.get(
    "/:appointmentId",
    VIEW_LEVEL,
    appointmentIdValidation,
    validateRequest,
    controller.getAppointmentById
);

router.put(
    "/:appointmentId",
    RECEPTION_LEVEL,
    [...appointmentIdValidation, ...createAppointmentValidation],
    validateRequest,
    controller.updateAppointment
);

router.put(
    "/:appointmentId/cancel",
    RECEPTION_LEVEL,
    cancelAppointmentValidation,
    validateRequest,
    controller.cancelAppointment
);

router.put(
    "/:appointmentId/complete",
    DOCTOR_LEVEL,
    appointmentIdValidation,
    validateRequest,
    controller.completeAppointment
);

module.exports = router;