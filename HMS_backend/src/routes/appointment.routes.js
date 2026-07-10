const express = require("express");

const router = express.Router();

const ROLES = require("../constants/roles");

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
  getMyAppointmentById,
  getPendingAppointments,
  approveAppointment,
  rejectAppointment,
  updateMyAppointment,
  cancelMyAppointment,
} = require("../controllers/appointment.controller");

const authMiddleware = require("../middleware/auth.middleware");
const roleMiddleware = require("../middleware/role.middleware");
const nodePermissionMiddleware = require("../middleware/node-permission.middleware");
const validateMiddleware = require("../middleware/validate.middleware");
const {
  paginationQueryValidation,
} = require("../validations/common.validation");
const {
  createAppointmentValidation,
  updateAppointmentValidation,
  updateMyAppointmentValidation,
  getAvailableSlotsValidation,
} = require("../validations/appointment.validation");

// Get today's queue for a doctor
router.get(
  "/doctor-queue",
  authMiddleware,
  nodePermissionMiddleware,
  getDoctorQueue,
);

// Get available slots
router.get(
  "/available-slots",
  authMiddleware,
  nodePermissionMiddleware,
  getAvailableSlotsValidation,
  validateMiddleware,
  getAvailableSlots,
);

// Get all appointments
router.get(
  "/",
  authMiddleware,
  nodePermissionMiddleware,
  paginationQueryValidation,
  validateMiddleware,
  getAppointments,
);

// Patient books appointment
router.post(
  "/patient/book",
  authMiddleware,
  nodePermissionMiddleware,
  roleMiddleware(ROLES.PATIENT),
  createAppointmentValidation,
  validateMiddleware,
  bookPatientAppointment,
);

// Patient appointments
router.get(
  "/my",
  authMiddleware,
  nodePermissionMiddleware,
  roleMiddleware(ROLES.PATIENT),
  paginationQueryValidation,
  validateMiddleware,
  getMyAppointments,
);

router.get(
  "/my/:id",
  authMiddleware,
  nodePermissionMiddleware,
  roleMiddleware(ROLES.PATIENT),
  getMyAppointmentById,
);

// Pending appointments
router.get(
  "/pending",
  authMiddleware,
  nodePermissionMiddleware,
  getPendingAppointments,
);

// Approve appointment
router.patch(
  "/:id/approve",
  authMiddleware,
  nodePermissionMiddleware,
  approveAppointment,
);

// Reject appointment
router.patch(
  "/:id/reject",
  authMiddleware,
  nodePermissionMiddleware,
  rejectAppointment,
);

// Patient update own appointment
router.put(
  "/my/:id",
  authMiddleware,
  nodePermissionMiddleware,
  roleMiddleware(ROLES.PATIENT),
  updateMyAppointmentValidation,
  validateMiddleware,
  updateMyAppointment,
);

// Patient cancel own appointment
router.patch(
  "/my/:id/cancel",
  authMiddleware,
  nodePermissionMiddleware,
  roleMiddleware(ROLES.PATIENT),
  cancelMyAppointment,
);

// Get appointment by id
router.get(
  "/:id",
  authMiddleware,
  nodePermissionMiddleware,
  getAppointmentById,
);

// Book appointment (Admin/Receptionist/Super Admin)
router.post(
  "/",
  authMiddleware,
  nodePermissionMiddleware,
  createAppointmentValidation,
  validateMiddleware,
  bookAppointment,
);

// Update appointment
router.put(
  "/:id",
  authMiddleware,
  nodePermissionMiddleware,
  updateAppointmentValidation,
  validateMiddleware,
  updateAppointment,
);

// Delete appointment
router.delete(
  "/:id",
  authMiddleware,
  nodePermissionMiddleware,
  deleteAppointment,
);

module.exports = router;
