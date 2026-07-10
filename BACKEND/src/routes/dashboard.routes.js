const express = require("express");

const authMiddleware = require("../middleware/auth.middleware");
const nodePermissionMiddleware = require("../middleware/node-permission.middleware");

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
  nodePermissionMiddleware,
  getAdminStats,
);

// Get recently added employees
router.get(
  "/recent-employees",
  authMiddleware,
  nodePermissionMiddleware,
  getRecentEmployees,
);

// Get doctor dashboard statistics
router.get(
  "/doctor-stats",
  authMiddleware,
  nodePermissionMiddleware,
  getDoctorStats,
);

// Get receptionist dashboard statistics
router.get(
  "/receptionist-stats",
  authMiddleware,
  nodePermissionMiddleware,
  getReceptionistStats,
);

// Get today's appointments
router.get(
  "/today-appointments",
  authMiddleware,
  nodePermissionMiddleware,
  getTodayAppointments,
);

module.exports = router;
