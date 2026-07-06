const express = require("express");
const router = express.Router();
const validate = require("../middlewares/validate");
const auth = require("../middlewares/authMiddleware");
const authorizeDesignation = require("../middlewares/authorizeDesignations");
const authorizeNode = require("../middlewares/authorizeNode");
const controller = require("../controllers/appointmentController");
const {
    createAppointmentValidation,
    bookedSlotsValidation,
    appointmentIdValidation,
    cancelAppointmentValidation
} = require("../validators/appointmentValidators");

// Module-level gate — only users whose node includes appointments can enter
router.use(auth, authorizeNode("/dashboard/appointments"));

// ── Authorization levels ──────────────────────────────────────────────────

// Only OWNER, ADMIN, RECEPTIONIST can manage all appointments
const RECEPTION_LEVEL = authorizeDesignation(
    "OWNER",
    "ADMIN",
    "RECEPTIONIST"
);

// Doctor only
const DOCTOR_LEVEL = authorizeDesignation("DOCTOR");

// ── Routes ────────────────────────────────────────────────────────────────

// Staff creates appointment directly as BOOKED
router.post(
    "/create-appointment",
    RECEPTION_LEVEL,
    createAppointmentValidation,
    validate,
    controller.createAppointment
);

// Doctor views only their own appointments
router.get(
    "/my",
    DOCTOR_LEVEL,
    controller.getMyAppointments
);

// Booked slots for date picker (reception + doctor for booking form)
router.get(
    "/booked-slots",
    RECEPTION_LEVEL,
    bookedSlotsValidation,
    validate,
    controller.getBookedSlots
);

// All appointments — RECEPTION only (doctors use /my instead)
router.get(
    "/",
    RECEPTION_LEVEL,
    controller.getAppointments
);

// Single appointment detail — reception + doctor (controller enforces ownership)
router.get(
    "/:appointmentId",
    appointmentIdValidation,
    validate,
    controller.getAppointmentById
);

// Update appointment — reception only
router.put(
    "/:appointmentId",
    RECEPTION_LEVEL,
    [...appointmentIdValidation, ...createAppointmentValidation],
    validate,
    controller.updateAppointment
);

// Cancel appointment — reception only
router.put(
    "/:appointmentId/cancel",
    RECEPTION_LEVEL,
    cancelAppointmentValidation,
    validate,
    controller.cancelAppointment
);

// Mark unattended — any staff with node access (controller enforces ownership for doctor)
router.put(
    "/:appointmentId/unattended",
    appointmentIdValidation,
    validate,
    controller.markUnattended
);

module.exports = router;