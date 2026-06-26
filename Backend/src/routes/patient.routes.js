const express = require("express");

const router = express.Router();

const {
  createPatient,
  getPatients,
  getPatientById,
  updatePatient,
  deletePatient,
  registerPatientMobile,
  getProfile,
  updateProfile,
  getPatientDashboard,
} = require("../controllers/patient.controller");

const authMiddleware = require("../middleware/auth.middleware");
const permissionMiddleware = require("../middleware/permission.middleware");
const validateMiddleware = require("../middleware/validate.middleware");

const {
  createPatientValidation,
  updatePatientValidation,
} = require("../validations/patient.validation");
const {
  registerPatientMobileValidation,
} = require(
  "../validations/register-patient-mobile.validation"
);
// Register a new patient
router.post(
  "/",
  authMiddleware,
  permissionMiddleware("patient:create"),
  createPatientValidation,
  validateMiddleware,
  createPatient
);

// Get all patients
router.get(
  "/",
  authMiddleware,
  permissionMiddleware("patient:list"),
  getPatients
);
// get profile 
router.get(
  "/profile",
  authMiddleware,
  permissionMiddleware("patient:profile:view"),
  getProfile
);

// update profile 
router.put(
  "/profile",
  authMiddleware,
  permissionMiddleware("patient:profile:update"),
  updatePatientValidation,
  validateMiddleware,
  updateProfile
);

// Patient dashboard
router.get(
  "/dashboard",
  authMiddleware,
  permissionMiddleware("patient:dashboard"),
  getPatientDashboard
);
// Get patient details by ID
router.get(
  "/:id",
  authMiddleware,
  permissionMiddleware("patient:detail"),
  getPatientById
);

// Update patient information
router.put(
  "/:id",
  authMiddleware,
  permissionMiddleware("patient:update"),
  updatePatientValidation,
  validateMiddleware,
  updatePatient
);

// Soft delete patient
router.delete(
  "/:id",
  authMiddleware,
  permissionMiddleware("patient:delete"),
  deletePatient
);

// Mobile register
router.post(
  "/register",
  registerPatientMobileValidation,
  validateMiddleware,
  registerPatientMobile
);



module.exports = router;
