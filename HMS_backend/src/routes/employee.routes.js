const express = require("express");

const authMiddleware = require("../middleware/auth.middleware");
const nodePermissionMiddleware = require("../middleware/node-permission.middleware");
const validateMiddleware = require("../middleware/validate.middleware");

const {
  registerEmployeeValidation,
  updateEmployeeValidation,
} = require("../validations/employee.validation");
const {
  paginationQueryValidation,
} = require("../validations/common.validation");

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
  deleteEmployee,
} = require("../controllers/employee.controller");

const router = express.Router();

// Create Employee
router.post(
  "/",
  authMiddleware,
  nodePermissionMiddleware,
  registerEmployeeValidation,
  validateMiddleware,
  createEmployee,
);

// Doctors
router.get("/doctors", authMiddleware, nodePermissionMiddleware, getDoctors);

router.get(
  "/doctor/availability",
  authMiddleware,
  nodePermissionMiddleware,
  getDoctorAvailability,
);

router.patch(
  "/doctor/availability",
  authMiddleware,
  nodePermissionMiddleware,
  updateDoctorAvailability,
);

// Employee List
router.get(
  "/",
  authMiddleware,
  nodePermissionMiddleware,
  paginationQueryValidation,
  validateMiddleware,
  getEmployees,
);

// Pending Employees
router.get(
  "/pending-employees",
  authMiddleware,
  nodePermissionMiddleware,
  getPendingEmployees,
);

// Employee Approval
router.patch(
  "/:id/approve-employee",
  authMiddleware,
  nodePermissionMiddleware,
  approveEmployee,
);

router.patch(
  "/:id/reject-employee",
  authMiddleware,
  nodePermissionMiddleware,
  rejectEmployee,
);

// Employee Details
router.get("/:id", authMiddleware, nodePermissionMiddleware, getEmployeeById);

// Update Employee
router.put(
  "/:id",
  authMiddleware,
  nodePermissionMiddleware,
  updateEmployeeValidation,
  validateMiddleware,
  updateEmployee,
);

// Activate Employee
router.patch(
  "/:id/activate",
  authMiddleware,
  nodePermissionMiddleware,
  activateEmployee,
);

// Deactivate Employee
router.patch(
  "/:id/deactivate",
  authMiddleware,
  nodePermissionMiddleware,
  deactivateEmployee,
);

// Delete Employee
router.delete("/:id", authMiddleware, nodePermissionMiddleware, deleteEmployee);

module.exports = router;
