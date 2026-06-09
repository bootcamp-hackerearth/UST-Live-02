const express = require("express");
const router = express.Router();
const { param } = require("express-validator");
const validateRequest = require("../middlewares/validateRequest");
const authenticateRequest = require("../middlewares/authenticateRequest");
const requireRole = require("../middlewares/requireRole");
const controller = require("../controllers/adminController");
const {
  employeeBaseValidators,
  joiningDateValidator,
} = require("../validators/employeeValidators");
const { nameValidator } = require("../validators/sharedValidators");

router.use(authenticateRequest, requireRole("OWNER", "ADMIN"));

const employeeCreationValidation = [
  ...employeeBaseValidators,
  joiningDateValidator(),
];

const employeeCodeValidation = [
  param("employeeCode").notEmpty().withMessage("Employee Code is required"),
];

const employeeUpdateValidation = [
  ...employeeCodeValidation,
  nameValidator("name", "Name", { optional: true }),
];

const requestIdValidation = [
  param("requestId").notEmpty().withMessage("Request ID is required"),
];

router.post(
  "/create-employee",
  employeeCreationValidation,
  validateRequest,
  controller.createEmployee,
);

router.get("/employees", controller.getEmployees);

router.get(
  "/employees/:employeeCode",
  employeeCodeValidation,
  validateRequest,
  controller.getEmployee,
);

router.get("/pending-employees", controller.getPendingEmployees);

router.put(
  "/approve-employee/:employeeCode",
  employeeCodeValidation,
  validateRequest,
  controller.approveEmployee,
);

router.put(
  "/reject-employee/:employeeCode",
  employeeCodeValidation,
  validateRequest,
  controller.rejectEmployee,
);

router.put(
  "/update-employee/:employeeCode",
  employeeUpdateValidation,
  validateRequest,
  controller.updateEmployee,
);

router.delete(
  "/delete-employee/:employeeCode",
  employeeCodeValidation,
  validateRequest,
  controller.deleteEmployee,
);

router.get("/audit-logs", controller.getAuditLogs);

router.get("/profile-change-requests", controller.getProfileChangeRequests);

router.put(
  "/approve-profile-change/:requestId",
  requestIdValidation,
  validateRequest,
  controller.approveProfileChange,
);

router.put(
  "/reject-profile-change/:requestId",
  requestIdValidation,
  validateRequest,
  controller.rejectProfileChange,
);

module.exports = router;