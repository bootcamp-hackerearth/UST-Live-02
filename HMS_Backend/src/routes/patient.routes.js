const express = require("express");

const router = express.Router();

const {
  createPatient,
  getPatients,
  getPatientById,
  updatePatient,
  registerPatientMobile,
  getProfile,
updateProfile,
getPatientDashboard
} = require("../controllers/patient.controller");

const authMiddleware = require("../middleware/auth.middleware");
const roleMiddleware = require("../middleware/role.middleware");
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
  roleMiddleware("ADMIN", "RECEPTIONIST"),
  createPatientValidation,
  validateMiddleware,
  createPatient
);

// Get all patients
router.get(
  "/",
  authMiddleware,
  getPatients
);
// get profile 
router.get(
  "/profile",
  authMiddleware,
  roleMiddleware("PATIENT"),
  getProfile
);

// update profile 
router.put(
  "/profile",
  authMiddleware,
  roleMiddleware("PATIENT"),
  updatePatientValidation,
  updateProfile
);

// Patient dashboard
router.get(
  "/dashboard",
authMiddleware,
roleMiddleware( "PATIENT"),
  getPatientDashboard
);
// Get patient details by ID
router.get(
  "/:id",
  authMiddleware,
  getPatientById
);

// Update patient information
router.put(
  "/:id",
  authMiddleware,
  roleMiddleware("ADMIN", "RECEPTIONIST"),
  updatePatientValidation,
  validateMiddleware,
  updatePatient
);
// Mobile register
router.post(
  "/register",
  registerPatientMobileValidation,
  validateMiddleware,
  registerPatientMobile
);



module.exports = router;