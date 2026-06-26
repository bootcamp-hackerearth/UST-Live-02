const express = require("express");

const authMiddleware = require("../middleware/auth.middleware");
const permissionMiddleware = require("../middleware/permission.middleware");
const validateMiddleware = require("../middleware/validate.middleware");

const {
  registerEmployeeValidation,
} = require("../validations/employee.validation");

const {
  createEmployee,
  getEmployees,
  getEmployeeById,
  updateEmployee,
  deleteEmployee,
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
  permissionMiddleware("employee:create"),
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
  permissionMiddleware("doctor:availability:view"),
  getDoctorAvailability
);

// Update doctor's availability
router.patch(
  "/doctor/availability",
  authMiddleware,
  permissionMiddleware("doctor:availability:update"),
  updateDoctorAvailability
);

// Get all employees
router.get(
  "/",
  authMiddleware,
  permissionMiddleware("employee:list"),
  getEmployees
);

// Get pending employee approvals
router.get(
  "/pending-employees",
  authMiddleware,
  permissionMiddleware("employee:pending-list"),
  getPendingEmployees
);

// Approve employee registration
router.patch(
  "/:id/approve-employee",
  authMiddleware,
  permissionMiddleware("employee:approve"),
  approveEmployee
);

// Reject employee registration
router.patch(
  "/:id/reject-employee",
  authMiddleware,
  permissionMiddleware("employee:reject"),
  rejectEmployee
);

// Deactivate employee account
router.patch(
  "/:id/deactivate",
  authMiddleware,
  permissionMiddleware("employee:deactivate"),
  deactivateEmployee
);

// Get employee details by ID
router.get(
  "/:id",
  authMiddleware,
  permissionMiddleware("employee:detail"),
  getEmployeeById
);

// Update employee information
router.put(
  "/:id",
  authMiddleware,
  permissionMiddleware("employee:update"),
  updateEmployee
);

// Soft delete employee
router.delete(
  "/:id",
  authMiddleware,
  permissionMiddleware("employee:delete"),
  deleteEmployee
);

// Activate employee account
router.patch(
  "/:id/activate",
  authMiddleware,
  permissionMiddleware("employee:activate"),
  activateEmployee
);

module.exports = router;
