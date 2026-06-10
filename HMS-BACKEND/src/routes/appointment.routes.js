const express = require("express");

const router = express.Router();

const {
  getAvailableSlots,
  bookAppointment,
  getAppointments,
  deleteAppointment,
  getAppointmentById,
  updateAppointment,
  getDoctorQueue,
} = require("../controllers/appointment.controller");

const authMiddleware = require("../middleware/auth.middleware");
const roleMiddleware = require("../middleware/role.middleware");

// Get today's queue for a doctor
router.get(
  "/doctor-queue",
  authMiddleware,
  roleMiddleware("DOCTOR"),
  getDoctorQueue
);

// Get available slots for a doctor
router.get(
  "/available-slots",
  authMiddleware,
  getAvailableSlots
);

// Get all appointments
router.get(
  "/",
  authMiddleware,
  getAppointments
);

// Get appointment details by ID
router.get(
  "/:id",
  authMiddleware,
  getAppointmentById
);

// Book a new appointment
router.post(
  "/",
  authMiddleware,
  roleMiddleware("ADMIN", "RECEPTIONIST"),
  bookAppointment
);

// Update appointment details
router.put(
  "/:id",
  authMiddleware,
  roleMiddleware("ADMIN", "RECEPTIONIST"),
  updateAppointment
);

// Delete an appointment
router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware("ADMIN", "RECEPTIONIST"),
  deleteAppointment
);

module.exports = router;