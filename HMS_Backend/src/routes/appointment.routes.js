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
  bookPatientAppointment,
  getMyAppointments, 
  getPendingAppointments,
  approveAppointment,
  rejectAppointment,
  updateMyAppointment,
  cancelMyAppointment
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

//Patient book appointment 
router.post(
  "/patient/book",
  authMiddleware,
  roleMiddleware( "PATIENT"),
  bookPatientAppointment
);
// Only patients appointment 
router.get(
  "/my",
  authMiddleware,
  roleMiddleware("PATIENT"),
  getMyAppointments
);
//Pending appointments
router.get(
  "/pending",
  authMiddleware,
  roleMiddleware(
    "ADMIN",
    "RECEPTIONIST"
  ),
  getPendingAppointments
);
// Approve appointment 
router.patch(
  "/:id/approve",
  authMiddleware,
  roleMiddleware("ADMIN","RECEPTIONIST"),
  approveAppointment
);
// Reject appointment 
router.patch(
  "/:id/reject",
  authMiddleware,
  roleMiddleware("ADMIN", "RECEPTIONIST"),
  rejectAppointment
);
//update patient
router.put(
  "/my/:id",
  authMiddleware,
  roleMiddleware( "PATIENT"),
  updateMyAppointment
);
//cancel appointment
router.patch(
  "/my/:id/cancel",
  authMiddleware,
  roleMiddleware( "PATIENT"),
  cancelMyAppointment
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
  roleMiddleware("ADMIN", "RECEPTIONIST", "PATIENT"),
  deleteAppointment
);

module.exports = router;