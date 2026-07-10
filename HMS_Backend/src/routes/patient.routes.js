const express = require("express");

const router = express.Router();

const authMiddleware = require("../middleware/auth.middleware");
const nodePermissionMiddleware = require("../middleware/node-permission.middleware");
const validateMiddleware = require("../middleware/validate.middleware");
const {
  paginationQueryValidation,
} = require("../validations/common.validation");

const {
  createPatient,
  getPatients,
  getPatientById,
  updatePatient,
  registerPatientMobile,
  getProfile,
  updateProfile,
  deletePatient,
  getPatientDashboard,
} = require("../controllers/patient.controller");

const {
  createPatientValidation,
  updatePatientValidation,
} = require("../validations/patient.validation");

const {
  registerPatientMobileValidation,
} = require("../validations/register-patient-mobile.validation");

// Create patient
router.post(
  "/",
  authMiddleware,
  nodePermissionMiddleware,
  createPatientValidation,
  validateMiddleware,
  createPatient,
);

// Get all patients
router.get(
  "/",
  authMiddleware,
  nodePermissionMiddleware,
  paginationQueryValidation,
  validateMiddleware,
  getPatients,
);

// Patient profile
router.get("/profile", authMiddleware, nodePermissionMiddleware, getProfile);

// Update patient profile
router.put(
  "/profile",
  authMiddleware,
  nodePermissionMiddleware,
  updatePatientValidation,
  validateMiddleware,
  updateProfile,
);

// Patient dashboard
router.get(
  "/dashboard",
  authMiddleware,
  nodePermissionMiddleware,
  getPatientDashboard,
);

// Get patient by id
router.get("/:id", authMiddleware, nodePermissionMiddleware, getPatientById);

// Update patient
router.put(
  "/:id",
  authMiddleware,
  nodePermissionMiddleware,
  updatePatientValidation,
  validateMiddleware,
  updatePatient,
);

// Mobile registration
router.post(
  "/register",
  registerPatientMobileValidation,
  validateMiddleware,
  registerPatientMobile,
);

// Delete patient
router.delete("/:id", authMiddleware, nodePermissionMiddleware, deletePatient);

module.exports = router;
