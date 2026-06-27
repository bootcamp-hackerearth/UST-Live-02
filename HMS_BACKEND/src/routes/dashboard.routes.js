const express = require("express");

const authMiddleware = require("../middleware/auth.middleware");
const permissionMiddleware = require("../middleware/permission.middleware");

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
  permissionMiddleware("dashboard:admin-stats"),
  getAdminStats
);

// Get recently added employees
router.get(
  "/recent-employees",
  authMiddleware,
  permissionMiddleware("dashboard:recent-employees"),
  getRecentEmployees
);

// Get doctor dashboard statistics
router.get(
  "/doctor-stats",
  authMiddleware,
  permissionMiddleware("dashboard:doctor-stats"),
  getDoctorStats
);

// Get receptionist dashboard statistics
router.get(
  "/receptionist-stats",
  authMiddleware,
  permissionMiddleware("dashboard:receptionist-stats"),
  getReceptionistStats
);

// Get today's appointments
router.get(
  "/today-appointments",
  authMiddleware,
  permissionMiddleware("dashboard:today-appointments"),
  getTodayAppointments
);

module.exports = router;
