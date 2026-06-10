const express = require("express");

const authMiddleware = require("../middleware/auth.middleware");

const {
  getAdminStats,
  getRecentEmployees,
  getDoctorStats,
  getReceptionistStats,
  getTodayAppointments,
} = require("../controllers/dashboard.controller");

const router = express.Router();

// Get admin dashboard statistics
router.get(
  "/admin-stats",
  authMiddleware,
  getAdminStats
);

// Get recently added employees
router.get(
  "/recent-employees",
  authMiddleware,
  getRecentEmployees
);

// Get doctor dashboard statistics
router.get(
  "/doctor-stats",
  authMiddleware,
  getDoctorStats
);

// Get receptionist dashboard statistics
router.get(
  "/receptionist-stats",
  getReceptionistStats
);

// Get today's appointments
router.get(
  "/today-appointments",
  authMiddleware,
  getTodayAppointments
);

module.exports = router;