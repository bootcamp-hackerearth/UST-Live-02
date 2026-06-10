const express = require("express");

const authMiddleware = require("../middleware/auth.middleware");
const roleMiddleware = require("../middleware/role.middleware");
const validateMiddleware = require("../middleware/validate.middleware");

const {
  registerEmployeeValidation,
} = require("../validations/employee.validation");

const {
  createEmployee,
  getEmployees,
  getEmployeeById,
  updateEmployee,
  deactivateEmployee,
  getDoctors,
  activateEmployee,
  getPendingEmployees,
  updateDoctorAvailability,
  getDoctorAvailability,
  approveEmployee,
  rejectEmployee,
} = require("../controllers/employee.controller");

const router = express.Router();

// Create a new employee
router.post(
  "/",
  authMiddleware,
  roleMiddleware("ADMIN"),
  registerEmployeeValidation,
  validateMiddleware,
  createEmployee
);

// Get all doctors
router.get(
  "/doctors",
  getDoctors
);

// Get doctor's availability
router.get(
  "/doctor/availability",
  authMiddleware,
  getDoctorAvailability
);

// Update doctor's availability
router.patch(
  "/doctor/availability",
  authMiddleware,
  updateDoctorAvailability
);

// Get all employees
router.get(
  "/",
  authMiddleware,
  roleMiddleware("ADMIN"),
  getEmployees
);

// Get pending employee approvals
router.get(
  "/pending-employees",
  authMiddleware,
  getPendingEmployees
);

// Approve employee registration
router.patch(
  "/:id/approve-employee",
  authMiddleware,
  approveEmployee
);

// Reject employee registration
router.patch(
  "/:id/reject-employee",
  authMiddleware,
  rejectEmployee
);

// Deactivate employee account
router.patch(
  "/:id/deactivate",
  authMiddleware,
  roleMiddleware("ADMIN"),
  deactivateEmployee
);

// Get employee details by ID
router.get(
  "/:id",
  authMiddleware,
  roleMiddleware("ADMIN"),
  getEmployeeById
);

// Update employee information
router.put(
  "/:id",
  authMiddleware,
  roleMiddleware("ADMIN"),
  updateEmployee
);

// Activate employee account
router.patch(
  "/:id/activate",
  authMiddleware,
  roleMiddleware("ADMIN"),
  activateEmployee
);

module.exports = router;